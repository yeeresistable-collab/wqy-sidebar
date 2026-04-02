import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Search, BarChart2, FileText, BookOpen, Sparkles } from "lucide-react";
import { searchPolicies, analyzePolicies, generateOutline } from "@/lib/policyDraftApi";
import type { PolicyItem } from "./PolicySearchStep";
import type { OutlineSection } from "./OutlineGenerationStep";

interface QuickDraftProgressProps {
  policyTitle: string;
  coreElements: string;
  /** 所有步骤完成后回调，携带检索结果与大纲 */
  onComplete: (result: { policies: PolicyItem[]; outline: OutlineSection[] }) => void;
}

interface StepDef {
  id: number;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  thoughts: string[];
}

const STEPS: StepDef[] = [
  {
    id: 1,
    label: "智能政策检索",
    sublabel: "根据标题检索相关政策文件",
    icon: Search,
    thoughts: [
      "正在解析政策关键词与适用范围…",
      "检索国家级、地方级政策数据库…",
      "筛选高相关度参考政策，去重排序…",
    ],
  },
  {
    id: 2,
    label: "政策对比分析",
    sublabel: "提取条款结构与核心差异",
    icon: BarChart2,
    thoughts: [
      "提取各参考政策的适用对象与支持方式…",
      "对比扶持力度、申报条件与资金来源…",
      "归纳先进做法，识别可借鉴创新点…",
    ],
  },
  {
    id: 3,
    label: "生成政策大纲",
    sublabel: "结构化大纲与章节规划",
    icon: FileText,
    thoughts: [
      "根据对比分析结果规划章节结构…",
      "设计各章条款层级与关键要点…",
      "优化大纲逻辑，确保政策完整性…",
    ],
  },
  {
    id: 4,
    label: "准备政策编辑",
    sublabel: "载入大纲，即将输出全文",
    icon: BookOpen,
    thoughts: [
      "整合检索成果与大纲数据…",
      "初始化政策编辑器…",
      "即将进入政策全文生成…",
    ],
  },
];

type StepStatus = "pending" | "running" | "done";

export function QuickDraftProgress({ policyTitle, coreElements, onComplete }: QuickDraftProgressProps) {
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(["running", "pending", "pending", "pending"]);
  const [activeThought, setActiveThought] = useState<string>(STEPS[0].thoughts[0]);
  const [thoughtIdx, setThoughtIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [thoughtVisible, setThoughtVisible] = useState(true);

  const resultRef = useRef<{ policies: PolicyItem[]; outline: OutlineSection[] }>({ policies: [], outline: [] });
  const hasRunRef = useRef(false);

  /** 平滑过渡到新思考文字 */
  const switchThought = (text: string) => {
    setThoughtVisible(false);
    setTimeout(() => {
      setActiveThought(text);
      setThoughtVisible(true);
    }, 200);
  };

  /** 步骤内滚动思考文字 */
  const runThoughtCycle = (stepIdx: number, durationMs: number) => {
    const thoughts = STEPS[stepIdx].thoughts;
    let idx = 0;
    switchThought(thoughts[0]);
    const interval = Math.floor(durationMs / thoughts.length);
    const timer = setInterval(() => {
      idx++;
      if (idx < thoughts.length) {
        switchThought(thoughts[idx]);
        setThoughtIdx(idx);
      } else {
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  };

  /** 整体进度条动画 */
  const animateProgress = (from: number, to: number, durationMs: number) => {
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const frac = Math.min(elapsed / durationMs, 1);
      setOverallProgress(Math.round(from + (to - from) * frac));
      if (frac < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      // Step 0: 政策检索 (0% → 25%)
      animateProgress(0, 25, 1200);
      const clearStep0 = runThoughtCycle(0, 1100);
      const { policies } = await searchPolicies(policyTitle, coreElements);
      resultRef.current.policies = policies;
      clearStep0();

      setStepStatuses(["done", "running", "pending", "pending"]);
      setCurrentStep(1);

      // Step 1: 对比分析 (25% → 55%)
      animateProgress(25, 55, 1300);
      const clearStep1 = runThoughtCycle(1, 1200);
      await analyzePolicies(policies);
      clearStep1();

      setStepStatuses(["done", "done", "running", "pending"]);
      setCurrentStep(2);

      // Step 2: 大纲生成 (55% → 85%)
      animateProgress(55, 85, 1400);
      const clearStep2 = runThoughtCycle(2, 1300);
      const { outline } = await generateOutline({ policyTitle, coreElements, selectedPolicies: policies });
      resultRef.current.outline = outline;
      clearStep2();

      setStepStatuses(["done", "done", "done", "running"]);
      setCurrentStep(3);

      // Step 3: 准备编辑器 (85% → 100%)
      animateProgress(85, 100, 800);
      const clearStep3 = runThoughtCycle(3, 700);
      await new Promise(r => setTimeout(r, 750));
      clearStep3();

      setStepStatuses(["done", "done", "done", "done"]);
      setOverallProgress(100);

      // 短暂停顿后回调
      setTimeout(() => {
        onComplete(resultRef.current);
      }, 600);
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalDone = stepStatuses.filter(s => s === "done").length;
  const allDone = totalDone === STEPS.length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl border border-border p-8 space-y-8">
        {/* 标题区 */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <h2 className="text-base font-semibold text-foreground">AI 快速起草中</h2>
          <p className="text-xs text-muted-foreground truncate max-w-sm mx-auto">《{policyTitle}》</p>
        </div>

        {/* 整体进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>整体进度</span>
            <span className="font-medium tabular-nums">{overallProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full gov-gradient"
              style={{ width: `${overallProgress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>

        {/* 步骤列表 */}
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const status = stepStatuses[idx];
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors
                  ${status === "running" ? "bg-primary/5 border border-primary/20" : ""}
                  ${status === "done" ? "opacity-60" : ""}
                  ${status === "pending" ? "opacity-35" : ""}
                `}
              >
                {/* 状态图标 */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors
                  ${status === "done" ? "bg-primary/10 text-primary" : ""}
                  ${status === "running" ? "bg-amber-100 text-amber-600" : ""}
                  ${status === "pending" ? "bg-muted text-muted-foreground" : ""}
                `}>
                  {status === "done" ? (
                    <Check className="h-4 w-4" />
                  ) : status === "running" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* 文字 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{step.label}</div>
                  <div className="text-xs text-muted-foreground">{step.sublabel}</div>
                </div>

                {/* 步骤编号 */}
                {status === "pending" && (
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">{idx + 1}/{STEPS.length}</span>
                )}
                {status === "done" && (
                  <span className="text-xs text-primary font-medium shrink-0">完成</span>
                )}
              </div>
            );
          })}
        </div>

        {/* 思考过程气泡 */}
        <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 min-h-[48px] flex items-center gap-2.5">
          <div className="flex gap-1 shrink-0">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary/50"
                animate={!allDone ? { opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] } : { opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeThought}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: thoughtVisible ? 1 : 0, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-muted-foreground"
            >
              {allDone ? "所有步骤已完成，正在跳转至政策编辑器…" : activeThought}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
