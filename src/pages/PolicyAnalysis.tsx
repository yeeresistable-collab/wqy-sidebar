import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Square,
  Pencil,
  Save,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  PauseCircle,
  Wifi,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Brain,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Types ───
type AnalysisState = "init" | "running" | "stopped" | "completed" | "failed";

interface ThinkingItem {
  id: number;
  text: string;
  type: "info" | "success" | "warning";
  timestamp: string;
}

interface ReportSection {
  title: string;
  content: string;
  status: "pending" | "generating" | "done";
}

// ─── Mock data ───
const STEPS = [
  "整体情况分析",
  "内容逐条分析",
  "实施效果分析",
  "存在问题分析",
  "优化建议分析",
  "报告生成",
];

const THINKING_MESSAGES: { text: string; type: ThinkingItem["type"] }[] = [
  { text: "正在加载政策基础信息与发布背景...", type: "info" },
  { text: "整体情况识别完成：已提炼政策目标、适用范围与执行周期", type: "success" },
  { text: "正在拆解政策条款结构，共识别 12 条核心条款", type: "info" },
  { text: "内容逐条分析中：已完成扶持对象、扶持方式和申报条件抽取", type: "success" },
  { text: "正在汇总实施数据，分析覆盖企业、兑现频次与资金规模...", type: "info" },
  { text: "实施效果分析完成：覆盖企业 326 家，兑现资金 2.3 亿元", type: "success" },
  { text: "正在识别未兑现条款、执行堵点和落地偏差...", type: "info" },
  { text: "注意：部分条款兑现率偏低，企业申报周期较长", type: "warning" },
  { text: "正在生成优化建议，匹配流程优化与条款修订方向...", type: "info" },
  { text: "优化建议分析完成：已形成 5 条可执行建议", type: "success" },
  { text: "正在生成政策评价报告...", type: "info" },
  { text: "报告结构优化中，正在整合 5 个分析维度", type: "info" },
  { text: "报告生成完成", type: "success" },
];

const REPORT_SECTIONS: { title: string; content: string }[] = [
  {
    title: "一、整体情况分析",
    content:
      "本政策围绕北京经济技术开发区产业发展目标，聚焦科技创新、高端制造和企业培育等重点方向，构建了较为完整的扶持框架。政策目标明确、适用对象清晰、执行周期合理，在区域产业升级与创新引导方面具备较强针对性。\n\n从整体情况看，政策具备较好的结构基础和实施条件，但部分条款在执行标准与配套机制方面仍有细化空间。",
  },
  {
    title: "二、内容逐条分析",
    content:
      "逐条分析显示，扶持类条款执行基础较好，资金支持和奖励方向较为明确；资格认定类条款口径较严，对企业资质、研发能力和申报材料完整性要求较高。部分条款存在表述原则性较强、落地路径不够清晰的问题。\n\n从条款设计看，政策主干完整，但个别条款在适用边界、执行说明和操作指引方面仍需进一步明确。",
  },
  {
    title: "三、实施效果分析",
    content:
      "从实施数据看，政策当前已覆盖 326 家企业，累计兑现资金 2.3 亿元，重点支持对象集中于高新技术企业和创新型中小企业。已兑现条款主要集中在资金奖励和项目补贴类，兑现效率总体较好。\n\n但从实施节奏看，不同条款之间的兑现进度存在差异，部分条款在执行后期出现响应减弱和覆盖不足的情况。",
  },
  {
    title: "四、存在问题分析",
    content:
      "当前政策执行中主要存在四类问题：一是部分条款兑现率偏低，存在条款设计与执行条件不完全匹配的现象；二是政策覆盖企业类型仍偏集中，中小微企业受益面不足；三是部分条款申报流程较长，影响企业参与积极性；四是个别支持方向缺乏后续跟踪评估机制。\n\n这些问题在一定程度上影响了政策的普惠性、执行效率和持续性。",
  },
  {
    title: "五、优化建议分析",
    content:
      "建议从五个方面优化政策设计与执行：一是对兑现率偏低的条款补充实施细则和适用指引；二是压缩申报和审批链路，提升企业办理体验；三是增加面向中小微企业的分层扶持机制；四是建立条款级执行跟踪与反馈闭环；五是将阶段性评估结果纳入下一轮政策修订依据。\n\n通过以上优化，可进一步提升政策的执行效率、覆盖广度和实际成效。",
  },
];

const WAIT_TIPS = [
  { maxSeconds: 10, text: "正在启动分析引擎..." },
  { maxSeconds: 30, text: "正在深度解析政策内容，请稍候" },
  { maxSeconds: 60, text: "本次分析包含 6 个阶段，AI 正在逐步生成结论" },
  { maxSeconds: Infinity, text: "报告生成中，结果将持续输出，请耐心等待" },
];

// ─── Component ───
const PolicyAnalysis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<AnalysisState>("init");
  const [currentStep, setCurrentStep] = useState(0);
  const [thinkingItems, setThinkingItems] = useState<ThinkingItem[]>([]);
  const [reportSections, setReportSections] = useState<ReportSection[]>(
    REPORT_SECTIONS.map((s) => ({ title: s.title, content: "", status: "pending" }))
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [thinkingExpanded, setThinkingExpanded] = useState(true);
  const [completedModules, setCompletedModules] = useState(0);
  const thinkingRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  const policyName = searchParams.get("policy") || "北京经开区产业发展促进办法";

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const getWaitTip = () => {
    return WAIT_TIPS.find((t) => elapsedTime < t.maxSeconds)?.text || "";
  };

  const now = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  };

  const addThinking = useCallback((text: string, type: ThinkingItem["type"]) => {
    setThinkingItems((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text, type, timestamp: now() },
    ]);
  }, []);

  // Auto-scroll thinking panel
  useEffect(() => {
    if (thinkingRef.current) {
      thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
    }
  }, [thinkingItems]);

  // Timer
  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  // Simulate analysis
  const runAnalysis = useCallback(() => {
    setState("running");
    setElapsedTime(0);
    setThinkingItems([]);
    setReportSections(REPORT_SECTIONS.map((s) => ({ title: s.title, content: "", status: "pending" })));
    setCompletedModules(0);
    setCurrentStep(0);

    let thinkIdx = 0;
    let sectionIdx = 0;
    const stageBreakpoints = [0, 2, 4, 6, 8, 10];

    const processThinking = () => {
      if (stateRef.current !== "running") return;
      if (thinkIdx < THINKING_MESSAGES.length) {
        const msg = THINKING_MESSAGES[thinkIdx];
        addThinking(msg.text, msg.type);
        const nextIndex = thinkIdx + 1;
        const nextStage = stageBreakpoints.reduce((stage, breakpoint, index) => (nextIndex > breakpoint ? index : stage), 0);
        setCurrentStep(Math.min(nextStage, STEPS.length - 1));
        thinkIdx++;

        animationRef.current = setTimeout(processThinking, 800 + Math.random() * 1200);
      } else {
        // Start report generation
        setCurrentStep(STEPS.length - 1);
        processReport();
      }
    };

    const processReport = () => {
      if (stateRef.current !== "running") return;
      if (sectionIdx < REPORT_SECTIONS.length) {
        // Set current section to generating
        setReportSections((prev) =>
          prev.map((s, i) =>
            i === sectionIdx ? { ...s, status: "generating" } : s
          )
        );

        // Simulate streaming text
        const fullContent = REPORT_SECTIONS[sectionIdx].content;
        const words = fullContent.split("");
        let charIdx = 0;
        const currentSectionIdx = sectionIdx;

        const streamChar = () => {
          if (stateRef.current !== "running") return;
          if (charIdx < words.length) {
            const chunk = words.slice(charIdx, charIdx + 3 + Math.floor(Math.random() * 5)).join("");
            charIdx += chunk.length;
            setReportSections((prev) =>
              prev.map((s, i) =>
                i === currentSectionIdx
                  ? { ...s, content: fullContent.substring(0, charIdx) }
                  : s
              )
            );
            animationRef.current = setTimeout(streamChar, 20 + Math.random() * 30);
          } else {
            // Section complete
            setReportSections((prev) =>
              prev.map((s, i) =>
                i === currentSectionIdx ? { ...s, status: "done", content: fullContent } : s
              )
            );
            setCompletedModules((m) => m + 1);
            sectionIdx++;
            animationRef.current = setTimeout(processReport, 500);
          }
        };
        streamChar();
      } else {
        // All done
        setState("completed");
        setCurrentStep(STEPS.length - 1);
      }
    };

    animationRef.current = setTimeout(processThinking, 1000);
  }, [addThinking]);

  // Auto-start
  useEffect(() => {
    const timer = setTimeout(() => {
      setState("init");
      setTimeout(runAnalysis, 1500);
    }, 500);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) clearTimeout(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStop = () => {
    setState("stopped");
    if (animationRef.current) clearTimeout(animationRef.current);
  };

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    setIsEditing(false);
  };
  const handleCancelEdit = () => setIsEditing(false);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const statusConfig: Record<AnalysisState, { label: string; color: string; icon: React.ElementType }> = {
    init: { label: "初始化中", color: "bg-muted text-muted-foreground", icon: Loader2 },
    running: { label: "分析中", color: "bg-blue-100 text-blue-700", icon: Loader2 },
    stopped: { label: "已停止", color: "bg-orange-100 text-orange-700", icon: PauseCircle },
    completed: { label: "已完成", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    failed: { label: "失败", color: "bg-red-100 text-red-700", icon: AlertCircle },
  };

  const { label: statusLabel, color: statusColor, icon: StatusIcon } = statusConfig[state];
  const totalStages = STEPS.length;
  const totalSections = REPORT_SECTIONS.length;
  const completedStages =
    state === "completed" ? totalStages : state === "running" ? Math.min(currentStep, totalStages - 1) : 0;
  const progressPercent = state === "completed" ? 100 : Math.round((completedStages / totalStages) * 100);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ─── Header ─── */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/policy-evaluation")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-foreground">
                  {state === "completed" ? "报告生成完成" : "政策评估分析中"}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                    statusColor
                  )}
                >
                  <StatusIcon
                    className={cn("w-3.5 h-3.5", state === "running" || state === "init" ? "animate-spin" : "")}
                  />
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {policyName} · 综合评估
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state === "running" && (
              <Button variant="outline" size="sm" onClick={handleStop} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <Square className="w-3.5 h-3.5 mr-1.5" />
                停止分析
              </Button>
            )}
            {(state === "completed" || state === "stopped") && !isEditing && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                编辑报告
              </Button>
            )}
            {isEditing && (
              <>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  取消
                </Button>
                <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  保存
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Global Tip ─── */}
      {(state === "running" || state === "init") && (
        <div className="px-6 py-2 bg-accent/50 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-accent-foreground">
            <Sparkles className="w-4 h-4" />
            <span>{getWaitTip()}</span>
          </div>
        </div>
      )}

      {state === "failed" && (
        <div className="px-6 py-2 bg-destructive/10 border-b border-destructive/20">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>分析过程出现异常，部分内容可能不完整</span>
          </div>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Thinking Panel */}
        <div
          className={cn(
            "border-r border-border bg-card flex flex-col transition-all duration-300",
            thinkingExpanded ? "w-[380px]" : "w-[48px]"
          )}
        >
          {thinkingExpanded ? (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">分析过程</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setThinkingExpanded(false)} className="h-7 w-7 p-0">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>

              {/* Current Step */}
              <div className="px-4 py-3 border-b border-border bg-accent/30">
                <p className="text-xs text-muted-foreground mb-1">当前阶段</p>
                <div className="flex items-center gap-2">
                  {state === "running" && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                  <span className="text-sm font-medium text-foreground">
                    {state === "completed" ? "分析完成" : `正在进行「${STEPS[currentStep]}」`}
                  </span>
                </div>
              </div>

              {/* Step Progress */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-1">
                  {STEPS.map((step, i) => {
                    const isDone = state === "completed" ? true : i < currentStep;
                    const isCurrent = state !== "completed" && i === currentStep;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            isDone
                              ? "bg-primary text-primary-foreground"
                              : isCurrent
                              ? "bg-primary/20 text-primary border-2 border-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isDone ? "✓" : i + 1}
                        </div>
                        <span className="text-[10px] mt-1 text-muted-foreground text-center leading-tight">
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thinking Stream */}
              <div ref={thinkingRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {thinkingItems.map((item) => (
                  <div key={item.id} className="flex gap-2 text-xs">
                    <span className="text-muted-foreground whitespace-nowrap font-mono">{item.timestamp}</span>
                    <span
                      className={cn(
                        item.type === "success"
                          ? "text-green-600"
                          : item.type === "warning"
                          ? "text-orange-600"
                          : "text-foreground"
                      )}
                    >
                      {item.type === "success" && "✅ "}
                      {item.type === "warning" && "⚠️ "}
                      {item.text}
                    </span>
                  </div>
                ))}
                {(state === "running" || state === "init") && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span>思考中...</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-3">
              <Button variant="ghost" size="sm" onClick={() => setThinkingExpanded(true)} className="h-7 w-7 p-0">
                <ChevronUp className="w-4 h-4" />
              </Button>
              <div className="mt-2 writing-mode-vertical text-xs text-muted-foreground" style={{ writingMode: "vertical-rl" }}>
                分析过程
              </div>
            </div>
          )}
        </div>

        {/* Right: Report Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-card">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">评估报告</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>已完成 {completedStages}/{totalStages} 模块</span>
              <span>{progressPercent}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 pt-2">
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          {/* Report Content */}
          <div ref={reportRef} className="flex-1 overflow-y-auto px-6 py-6">
            {/* Report title */}
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-foreground">
                  {policyName} · 政策评估报告
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  生成时间：2024年3月20日 | AI 智能分析
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {reportSections.map((section, i) => (
                  <div key={i} className="border-b border-border pb-6 last:border-0">
                    <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                      {section.status === "done" && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {section.status === "generating" && (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      )}
                      {section.status === "pending" && (
                        <div className="w-4 h-4 rounded-full border-2 border-muted" />
                      )}
                      {section.title}
                    </h3>
                    {section.status === "pending" ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    ) : isEditing && (section.status === "done" || state === "stopped") ? (
                      <textarea
                        className="w-full min-h-[120px] p-3 border border-input rounded-lg text-sm text-foreground leading-relaxed bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                        defaultValue={section.content}
                        onChange={(e) => {
                          setReportSections((prev) =>
                            prev.map((s, idx) =>
                              idx === i ? { ...s, content: e.target.value } : s
                            )
                          );
                        }}
                      />
                    ) : (
                      <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {section.content}
                        {section.status === "generating" && (
                          <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Generating tip */}
              {state === "running" && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>
                    正在生成第 {Math.min(completedModules + 1, totalSections)} 部分...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer Status ─── */}
      <div className="border-t border-border bg-card px-6 py-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              已用时：{formatTime(elapsedTime)}
            </span>
            <span>
              已完成 {completedStages}/{totalStages} 模块
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              流式连接：{state === "running" ? "正常" : state === "completed" ? "已断开" : "待连接"}
            </span>
            <span>
              生成状态：
              {state === "running"
                ? "进行中"
                : state === "completed"
                ? "已完成"
                : state === "stopped"
                ? "已停止"
                : state === "failed"
                ? "异常"
                : "准备中"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyAnalysis;
