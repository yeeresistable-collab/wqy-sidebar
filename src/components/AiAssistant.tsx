import { useEffect, useMemo, useRef, useState } from "react";
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

  const updateConversation = (conversationId: string, nextMessages: AssistantMessage[]) => {
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
  };

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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 overflow-hidden rounded-full border-2 border-primary bg-primary/10 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <img src={avatarImg} alt="智能助手" className="h-full w-full object-cover contrast-125 saturate-150 brightness-90" />
      </button>
    );
  }

  const dialogSize = maximized ? "fixed inset-4 z-50" : "fixed bottom-6 right-6 z-50 h-[680px] w-[440px]";

  return (
    <div className={`${dialogSize} flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl`}>
      <div className="flex h-12 shrink-0 items-center justify-between bg-primary px-4">
        <div className="flex items-center gap-2">
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
            title="放大"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMaximized(false)}
            className="rounded p-1.5 text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            title="恢复"
          >
            <Minimize2 className="h-4 w-4" />
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

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {currentConversation?.messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <img src={avatarImg} alt="" className="mr-2 mt-0.5 h-8 w-8 shrink-0 rounded-full" />
              )}
              <div
                className={cn(
                  "max-w-[78%] rounded-lg px-3 py-2 text-sm leading-6",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {message.content}
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
