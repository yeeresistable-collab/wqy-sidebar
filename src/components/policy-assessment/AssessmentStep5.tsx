import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Shield, Loader2 } from "lucide-react";
import type { Clause } from "./AssessmentStep2";

type ComplianceLevel = "pass" | "warning" | "fail";

export interface ComplianceItem {
  id: string;
  dimension: string;
  level: ComplianceLevel;
  detail: string;
  suggestion?: string;
}

export type Step5Result = ComplianceItem[];

const LEVEL_META: Record<ComplianceLevel, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  pass: { label: "合规", icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  warning: { label: "需关注", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
  fail: { label: "不合规", icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
};

function mockStep5(): Step5Result {
  return [
    { id: "cp1", dimension: "公平竞争审查", level: "pass", detail: "政策文件已设置公平竞争审查条款（第十条），符合《公平竞争审查条例》要求" },
    { id: "cp2", dimension: "行政许可合规", level: "warning", detail: "第八条\"容缺受理\"机制在程序上存在一定法律风险，建议完善配套的后补材料时限规定及不予受理情形说明", suggestion: "建议参照《行政许可法》第三十二条细化容缺受理的适用范围和后续程序，明确容缺情形不得超过3类核心材料缺失" },
    { id: "cp3", dimension: "资金管理合规", level: "warning", detail: "奖励补贴条款未明确资金拨付方式（直接拨付/代缴/税收抵扣），可能影响财政管理合规性", suggestion: "建议补充说明资金来源（财政预算/专项资金）、拨付方式、绩效评价机制，并明确资金追回条款" },
    { id: "cp4", dimension: "数据安全与个人信息保护", level: "pass", detail: "政策文件未涉及数据收集与个人信息处理内容，不存在《数据安全法》《个人信息保护法》合规风险" },
    { id: "cp5", dimension: "地方性法规合规", level: "pass", detail: "政策内容与现行本市、本区相关地方性法规不存在明显冲突" },
    { id: "cp6", dimension: "权责分配合规", level: "warning", detail: "部分条款的责任主体表述为\"相关部门\"，职责边界不清晰", suggestion: "建议明确各条款的责任单位，并在附则中列出牵头部门与配合部门清单，提升政策的可执行性" },
  ];
}

interface Props {
  clauses: Clause[];
  result: Step5Result | null;
  onComplete: (result: Step5Result) => void;
}

export function AssessmentStep5({ clauses, result: externalResult, onComplete }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">(externalResult ? "done" : "idle");
  const [result, setResult] = useState<Step5Result | null>(externalResult);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!externalResult) {
      setStatus("loading");
      let p = 0;
      const timer = setInterval(() => {
        p += Math.random() * 12 + 6;
        if (p >= 100) {
          p = 100;
          clearInterval(timer);
          const r = mockStep5();
          setResult(r);
          onComplete(r);
          setStatus("done");
        }
        setProgress(p);
      }, 250);
    }
  }, []);

  const passCount = result?.filter(r => r.level === "pass").length ?? 0;
  const warnCount = result?.filter(r => r.level === "warning").length ?? 0;
  const failCount = result?.filter(r => r.level === "fail").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">合规性评估</h2>
        <p className="text-sm text-muted-foreground">从公平竞争、资金管理、行政许可等多个维度评估政策合规性</p>
      </div>

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
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
          <p className="text-sm text-muted-foreground">正在进行多维度合规性检查...</p>
        </div>
      )}

      {status === "done" && result && (
        <div className="space-y-4">
          {/* 合規統計 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "合规", count: passCount, ...LEVEL_META.pass },
              { label: "需关注", count: warnCount, ...LEVEL_META.warning },
              { label: "不合规", count: failCount, ...LEVEL_META.fail },
            ].map(({ label, count, color, bg, border, icon: Icon }) => (
              <div key={label} className={`rounded-xl border px-4 py-3 text-center ${bg} ${border}`}>
                <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
                <p className={`text-xl font-bold ${color}`}>{count}</p>
                <p className={`text-xs ${color}`}>{label}</p>
              </div>
            ))}
          </div>

          {/* 合規明細 */}
          <div className="space-y-2.5">
            {result.map((item, i) => {
              const meta = LEVEL_META[item.level];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`rounded-xl border p-4 space-y-2 ${meta.bg} ${meta.border}`}
                >
                  <div className="flex items-center gap-2">
                    <meta.icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
                    <span className="text-sm font-semibold text-foreground">{item.dimension}</span>
                    <span className={`ml-auto text-xs font-medium ${meta.color}`}>{meta.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">{item.detail}</p>
                  {item.suggestion && (
                    <div className="pl-6">
                      <p className="text-xs text-foreground font-medium mb-0.5">整改建议：</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.suggestion}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
