import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertTriangle, XCircle, ExternalLink, GitCompare } from "lucide-react";
import type { Clause } from "./AssessmentStep2";

/** 上位政策一致性結果 */
export interface SuperiorPolicyCheck {
  policyTitle: string;
  source: string;
  url: string;
  consistencyLevel: "consistent" | "partial" | "conflict";
  note: string;
}

/** 交叉條款行 */
export interface CrossClauseRow {
  ourClause: string;
  ourArticle: string;
  crossPolicy: string;
  crossClause: string;
  crossType: "duplicate" | "conflict" | "complement";
  suggestion: string;
}

export interface Step3Result {
  superiorChecks: SuperiorPolicyCheck[];
  crossClauses: CrossClauseRow[];
}

const CROSS_TYPE_META = {
  duplicate: { label: "重复条款", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/30" },
  conflict: { label: "冲突条款", color: "text-red-700 dark:text-red-300", bg: "bg-red-50 dark:bg-red-950/30" },
  complement: { label: "互补条款", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
};

const CONSISTENCY_META = {
  consistent: { label: "一致", icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400" },
  partial: { label: "部分一致", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400" },
  conflict: { label: "存在冲突", icon: XCircle, color: "text-red-600 dark:text-red-400" },
};

function mockStep3(clauses: Clause[]): Step3Result {
  return {
    superiorChecks: [
      { policyTitle: "《中华人民共和国促进科技成果转化法》", source: "全国人大", url: "https://www.gov.cn", consistencyLevel: "consistent", note: "本政策扶持方向与国家科技成果转化立法精神一致，鼓励创新主体开展科技成果转化活动" },
      { policyTitle: "《国务院关于促进新一代人工智能产业发展三年行动计划》", source: "国务院", url: "https://www.gov.cn", consistencyLevel: "partial", note: "补贴标准与国家行动计划中建议的比例基本相符，但部分条款中的认定条件设置略低，可适当提高门槛" },
      { policyTitle: "《\"十四五\"数字经济发展规划》", source: "国务院", url: "https://www.gov.cn", consistencyLevel: "consistent", note: "数字经济扶持方向与\"十四五\"规划重点领域高度吻合，属于上位政策支持范畴" },
      { policyTitle: "《关于促进中小企业健康发展的指导意见》", source: "工信部", url: "https://www.gov.cn", consistencyLevel: "partial", note: "部分扶持门槛的设定与工信部关于中小企业认定标准存在偏差，建议统一采用工信部认定标准" },
    ],
    crossClauses: [
      { ourClause: "高新技术企业认定奖励20万元", ourArticle: "第三条", crossPolicy: "《北京市高新技术企业奖励办法》", crossClause: "高新技术企业认定奖励15万元", crossType: "duplicate", suggestion: "两项奖励存在重复，建议明确本政策与市级奖励的关系，可采取\"叠加享受\"或\"取高原则\"" },
      { ourClause: "研发投入超50%补贴20%", ourArticle: "第四条", crossPolicy: "《研发费用加计扣除政策》", crossClause: "研发费用可加计扣除75%", crossType: "complement", suggestion: "本条款与税收优惠政策形成良好互补，可在政策说明中明确两类优惠可同时享受" },
      { ourClause: "知识产权奖励每项5万元", ourArticle: "第五条", crossPolicy: "《市知识产权保护专项政策》", crossClause: "发明专利授权奖励8万元/项", crossType: "conflict", suggestion: "奖励金额与市级政策存在冲突，建议统一标准或注明本政策仅适用于区级认定的特定场景" },
      { ourClause: "免费办公场地1000平方米", ourArticle: "第九条", crossPolicy: "《园区载体保障政策》", crossClause: "孵化期企业享受80%租金优惠", crossType: "conflict", suggestion: "两项政策扶持方式不同（免费vs优惠），建议明确适用主体和期限，防止同一企业重复申请" },
    ],
  };
}

interface Props {
  clauses: Clause[];
  result: Step3Result | null;
  onComplete: (result: Step3Result) => void;
}

export function AssessmentStep3({ clauses, result: externalResult, onComplete }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">(externalResult ? "done" : "idle");
  const [result, setResult] = useState<Step3Result | null>(externalResult);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<"superior" | "cross">("superior");

  useEffect(() => {
    if (!externalResult) {
      setStatus("loading");
      let p = 0;
      const timer = setInterval(() => {
        p += Math.random() * 10 + 5;
        if (p >= 100) {
          p = 100;
          clearInterval(timer);
          const r = mockStep3(clauses);
          setResult(r);
          onComplete(r);
          setStatus("done");
        }
        setProgress(p);
      }, 250);
    }
  }, []);

  const STEPS_LABELS = ["检索上位政策库...", "比对一致性...", "扫描交叉条款...", "生成评估报告..."];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">上位政策一致性 & 交叉条款评估</h2>
        <p className="text-sm text-muted-foreground">与国家、省市上位政策进行一致性比对，并检索交叉条款</p>
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
          <div className="w-full max-w-xs space-y-1.5">
            {STEPS_LABELS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${progress > i * 25 ? "text-foreground" : "text-muted-foreground/40"}`}>
                {progress > (i + 1) * 25
                  ? <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                  : progress > i * 25
                    ? <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />
                    : <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />}
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "done" && result && (
        <div className="space-y-4">
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("superior")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "superior" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              上位政策一致性 ({result.superiorChecks.length})
            </button>
            <button
              onClick={() => setActiveTab("cross")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "cross" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              交叉条款检索 ({result.crossClauses.length})
            </button>
          </div>

          {/* 上位政策一致性 */}
          {activeTab === "superior" && (
            <div className="space-y-3">
              {result.superiorChecks.map((check, i) => {
                const meta = CONSISTENCY_META[check.consistencyLevel];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <meta.icon className={`h-4 w-4 shrink-0 mt-0.5 ${meta.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{check.policyTitle}</p>
                          <span className={`text-xs font-medium shrink-0 ${meta.color}`}>{meta.label}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{check.source}</span>
                          <a href={check.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary flex items-center gap-0.5 hover:underline">
                            <ExternalLink className="h-3 w-3" />查看原文
                          </a>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-7">{check.note}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* 交叉條款表格 */}
          {activeTab === "cross" && (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    {["本政策条款", "条文", "交叉政策", "交叉内容", "类型", "评估建议"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold text-foreground border-b border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.crossClauses.map((row, i) => {
                    const meta = CROSS_TYPE_META[row.crossType];
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.06 }}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-3 py-3 text-foreground max-w-[160px]">{row.ourClause}</td>
                        <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{row.ourArticle}</td>
                        <td className="px-3 py-3 text-foreground max-w-[160px]">{row.crossPolicy}</td>
                        <td className="px-3 py-3 text-muted-foreground max-w-[160px]">{row.crossClause}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.color} ${meta.bg}`}>{meta.label}</span>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground max-w-[200px] leading-relaxed">{row.suggestion}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
