import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, GitCompare, Cpu, Shield, FileText, Check, ChevronDown, ChevronUp, Square, RotateCcw } from "lucide-react";
import { generateReportText } from "./AssessmentStep7";
import type { AssessmentPolicy } from "./AssessmentStep1";
import type { Clause } from "./AssessmentStep2";
import type { Step3Result } from "./AssessmentStep3";
import type { Step4Result } from "./AssessmentStep4";
import type { Step5Result } from "./AssessmentStep5";
import type { Step6Result } from "./AssessmentStep6";

interface Props {
  policy: AssessmentPolicy;
  onBack: () => void;
}

function mockExtractClauses(_title: string): Clause[] {
  return [
    { id: "c1", article: "第三条", text: "对首次认定为国家级高新技术企业的，给予一次性奖励20万元，连续认定的每次给予10万元奖励。", category: "condition" },
    { id: "c2", article: "第四条", text: "对企业年度研发投入超过上年度50%以上的，按超出部分的20%给予补贴，最高不超过200万元。", category: "condition" },
    { id: "c3", article: "第五条", text: "鼓励企业开展技术创新，对获得国家发明专利授权的企业，每项给予5万元奖励，每家企业每年最高不超过50万元。", category: "competition" },
    { id: "c4", article: "第六条", text: "支持企业参与制定国际、国家、行业标准，对主导制定国际标准的企业给予100万元奖励。", category: "competition" },
  ];
}

function mockStep3(_clauses: Clause[]): Step3Result {
  return {
    superiorChecks: [
      { policyTitle: "《中华人民共和国促进科技成果转化法》", source: "全国人大", url: "https://www.gov.cn", consistencyLevel: "consistent", note: "本政策扶持方向与国家科技成果转化立法精神一致。" },
      { policyTitle: "《国务院关于促进新一代人工智能产业发展三年行动计划》", source: "国务院", url: "https://www.gov.cn", consistencyLevel: "partial", note: "补贴标准与国家行动计划建议基本相符，但认定条件有差异。" },
    ],
    crossClauses: [
      { ourClause: "高新技术企业认定奖励20万元", ourArticle: "第三条", crossPolicy: "《北京市高新技术企业奖励办法》", crossClause: "高新技术企业认定奖励15万元", crossType: "duplicate", suggestion: "建议明确与市级奖励的衔接方式" },
    ],
  };
}

function mockStep4(_clauses: Clause[]): Step4Result {
  return {
    fundClauses: [
      { id: "f1", article: "第三条", clauseText: "高新技术企业认定奖励20万元", estCompanies: 45, estBudget: 900, coverageRate: "约62%", agentNote: "基于历史数据测算" },
    ],
    nonFundClauses: [
      { id: "n1", article: "第七条", clauseText: "一网通办改革，办理时限1个工作日", audienceClarity: "clear", audienceNote: "适用对象为新注册企业" },
    ],
  };
}

function mockStep5(): Step5Result {
  return [
    { id: "cp1", dimension: "公平竞争审查", level: "pass", detail: "符合相关要求" },
    { id: "cp2", dimension: "行政许可合规", level: "warning", detail: "容缺受理需补充后续流程说明", suggestion: "参照行政许可法补充说明" },
  ];
}

function mockStep6(): Step6Result {
  return [
    { id: "o1", priority: "high", category: "建议", opinion: "建议明确资金来源与拨付流程", detail: "可在实施细则中明确" },
  ];
}

const STAGES = [
  {
    id: 0, label: "条款拆解", icon: Search, duration: 900,
    thoughts: ["正在读取政策文本结构…", "按条款边界拆分政策内容…", "对条款进行分类标注…"],
  },
  {
    id: 1, label: "一致性评估", icon: GitCompare, duration: 1200,
    thoughts: ["检索上位政策数据库…", "比对政策条款一致性…", "扫描交叉条款冲突…"],
  },
  {
    id: 2, label: "落地性评估", icon: Cpu, duration: 1100,
    thoughts: ["调用政策测算智能体…", "测算资金规模及企业覆盖数量…", "评估非资金条款受众清晰度…"],
  },
  {
    id: 3, label: "合规性评估", icon: Shield, duration: 900,
    thoughts: ["进行公平竞争审查…", "核查行政许可合规性…", "检查资金管理合规要求…"],
  },
  {
    id: 4, label: "报告生成", icon: FileText, duration: 700,
    thoughts: ["汇总各维度评估结果…", "生成前评估报告初稿…"],
  },
];

export function PolicyAssessmentAuto({ policy, onBack }: Props) {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [step3, setStep3] = useState<Step3Result | null>(null);
  const [step4, setStep4] = useState<Step4Result | null>(null);
  const [step5, setStep5] = useState<Step5Result | null>(null);
  const [step6, setStep6] = useState<Step6Result | null>(null);

  const [stage, setStage] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  /** 每个步骤正在打字输出的文字 */
  const [typingText, setTypingText] = useState("");
  const typingCancelRef = useRef<(() => void) | null>(null);
  /** 用于中断流程的 ref */
  const stopRef = useRef(false);
  /** 用于触发重新生成的计数器 */
  const [runKey, setRunKey] = useState(0);

  const [editableReport, setEditableReport] = useState("");

  /** 停止生成 */
  const handleStop = useCallback(() => {
    stopRef.current = true;
    setStopped(true);
    setFinished(true);
    setStage(STAGES.length);
  }, []);

  /** 重新生成：重置所有状态并重新执行 */
  const handleRestart = useCallback(() => {
    stopRef.current = false;
    setStopped(false);
    setFinished(false);
    setStage(0);
    setClauses([]);
    setStep3(null);
    setStep4(null);
    setStep5(null);
    setStep6(null);
    setExpandedStep(null);
    setTypingText("");
    setRunKey(k => k + 1);
  }, []);

  // ── 自动执行流程 ──────────────────────────────────────────
  useEffect(() => {
    stopRef.current = false;
    let mounted = true;
    const stopped = () => !mounted || stopRef.current;

    const run = async () => {
      setStage(0);
      await new Promise(r => setTimeout(r, STAGES[0].duration));
      if (stopped()) return;
      setClauses(mockExtractClauses(policy.title));

      setStage(1);
      await new Promise(r => setTimeout(r, STAGES[1].duration));
      if (stopped()) return;
      const r3 = mockStep3([]);
      setStep3(r3);

      setStage(2);
      await new Promise(r => setTimeout(r, STAGES[2].duration));
      if (stopped()) return;
      setStep4(mockStep4([]));

      setStage(3);
      await new Promise(r => setTimeout(r, STAGES[3].duration));
      if (stopped()) return;
      setStep5(mockStep5());

      setStage(4);
      await new Promise(r => setTimeout(r, STAGES[4].duration));
      if (stopped()) return;
      setStep6(mockStep6());

      setFinished(true);
      setStage(STAGES.length);

      // 通知助手：前评估报告已生成完成
      window.dispatchEvent(new CustomEvent("assistant:pre-eval-done", {
        detail: { title: policy.title },
      }));
    };
    run();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policy, runKey]);

  // ── 每步骤进入时打字机输出思考文字 ────────────────────────
  useEffect(() => {
    typingCancelRef.current?.();
    setTypingText("");

    const stageIdx = finished ? -1 : stage;
    if (stageIdx < 0 || stageIdx >= STAGES.length) return;

    const lines = STAGES[stageIdx].thoughts;
    const full = lines.join("\n");
    let i = 0;
    let cancelled = false;
    typingCancelRef.current = () => { cancelled = true; };

    const tick = () => {
      if (cancelled) return;
      i++;
      setTypingText(full.slice(0, i));
      if (i < full.length) setTimeout(tick, 18);
    };
    setTimeout(tick, 120);
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, finished]);

  // ── 报告随完成数据更新 ────────────────────────────────────
  useEffect(() => {
    setEditableReport(
      generateReportText({ policy, clauses, step3, step4, step5, step6 })
    );
  }, [policy, clauses, step3, step4, step5, step6]);

  const currentLabel = finished
    ? "已完成"
    : stage < STAGES.length
    ? STAGES[stage].label
    : "已完成";

  const stageResults = [
    clauses.length > 0
      ? `共拆解 ${clauses.length} 条条款：\n` + clauses.map(c => `${c.article} ${c.text}`).join("\n")
      : "",
    step3
      ? `上位一致性 ${step3.superiorChecks.length} 条，交叉条款 ${step3.crossClauses.length} 条。\n` +
        step3.superiorChecks.map(s => `· ${s.policyTitle}（${s.consistencyLevel}）：${s.note}`).join("\n") +
        "\n交叉条款：\n" +
        step3.crossClauses.map(c => `· ${c.ourArticle} ${c.ourClause} vs ${c.crossPolicy}：${c.suggestion}`).join("\n")
      : "",
    step4
      ? `资金类 ${step4.fundClauses.length} 条，非资金类 ${step4.nonFundClauses.length} 条。\n` +
        step4.fundClauses.map(f => `· ${f.article} ${f.clauseText}：覆盖 ${f.estCompanies} 家，预算 ${f.estBudget} 万元`).join("\n") +
        "\n非资金类：\n" + step4.nonFundClauses.map(n => `· ${n.article}：${n.audienceNote}`).join("\n")
      : "",
    step5
      ? step5.map(s => `· ${s.dimension}（${s.level}）：${s.detail}${s.suggestion ? " → " + s.suggestion : ""}`).join("\n")
      : "",
    step6
      ? step6.map(o => `· [${o.priority}] ${o.category}：${o.opinion}\n  ${o.detail}`).join("\n")
      : "",
  ];

  return (
    <div className="flex gap-0 h-full min-h-0 w-full">
      {/* ── 左侧：AI 思考过程 ───────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">AI 思考过程</p>
        </div>

        {/* 进行中的思考文字 */}
        {!finished && stage < STAGES.length && (
          <div className="px-5 py-3 border-b border-border bg-primary/[0.03]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
              <span className="text-xs font-medium text-primary">正在进行「{STAGES[stage].label}」</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap min-h-[32px]">
              {typingText}
              {typingText && <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse align-middle" />}
            </p>
          </div>
        )}

        {/* 步骤列表 */}
        <div className="flex-1 overflow-y-auto py-2">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const active = !finished && stage === i;
            const done = finished || stage > i;
            const isExpanded = expandedStep === i;
            const hasResult = !!stageResults[i];

            return (
              <div key={s.id} className="border-b border-border/60 last:border-0">
                <button
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-muted/40 transition-colors"
                  onClick={() => done && hasResult ? setExpandedStep(isExpanded ? null : i) : undefined}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : done ? "text-muted-foreground" : "text-muted-foreground/40"}`} />
                  <span className={`flex-1 text-sm ${active ? "text-primary font-medium" : done ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {s.label}
                  </span>
                  {active && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />}
                  {done && !active && (
                    hasResult
                      ? isExpanded
                        ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      : <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </button>

                {/* 展开的结果摘要 */}
                {isExpanded && hasResult && (
                  <div className="px-5 pb-3">
                    <pre className="whitespace-pre-wrap text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 leading-relaxed">
                      {stageResults[i]}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 右侧：报告编辑区 ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 右侧顶部栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <p className="text-sm font-semibold text-foreground">前评估报告（可编辑）</p>
            <p className="text-xs text-muted-foreground mt-0.5">AI 已生成初稿，你可以在此处快速编辑最终意见书</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {/* 状态指示 */}
            <div className="flex items-center gap-1.5 mr-1">
              {!finished ? (
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              ) : stopped ? (
                <Square className="h-3 w-3 text-muted-foreground fill-muted-foreground" />
              ) : (
                <Check className="h-3.5 w-3.5 text-primary" />
              )}
              <span className="text-xs text-muted-foreground">
                {stopped ? "已停止" : currentLabel}
              </span>
            </div>

            {/* 生成中：停止按钮 */}
            {!finished && (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              >
                <Square className="h-3 w-3 fill-current" />
                停止生成
              </button>
            )}

            {/* 完成或已停止：重新生成 */}
            {finished && (
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                重新生成
              </button>
            )}

            {/* 下载按钮：仅完整完成后可用 */}
            <button
              onClick={() => {
                const blob = new Blob([editableReport], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${policy.title}_前评估报告意见书_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "")}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={!finished || !editableReport}
              className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg gov-gradient text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              下载意见书
            </button>
          </div>
        </div>

        {/* 编辑框撑满剩余高度 */}
        <div className="flex-1 min-h-0 p-4">
          <textarea
            value={editableReport}
            onChange={e => setEditableReport(e.target.value)}
            spellCheck={false}
            className="h-full w-full resize-none rounded-lg border border-border bg-background px-6 py-5 text-sm leading-[1.85] outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={finished ? "" : "AI 正在生成报告，请稍候…"}
          />
        </div>
      </div>
    </div>
  );
}

export default PolicyAssessmentAuto;
