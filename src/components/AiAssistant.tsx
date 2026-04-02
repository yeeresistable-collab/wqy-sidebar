import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  X,
  Minimize2,
  Maximize2,
  Globe,
  Mic,
  Paperclip,
  Send,
  Sparkles,
  History,
  Plus,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import avatarImg from "@/assets/ai-assistant-avatar.png";
import {
  getAssistantPlan,
  sceneConfigs,
  type AssistantMessage,
  type AssistantMessageAction,
  type AssistantScene,
  type AssistantSceneKey,
} from "@/lib/assistantEngine";

const GLOBAL_GREETING =
  "您好，我是智能助手。您可以随时问我政策制定、政策触达、政策兑现、政策评价相关的任何问题，我会帮您联动页面处理。";
const GLOBAL_PLACEHOLDER = "请输入政策相关问题，我来帮您联动页面";
const LEGACY_SCENE_PROMPTS = [
  "当前在政策制定页面。需要我帮您起草、检索政策，也可以直接问我触达、兑现或评价相关问题。",
  "当前在政策触达页面。需要推送什么政策，或也可以直接问我制定、兑现、评价相关问题。",
  "当前在政策兑现页面。需要查看哪些兑现指标或数据维度，也可以直接问我其他政策问题。",
  "当前在政策评价页面。需要评估哪项政策，或也可以直接问我制定、触达、兑现相关问题。",
];

type ProactiveHint = {
  text: string;
  actions?: AssistantMessageAction[];
};

type Conversation = {
  id: string;
  title: string;
  scene: AssistantSceneKey;
  updatedAt: number;
  messages: AssistantMessage[];
};

const STORAGE_KEY = "policy-assistant-conversations";
const CURRENT_KEY = "policy-assistant-current-id";

const createConversation = (scene: AssistantScene): Conversation => ({
  id: `${scene.key}-${Date.now()}`,
  title: "全局会话",
  scene: scene.key,
  updatedAt: Date.now(),
  messages: [{ role: "assistant", content: GLOBAL_GREETING }],
});

const loadConversations = (): Conversation[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    if (!Array.isArray(parsed)) return [];

    return parsed.map((conversation) => {
      const messages = Array.isArray(conversation.messages)
        ? conversation.messages.filter(
            (message) => !(message.role === "assistant" && LEGACY_SCENE_PROMPTS.includes(message.content)),
          )
        : [];

      return {
        ...conversation,
        title: conversation.title || "全局会话",
        messages: messages.length ? messages : [{ role: "assistant", content: GLOBAL_GREETING }],
      };
    });
  } catch {
    return [];
  }
};

const loadCurrentConversationId = () => {
  try {
    return window.localStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
};

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);

const resolveScene = (pathname: string): AssistantScene => {
  if (pathname.startsWith("/policy-writing")) return sceneConfigs.writing;
  if (pathname.startsWith("/policy-reach")) return sceneConfigs.reach;
  if (pathname.startsWith("/policy-evaluation") || pathname.startsWith("/policy-analysis")) return sceneConfigs.evaluation;
  return sceneConfigs.redeem;
};

const buildConversationTitle = (_scene: AssistantScene, messages: AssistantMessage[]) => {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content.trim();
  if (!firstUserMessage) return "全局会话";
  return firstUserMessage.length > 16 ? `${firstUserMessage.slice(0, 16)}...` : firstUserMessage;
};

export function AiAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const scene = useMemo(() => resolveScene(location.pathname), [location.pathname]);
  const [open, setOpen] = useState(true);
  const [maximized, setMaximized] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => loadCurrentConversationId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** 关闭状态下气泡提示，null 表示已关闭或无提示 */
  const [bubbleHint, setBubbleHint] = useState<ProactiveHint | null>(null);
  /** 已推送过的事件 key 集合，避免同一事件重复推送 */
  const pushedEventsRef = useRef<Set<string>>(new Set());

  const currentConversation = useMemo(
    () => conversations.find((item) => item.id === currentConversationId) ?? null,
    [conversations, currentConversationId],
  );

  const sortedHistory = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages, isThinking]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (currentConversationId) {
      window.localStorage.setItem(CURRENT_KEY, currentConversationId);
    }
  }, [currentConversationId]);

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
      setMaximized(false);
      setHistoryOpen(false);
    };

    window.addEventListener("policy-assistant:open", handleOpen);
    return () => window.removeEventListener("policy-assistant:open", handleOpen);
  }, []);

  useEffect(() => {
    if (!conversations.length) {
      const initialConversation = createConversation(scene);
      setConversations([initialConversation]);
      setCurrentConversationId(initialConversation.id);
      return;
    }

    if (currentConversation) {
      return;
    }

    setCurrentConversationId(sortedHistory[0]?.id ?? null);
  }, [scene, conversations.length, currentConversation, sortedHistory]);

  // ── 主动推送：路由切换 + 业务事件，均按条件触发 ────────────────
  useEffect(() => {
    /**
     * 推送一条提示到助手（打开时注入消息，关闭时显示气泡）
     * eventKey 用于去重，同一 key 只推送一次
     */
    const pushHint = (eventKey: string, hint: ProactiveHint) => {
      if (pushedEventsRef.current.has(eventKey)) return;
      pushedEventsRef.current.add(eventKey);

      if (open) {
        const msg: AssistantMessage = {
          role: "assistant",
          content: hint.text,
          actions: hint.actions,
        };
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? { ...conv, messages: [...conv.messages, msg], updatedAt: Date.now() }
              : conv,
          ),
        );
      } else {
        setBubbleHint(hint);
      }
    };

    // ── 1. 路由切换时的条件推送 ──────────────────────────────────
    const pathname = location.pathname;
    // 用「路径 + 当天日期」作为 key，同一天同一页面只推一次
    const today = new Date().toDateString();
    const routeKey = `route-${pathname}-${today}`;

    if (pathname.startsWith("/policy-writing/drafting") || pathname === "/policy-writing/drafting") {
      // 起草页：仅当 localStorage 里有已保存大纲且未完成起草时推送
      try {
        const saved = JSON.parse(localStorage.getItem("policy-draft-outline") ?? "null");
        const completed = localStorage.getItem("policy-draft-completed") === "1";
        if (saved && !completed) {
          pushHint(routeKey, {
            text: `「${saved.title}」的政策大纲已保存，您尚未完成起草，点击下方可继续。`,
            actions: [{ label: "继续起草", path: "/policy-writing/drafting" }],
          });
        }
      } catch { /* ignore */ }

    } else if (pathname.startsWith("/policy-writing/pre-evaluation")) {
      // 前评估页：仅当有已完成的前评估报告时推送
      try {
        const done = JSON.parse(localStorage.getItem("policy-pre-eval-done") ?? "null");
        if (done?.title) {
          pushHint(routeKey, {
            text: `「${done.title}」的政策前评估报告已生成完成，可点击查看。`,
            actions: [{ label: "查看报告", path: "/policy-writing/pre-evaluation" }],
          });
        }
      } catch { /* ignore */ }

    } else if (pathname === "/policy-writing" || (pathname.startsWith("/policy-writing") && !pathname.includes("/drafting") && !pathname.includes("/pre-evaluation"))) {
      // 政策制定首页：提示近期新政策发布
      pushHint(routeKey, {
        text: "北京市/国家近期有关于《促进新一代信息技术产业高质量发展若干政策措施》的新政策发布，点击下方可查看。",
        actions: [{ label: "查看政策", path: "/policy-writing/search", search: { query: "新一代信息技术" } }],
      });

    } else if (pathname.startsWith("/policy-reach")) {
      // 政策触达页：提示近期触达完成情况
      pushHint(routeKey, {
        text: "近期「高新技术企业认定奖励」事项已完成触达128次，可点击查看触达情况。",
        actions: [{ label: "查看触达情况", path: "/policy-reach" }],
      });

    } else if (pathname === "/" || pathname.startsWith("/policy-redeem")) {
      // 政策兑现页：提示新增评优事项
      pushHint(routeKey, {
        text: "新增「人工智能产业扶持」事项可以用于企业评优，可点击开始评测。",
        actions: [{ label: "开始评测", path: "/policy-analysis" }],
      });

    } else if (pathname.startsWith("/policy-analysis")) {
      // 政策亮点分析页：提示新增事项
      pushHint(routeKey, {
        text: "新增「人工智能产业扶持」事项可以用于企业评优，可点击开始评测。",
        actions: [{ label: "开始评测", path: "/policy-analysis" }],
      });

    } else if (pathname.startsWith("/policy-evaluation")) {
      // 政策评价页：提示有政策可评价
      pushHint(routeKey, {
        text: "《北京经开区产业发展促进办法》已发布超6个月，可点击对该政策进行汇总评价。",
        actions: [{
          label: "一键生成评价报告",
          path: "/policy-evaluation",
          search: { policy: "北京经开区产业发展促进办法", autostart: "1" },
        }],
      });
    }

    // ── 2. 业务事件监听（异步任务完成后推送）──────────────────────

    /** 大纲保存事件（由 PolicyDraftingFlow 发出） */
    const handleOutlineSaved = (e: Event) => {
      const detail = (e as CustomEvent<{ title: string; draftCompleted: boolean }>).detail;
      if (detail.draftCompleted) return;
      // 持久化"已保存大纲未完成"标记
      localStorage.setItem("policy-draft-outline", JSON.stringify({ title: detail.title, savedAt: Date.now() }));
      localStorage.removeItem("policy-draft-completed");
      const key = `outline-saved-${detail.title}-${Date.now()}`;
      pushHint(key, {
        text: `「${detail.title}」的政策大纲已保存，您尚未完成起草，点击下方可继续。`,
        actions: [{ label: "继续起草", path: "/policy-writing/drafting" }],
      });
    };

    /** 前评估报告生成完成（由 PolicyAssessmentAuto 发出） */
    const handlePreEvalDone = (e: Event) => {
      const detail = (e as CustomEvent<{ title: string }>).detail;
      // 持久化完成状态
      localStorage.setItem("policy-pre-eval-done", JSON.stringify({ title: detail.title, doneAt: Date.now() }));
      const key = `pre-eval-done-${detail.title}-${Date.now()}`;
      pushHint(key, {
        text: `「${detail.title}」的政策前评估报告已生成完成，可点击查看。`,
        actions: [{ label: "查看报告", path: "/policy-writing/pre-evaluation" }],
      });
    };

    /** 政策评价报告生成完成 */
    const handleEvalReportDone = (e: Event) => {
      const detail = (e as CustomEvent<{ title: string }>).detail;
      const key = `eval-report-done-${detail.title}-${Date.now()}`;
      pushHint(key, {
        text: `「${detail.title}」的政策评价报告已生成完成，可点击查看。`,
        actions: [{
          label: "查看评价报告",
          path: "/policy-evaluation",
          search: { policy: detail.title },
        }],
      });
    };

    window.addEventListener("assistant:outline-saved", handleOutlineSaved);
    window.addEventListener("assistant:pre-eval-done", handlePreEvalDone);
    window.addEventListener("assistant:eval-report-done", handleEvalReportDone);

    return () => {
      window.removeEventListener("assistant:outline-saved", handleOutlineSaved);
      window.removeEventListener("assistant:pre-eval-done", handlePreEvalDone);
      window.removeEventListener("assistant:eval-report-done", handleEvalReportDone);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, open, currentConversationId]);

  // 打开助手时清除气泡
  useEffect(() => {
    if (open) setBubbleHint(null);
  }, [open]);

  const updateConversation = useCallback((conversationId: string, nextMessages: AssistantMessage[]) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: nextMessages,
              updatedAt: Date.now(),
              title: buildConversationTitle(sceneConfigs[conversation.scene], nextMessages),
            }
          : conversation,
      ),
    );
  }, []);

  const startNewConversation = () => {
    const nextConversation = createConversation(scene);
    setConversations((prev) => [nextConversation, ...prev]);
    setCurrentConversationId(nextConversation.id);
    setInput("");
    setHistoryOpen(false);
  };

  const executePlan = (plan: Awaited<ReturnType<typeof getAssistantPlan>>) => {
    if (!plan.action || plan.action.kind === "none") return;

    const search = plan.action.search ? `?${new URLSearchParams(plan.action.search).toString()}` : "";
    navigate(`${plan.action.path}${search}`, {
      state: plan.action.state,
    });
  };

  const handleSend = async (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || !currentConversation) return;

    const userMessage: AssistantMessage = { role: "user", content };
    const nextMessages = [...currentConversation.messages, userMessage];
    updateConversation(currentConversation.id, nextMessages);
    setInput("");
    setIsThinking(true);

    try {
      const plan = await getAssistantPlan(scene, content, nextMessages);
      executePlan(plan);
      const assistantMessage: AssistantMessage = { role: "assistant", content: plan.reply };
      updateConversation(currentConversation.id, [...nextMessages, assistantMessage]);
    } catch {
      const fallbackMessage: AssistantMessage = {
        role: "assistant",
        content: "抱歉，我刚才没有顺利完成处理。您可以换一种说法，我继续帮您联动页面。",
      };
      updateConversation(currentConversation.id, [...nextMessages, fallbackMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  // ── 关闭状态：右侧居中头像 + 气泡 ──────────────────────────────
  if (!open) {
    return (
      <div className="fixed right-0 top-1/2 z-50 -translate-y-1/2 flex flex-col items-end gap-2">
        {/* 对话气泡提示 */}
        {bubbleHint && (
          <div className="relative mr-[68px] mb-1 max-w-[240px] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-2xl rounded-br-sm bg-white border border-border shadow-lg px-3.5 py-3 text-xs text-foreground leading-relaxed">
              <p>{bubbleHint.text}</p>
              {/* 气泡内的操作链接 */}
              {bubbleHint.actions && bubbleHint.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {bubbleHint.actions.map((action) => (
                    <button
                      key={action.label}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/8 border border-primary/20 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/15 transition-colors"
                      onClick={() => {
                        setBubbleHint(null);
                        const search = action.search
                          ? `?${new URLSearchParams(action.search).toString()}`
                          : "";
                        navigate(`${action.path}${search}`, { state: action.state });
                      }}
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* 气泡尖角 */}
            <div className="absolute -right-2 bottom-2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-white border-b-[6px] border-b-transparent drop-shadow-sm" />
            {/* 关闭气泡按钮 */}
            <button
              className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setBubbleHint(null); }}
            >
              <X className="h-2.5 w-2.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* 头像按钮 */}
        <div className="relative">
          <button
            onClick={() => setOpen(true)}
            className="h-14 w-14 overflow-hidden rounded-l-full border-2 border-r-0 border-primary bg-primary/10 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            title="打开智能助手"
          >
            <img src={avatarImg} alt="智能助手" className="h-full w-full object-cover contrast-125 saturate-150 brightness-90" />
          </button>
          {/* 有气泡时的红点提示 */}
          {bubbleHint && (
            <span className="absolute -top-1 -left-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  // ── 展开状态 ─────────────────────────────────────────────────────
  const dialogSize = maximized
    ? "fixed inset-4 z-50"
    : "fixed bottom-6 right-6 z-50 h-[680px] w-[440px]";

  return (
    <div className={`${dialogSize} flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl`}>
      {/* 标题栏 */}
      <div className="flex h-12 shrink-0 items-center justify-between bg-primary px-4">
        <div className="flex items-center gap-2">
          <img src={avatarImg} alt="" className="h-7 w-7 rounded-full object-cover brightness-110 contrast-110" />
          <span className="text-sm font-bold tracking-wide text-primary-foreground">智能助手</span>
          <span className="rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[10px] text-primary-foreground/90">
            全局助手
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={startNewConversation}
            className="rounded p-1.5 text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            title="新建会话"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setHistoryOpen((current) => !current)}
            className="rounded p-1.5 text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            title="历史会话"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMaximized((current) => !current)}
            className="rounded p-1.5 text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            title={maximized ? "恢复" : "放大"}
          >
            {maximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setMaximized(false);
              setHistoryOpen(false);
            }}
            className="rounded p-1.5 text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 历史会话面板 */}
      {historyOpen && (
        <div className="shrink-0 border-b border-border bg-muted/20 px-3 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">历史会话</p>
            <button className="text-xs text-primary hover:underline" onClick={startNewConversation}>
              新建会话
            </button>
          </div>
          <div className="max-h-36 space-y-2 overflow-y-auto">
            {sortedHistory.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setCurrentConversationId(conversation.id);
                  setHistoryOpen(false);
                }}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                  currentConversationId === conversation.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/30 hover:bg-accent/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-xs font-medium text-foreground">{conversation.title}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(conversation.updatedAt)}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">全局会话</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {currentConversation?.messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <img src={avatarImg} alt="" className="mr-2 mt-0.5 h-8 w-8 shrink-0 rounded-full" />
              )}
              <div className="max-w-[78%] flex flex-col gap-1.5">
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm leading-6",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {message.content}
                </div>
                {/* 操作按钮（仅助手消息） */}
                {message.role === "assistant" && message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-0.5">
                    {message.actions.map((action) => (
                      <button
                        key={action.label}
                        className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/15 transition-colors"
                        onClick={() => {
                          const search = action.search
                            ? `?${new URLSearchParams(action.search).toString()}`
                            : "";
                          navigate(`${action.path}${search}`, { state: action.state });
                        }}
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <img src={avatarImg} alt="" className="mr-2 mt-0.5 h-8 w-8 shrink-0 rounded-full" />
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                正在思考并联动页面...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区 */}
      <div className="shrink-0 border-t border-primary/20 bg-accent/30 p-3">
        <div className="mb-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            推荐问题
          </div>
          <div className="grid grid-cols-3 gap-2">
            {scene.suggestions.map((suggestion) => (
              <button
                key={suggestion.title}
                type="button"
                onClick={() => void handleSend(suggestion.title)}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <p className="text-[11px] font-medium leading-4 text-foreground">{suggestion.title}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-primary/30 bg-background p-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={GLOBAL_PLACEHOLDER}
            className="min-h-[48px] max-h-[88px] resize-none border-none p-0 text-sm shadow-none focus-visible:ring-0"
            rows={1}
          />
          <div className="mt-2 flex items-center justify-between">
            <Button variant="secondary" size="sm" className="h-7 gap-1.5 rounded-full px-3 text-xs">
              <Globe className="h-3.5 w-3.5" />
              联网搜索
            </Button>
            <div className="flex items-center gap-1">
              <button className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted">
                <Mic className="h-4 w-4" />
              </button>
              <button className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted">
                <Paperclip className="h-4 w-4" />
              </button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 rounded-full px-3 text-xs"
                onClick={() => void handleSend()}
                disabled={!input.trim() || isThinking}
              >
                <Send className="h-3.5 w-3.5" />
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
