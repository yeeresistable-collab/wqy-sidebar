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
  PenLine,
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

  // 首页和对话页不显示智能助手悬浮窗
  if (location.pathname === "/home" || location.pathname === "/brain-chat") {
    return null;
  }
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
  /** 当前路由产生的待推送提示，open 时注入消息，closed 时显示气泡 */
  const pendingHintRef = useRef<ProactiveHint | null>(null);
  /** 稳定引用 open 状态，供只依赖 pathname 的 effect 读取最新值 */
  const openRef = useRef(false);
  /** 稳定引用当前会话 id */
  const currentConversationIdRef = useRef<string | null>(null);

  // 每次渲染同步最新值到 ref，供 effect 闭包安全读取
  openRef.current = open;
  currentConversationIdRef.current = currentConversationId;

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

  /** 待发送的初始问题（来自首页跳转），处理完后置 null */
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  // 监听首页跳转携带的问题，自动打开全屏助手
  useEffect(() => {
    const handleAsk = (e: Event) => {
      const question = (e as CustomEvent<{ question: string }>).detail?.question;
      if (!question) return;
      setOpen(true);
      setMaximized(true);
      setHistoryOpen(false);
      setPendingQuestion(question);
    };

    window.addEventListener("policy-assistant:ask", handleAsk);
    return () => window.removeEventListener("policy-assistant:ask", handleAsk);
  }, []);

  // 当有待发送问题且会话已就绪时自动发送
  useEffect(() => {
    if (!pendingQuestion || !currentConversation) return;
    setPendingQuestion(null);
    void handleSend(pendingQuestion);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion, currentConversation?.id]);

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

  // ── 路由切换时推送对应气泡提示 ────────────────────────────────
  // 仅在 pathname 变化时触发，避免 open/currentConversationId 变化引起错误路由的提示
  useEffect(() => {
    const pathname = location.pathname;

    // 切换路由时先清除旧气泡，避免显示上一个路由的残留提示
    setBubbleHint(null);

    // 无需提示的页面直接返回
    if (
      pathname === "/home" ||
      pathname === "/brain-chat" ||
      pathname.startsWith("/my-documents") ||
      pathname.startsWith("/reserve-library") ||
      pathname.startsWith("/enterprise-evaluation") ||
      pathname.startsWith("/effect-dashboard") ||
      pathname.startsWith("/policy-report")
    ) return;

    // 用「路径 + 当天日期」作为 key，同一天同一页面只推一次
    const today = new Date().toDateString();
    const routeKey = `route-${pathname}-${today}`;
    if (pushedEventsRef.current.has(routeKey)) return;
    pushedEventsRef.current.add(routeKey);

    // 根据路由决定气泡内容（始终以气泡形式展示，不注入消息）
    let hint: ProactiveHint | null = null;

    if (pathname.startsWith("/policy-writing/drafting")) {
      try {
        const saved = JSON.parse(localStorage.getItem("policy-draft-outline") ?? "null");
        const completed = localStorage.getItem("policy-draft-completed") === "1";
        if (saved && !completed) {
          hint = {
            text: `「${saved.title}」的政策大纲已保存，您尚未完成起草，点击下方可继续。`,
            actions: [{ label: "继续起草", path: "/policy-writing/drafting" }],
          };
        }
      } catch { /* ignore */ }

    } else if (pathname.startsWith("/policy-writing/pre-evaluation")) {
      try {
        const done = JSON.parse(localStorage.getItem("policy-pre-eval-done") ?? "null");
        if (done?.title) {
          hint = {
            text: `「${done.title}」的政策前评估报告已生成完成，可点击查看。`,
            actions: [{ label: "查看报告", path: "/policy-writing/pre-evaluation" }],
          };
        }
      } catch { /* ignore */ }

    } else if (
      pathname === "/policy-writing" ||
      (pathname.startsWith("/policy-writing") &&
        !pathname.includes("/drafting") &&
        !pathname.includes("/pre-evaluation"))
    ) {
      hint = {
        text: "北京市/国家近期有关于《促进新一代信息技术产业高质量发展若干政策措施》的新政策发布，点击下方可查看。",
        actions: [{ label: "查看政策", path: "/policy-writing/search", search: { query: "新一代信息技术" } }],
      };

    } else if (pathname.startsWith("/policy-reach")) {
      hint = {
        text: "近期「高新技术企业认定奖励」事项已完成触达128次，可点击查看触达情况。",
        actions: [{ label: "查看触达情况", path: "/policy-reach" }],
      };

    } else if (pathname === "/dashboard" || pathname === "/" || pathname.startsWith("/policy-redeem")) {
      hint = {
        text: "新增「人工智能产业扶持」事项可以用于企业评优，可点击开始评测。",
        actions: [{ label: "开始评测", path: "/policy-analysis" }],
      };

    } else if (pathname.startsWith("/policy-analysis")) {
      hint = {
        text: "新增「人工智能产业扶持」事项可以用于企业评优，可点击开始评测。",
        actions: [{ label: "开始评测", path: "/policy-analysis" }],
      };

    } else if (pathname.startsWith("/policy-evaluation")) {
      hint = {
        text: "《北京经开区产业发展促进办法》已发布超6个月，可点击对该政策进行汇总评价。",
        actions: [{
          label: "一键生成评价报告",
          path: "/policy-evaluation",
          search: { policy: "北京经开区产业发展促进办法", autostart: "1" },
        }],
      };
    }

    // 存入 ref，供助手打开时注入消息
    pendingHintRef.current = hint;

    if (hint) {
      if (openRef.current) {
        // 助手已打开：直接注入消息到当前会话
        const convId = currentConversationIdRef.current;
        if (convId) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === convId
                ? {
                    ...conv,
                    messages: [
                      ...conv.messages,
                      { role: "assistant" as const, content: hint!.text, actions: hint!.actions },
                    ],
                    updatedAt: Date.now(),
                  }
                : conv,
            ),
          );
        }
      } else {
        // 助手关闭：显示气泡
        setBubbleHint(hint);
      }
    }
  // 只在 pathname 变化时重新执行
  }, [location.pathname]);

  // ── 业务事件监听（异步任务完成后推送气泡）────────────────────
  useEffect(() => {
    /** 大纲保存事件（由 PolicyDraftingFlow 发出） */
    const handleOutlineSaved = (e: Event) => {
      const detail = (e as CustomEvent<{ title: string; draftCompleted: boolean }>).detail;
      if (detail.draftCompleted) return;
      localStorage.setItem("policy-draft-outline", JSON.stringify({ title: detail.title, savedAt: Date.now() }));
      localStorage.removeItem("policy-draft-completed");
      setBubbleHint({
        text: `「${detail.title}」的政策大纲已保存，您尚未完成起草，点击下方可继续。`,
        actions: [{ label: "继续起草", path: "/policy-writing/drafting" }],
      });
    };

    /** 前评估报告生成完成（由 PolicyAssessmentAuto 发出） */
    const handlePreEvalDone = (e: Event) => {
      const detail = (e as CustomEvent<{ title: string }>).detail;
      localStorage.setItem("policy-pre-eval-done", JSON.stringify({ title: detail.title, doneAt: Date.now() }));
      setBubbleHint({
        text: `「${detail.title}」的政策前评估报告已生成完成，可点击查看。`,
        actions: [{ label: "查看报告", path: "/policy-writing/pre-evaluation" }],
      });
    };

    /** 政策评价报告生成完成 */
    const handleEvalReportDone = (e: Event) => {
      const detail = (e as CustomEvent<{ title: string }>).detail;
      setBubbleHint({
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
  }, []);

  // 打开助手时：清除气泡，并将当前路由的待推送提示注入会话消息
  useEffect(() => {
    if (!open) return;
    setBubbleHint(null);

    const hint = pendingHintRef.current;
    const convId = currentConversationIdRef.current;
    if (!hint || !convId) return;

    // 注入一次后清空，避免重复注入
    pendingHintRef.current = null;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                { role: "assistant" as const, content: hint.text, actions: hint.actions },
              ],
              updatedAt: Date.now(),
            }
          : conv,
      ),
    );
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

  /** 当前正在流式输出的消息 index（-1 表示无） */
  const streamingIndexRef = useRef<number>(-1);
  /** 打字机定时器 */
  const typewriterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const executePlan = (plan: Awaited<ReturnType<typeof getAssistantPlan>>) => {
    if (!plan.action || plan.action.kind === "none" || plan.action.kind === "stream_draft") return;

    const search = plan.action.search ? `?${new URLSearchParams(plan.action.search).toString()}` : "";
    navigate(`${plan.action.path}${search}`, {
      state: plan.action.state,
    });
  };

  /**
   * 启动打字机流式输出：
   * convId         当前会话 id
   * msgIndex       流式消息在 messages 数组中的 index
   * fullContent    待输出的完整文本
   * policyTitle    政策标题（用于编辑跳转）
   */
  const startTypewriter = useCallback(
    (convId: string, msgIndex: number, fullContent: string, policyTitle: string) => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      streamingIndexRef.current = msgIndex;

      let charIndex = 0;
      // 每次输出若干字符，模拟流速
      const CHUNK = 4;
      const INTERVAL = 30;

      typewriterTimerRef.current = setInterval(() => {
        charIndex = Math.min(charIndex + CHUNK, fullContent.length);
        const partial = fullContent.slice(0, charIndex);

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== convId) return conv;
            const msgs = conv.messages.map((msg, idx) => {
              if (idx !== msgIndex) return msg;
              return {
                ...msg,
                streamContent: partial,
                streamDone: charIndex >= fullContent.length,
              };
            });
            return { ...conv, messages: msgs, updatedAt: Date.now() };
          }),
        );

        if (charIndex >= fullContent.length) {
          if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
          streamingIndexRef.current = -1;
          // 输出完成后把完整内容写进去（已在上面赋值），顺便更新 policyTitle
          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id !== convId) return conv;
              const msgs = conv.messages.map((msg, idx) => {
                if (idx !== msgIndex) return msg;
                return {
                  ...msg,
                  streamContent: fullContent,
                  streamDone: true,
                  streamPolicyTitle: policyTitle,
                  streamFullContent: undefined,
                };
              });
              return { ...conv, messages: msgs, updatedAt: Date.now() };
            }),
          );
        }
      }, INTERVAL);
    },
    [setConversations],
  );

  // 卸载时清除定时器
  useEffect(() => {
    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, []);

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

      if (plan.action?.kind === "stream_draft") {
        const { policyTitle, fullContent } = plan.action;
        // 先插入一条「正在起草」提示消息 + 空的流式占位
        const introMsg: AssistantMessage = { role: "assistant", content: plan.reply };
        const streamMsg: AssistantMessage = {
          role: "assistant",
          content: "",
          streamContent: "",
          streamDone: false,
          streamPolicyTitle: policyTitle,
          streamFullContent: fullContent,
        };
        const withStream = [...nextMessages, introMsg, streamMsg];
        updateConversation(currentConversation.id, withStream);
        setIsThinking(false);

        // 下一帧启动打字机
        const streamIdx = withStream.length - 1;
        const convId = currentConversation.id;
        setTimeout(() => startTypewriter(convId, streamIdx, fullContent, policyTitle), 50);
        return;
      }

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
                {/* 流式起草消息 */}
                {message.role === "assistant" && message.streamContent !== undefined ? (
                  <div className="rounded-lg bg-muted text-foreground overflow-hidden">
                    {/* 标题栏 */}
                    <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5 border-b border-border/60">
                      <PenLine className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-primary truncate">
                        {message.streamPolicyTitle ?? "政策起草中"}
                      </span>
                      {!message.streamDone && (
                        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          生成中
                        </span>
                      )}
                      {message.streamDone && (
                        <span className="ml-auto text-[10px] text-green-600 font-medium">✓ 生成完成</span>
                      )}
                    </div>
                    {/* 政策正文（打字机） */}
                    <pre className="px-3 py-2.5 text-[11px] leading-5 whitespace-pre-wrap font-sans max-h-56 overflow-y-auto text-foreground/90">
                      {message.streamContent}
                      {!message.streamDone && (
                        <span className="inline-block w-[2px] h-[12px] bg-primary animate-pulse align-text-bottom ml-0.5" />
                      )}
                    </pre>
                    {/* 完成后显示编辑按钮 */}
                    {message.streamDone && (
                      <div className="px-3 pb-3 pt-1">
                        <button
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                          onClick={() => {
                            navigate("/policy-writing/drafting", {
                              state: {
                                directContent: message.streamContent,
                                policyTitle: message.streamPolicyTitle,
                              },
                            });
                          }}
                        >
                          <PenLine className="h-3 w-3" />
                          编辑此政策
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
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
                  </>
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
