import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, DollarSign, Users, Cpu, CheckCircle, AlertTriangle, TrendingUp, Calculator } from "lucide-react";
import type { Clause } from "./AssessmentStep2";

export interface FundClauseEval {
  id: string;
  article: string;
  clauseText: string;
  /** 可支持企業數 */
  estCompanies: number;
  /** 預估資金規模（萬元） */
  estBudget: number;
  /** 覆蓋率 */
  coverageRate: string;
  agentNote: string;
}

export interface NonFundClauseEval {
  id: string;
  article: string;
  clauseText: string;
  audienceClarity: "clear" | "vague" | "missing";
  audienceNote: string;
}

export interface Step4Result {
  fundClauses: FundClauseEval[];
  nonFundClauses: NonFundClauseEval[];
}

const AUDIENCE_META = {
  clear: { label: "受众明确", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  vague: { label: "受众模糊", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
  missing: { label: "受众缺失", color: "text-red-700 dark:text-red-300", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
};

function mockStep4(clauses: Clause[]): Step4Result {
  return {
    fundClauses: [
      { id: "f1", article: "第三条", clauseText: "高新技术企业认定奖励20万元", estCompanies: 45, estBudget: 900, coverageRate: "约覆盖全区高企的62%", agentNote: "基于近三年区内高新技术企业认定数量（年均45家）及历史申报率（85%）测算，预计年均资金需求约900万元，与区级科技专项资金规模相匹配" },
      { id: "f2", article: "第四条", clauseText: "研发投入超50%补贴20%，最高200万元", estCompanies: 18, estBudget: 2400, coverageRate: "约覆盖全区规上企业的12%", agentNote: "基于区内规模以上工业企业研发投入数据，满足50%增长条件的企业较少（约18家），但单户补贴金额较大，预计资金总需求约2400万元/年" },
      { id: "f3", article: "第五条", clauseText: "知识产权奖励每项5万元，每年最高50万元", estCompanies: 120, estBudget: 1800, coverageRate: "约覆盖全区有效专利企业的35%", agentNote: "根据区内历年专利授权数量（年均约600项，120家企业），预计年均资金需求约1800万元，需在资金池中预留充足保障" },
    ],
    nonFundClauses: [
      { id: "n1", article: "第七条", clauseText: "深化\"一网通办\"改革，实现企业开办全流程网上办理，办理时限压缩至1个工作日", audienceClarity: "clear", audienceNote: "适用对象为新注册企业，范围清晰，时限指标明确，可落地性强" },
      { id: "n2", article: "第八条", clauseText: "推行\"容缺受理\"机制，对申报材料基本齐全的事项先行受理", audienceClarity: "vague", audienceNote: "\"基本齐全\"标准未明确，建议补充具体的容缺材料清单，否则执行部门自由裁量空间过大" },
      { id: "n3", article: "第九条", clauseText: "对符合条件的入区企业提供不低于1000平方米的免费办公场地", audienceClarity: "vague", audienceNote: "\"符合条件\"未界定，建议明确企业规模、行业类型、落地时间等准入门槛，同时需说明场地资源总量" },
      { id: "n4", article: "第十条", clauseText: "建立公平竞争审查机制，定期对存量政策文件进行合规性审查", audienceClarity: "clear", audienceNote: "责任主体为政府部门，执行路径清晰，审查周期建议明确（如每年不少于一次）" },
    ],
  };
}

interface Props {
  clauses: Clause[];
  result: Step4Result | null;
  onComplete: (result: Step4Result) => void;
}

export function AssessmentStep4({ clauses, result: externalResult, onComplete }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">(externalResult ? "done" : "idle");
  const [result, setResult] = useState<Step4Result | null>(externalResult);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<"fund" | "nonfund">("fund");
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  useEffect(() => {
    if (!externalResult) {
      setStatus("loading");
      let p = 0;
      const timer = setInterval(() => {
        p += Math.random() * 8 + 4;
        if (p >= 100) {
          p = 100;
          clearInterval(timer);
          const r = mockStep4(clauses);
          setResult(r);
          onComplete(r);
          setStatus("done");
        }
        setProgress(p);
      }, 300);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">落地性评估</h2>
        <p className="text-sm text-muted-foreground">对资金类条款调用政策测算智能体，对非资金类条款评估受众对象清晰度</p>
      </div>

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                className="text-primary transition-all duration-300"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground flex items-center gap-2 justify-center">
              <Cpu className="h-4 w-4 text-primary animate-pulse" />
              政策测算智能体运行中
            </p>
            <p className="text-xs text-muted-foreground">正在测算资金规模及企业覆盖数量，并评估非资金条款...</p>
          </div>
        </div>
      )}

      {status === "done" && result && (
        <div className="space-y-4">
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
            <button onClick={() => setActiveTab("fund")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === "fund" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <DollarSign className="h-3.5 w-3.5" />资金类条款 ({result.fundClauses.length})
            </button>
            <button onClick={() => setActiveTab("nonfund")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === "nonfund" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Users className="h-3.5 w-3.5" />非资金类条款 ({result.nonFundClauses.length})
            </button>
          </div>

          {/* 資金類條款 */}
          {activeTab === "fund" && (
            <div className="space-y-3">
              {/* 智能體徽標 */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 w-fit">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-primary font-medium">政策测算智能体已完成测算</span>
              </div>

              {/* 資金匯總 */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "测算条款数", value: result.fundClauses.length, unit: "条", icon: Calculator },
                  { label: "预计覆盖企业", value: result.fundClauses.reduce((s, f) => s + f.estCompanies, 0), unit: "家", icon: Users },
                  { label: "年度资金需求", value: (result.fundClauses.reduce((s, f) => s + f.estBudget, 0) / 10000).toFixed(1), unit: "亿元", icon: TrendingUp },
                ].map(({ label, value, unit, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 text-center">
                    <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{value}<span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span></p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {result.fundClauses.map(fc => (
                <motion.div key={fc.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div
                    className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setExpandedAgent(expandedAgent === fc.id ? null : fc.id)}
                  >
                    <DollarSign className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-muted-foreground">{fc.article}</span>
                        <p className="text-sm text-foreground truncate">{fc.clauseText}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">预计覆盖 <span className="text-foreground font-semibold">{fc.estCompanies}</span> 家企业</span>
                        <span className="text-muted-foreground">资金需求 <span className="text-foreground font-semibold">{fc.estBudget}</span> 万元/年</span>
                        <span className="text-muted-foreground">{fc.coverageRate}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary font-medium shrink-0">智能体测算</span>
                  </div>
                  <AnimatePresence>
                    {expandedAgent === fc.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 pt-0 border-t border-border/50">
                          <div className="flex items-start gap-2 pt-3">
                            <Cpu className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{fc.agentNote}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}

          {/* 非資金類條款 */}
          {activeTab === "nonfund" && (
            <div className="space-y-3">
              {result.nonFundClauses.map((nf, i) => {
                const meta = AUDIENCE_META[nf.audienceClarity];
                return (
                  <motion.div key={nf.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className={`rounded-xl border p-4 space-y-2 ${meta.bg} ${meta.border}`}>
                    <div className="flex items-start gap-3">
                      <Users className={`h-4 w-4 shrink-0 mt-0.5 ${meta.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-muted-foreground">{nf.article}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${meta.color} bg-white/50 dark:bg-black/20`}>{meta.label}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{nf.clauseText}</p>
                      </div>
                    </div>
                    <p className={`text-xs leading-relaxed pl-7 ${meta.color}`}>{nf.audienceNote}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
