import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, CheckCircle, AlertTriangle, XCircle, Loader2, Printer } from "lucide-react";
import type { AssessmentPolicy } from "./AssessmentStep1";
import type { Clause } from "./AssessmentStep2";
import type { Step3Result } from "./AssessmentStep3";
import type { Step4Result } from "./AssessmentStep4";
import type { Step5Result } from "./AssessmentStep5";
import type { Step6Result } from "./AssessmentStep6";

interface Props {
  policy: AssessmentPolicy;
  clauses: Clause[];
  step3: Step3Result | null;
  step4: Step4Result | null;
  step5: Step5Result | null;
  step6: Step6Result | null;
}

export function AssessmentStep7({ policy, clauses, step3, step4, step5, step6 }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleGenerate = () => {
    setIsGenerating(true);
    setDownloadProgress(0);
    let p = 0;
    const timer = setInterval(() => {
      p += Math.random() * 15 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(timer);
        setIsGenerating(false);
        setGenerated(true);
      }
      setDownloadProgress(p);
    }, 200);
  };

  const handleDownload = () => {
    // 模擬下載：生成文字報告並觸發下載
    const reportContent = generateReportText({ policy, clauses, step3, step4, step5, step6 });
    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${policy.title}_前评估报告意见书_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 統計
  const totalClauses = clauses.length;
  const superiorIssues = step3?.superiorChecks.filter(c => c.consistencyLevel !== "consistent").length ?? 0;
  const crossIssues = step3?.crossClauses.filter(c => c.crossType === "conflict").length ?? 0;
  const fundTotal = step4?.fundClauses.reduce((s, f) => s + f.estBudget, 0) ?? 0;
  const complianceFail = step5?.filter(r => r.level !== "pass").length ?? 0;
  const opinionCount = step6?.length ?? 0;

  const overallScore = Math.max(
    60,
    100
      - superiorIssues * 5
      - crossIssues * 8
      - complianceFail * 6
  );

  const scoreColor = overallScore >= 85 ? "text-emerald-600" : overallScore >= 70 ? "text-amber-600" : "text-red-600";
  const scoreLabel = overallScore >= 85 ? "良好" : overallScore >= 70 ? "需改进" : "存在问题";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">生成前评估报告意见书</h2>
        <p className="text-sm text-muted-foreground">汇总所有评估结果，生成可供下载的前评估报告意见书</p>
      </div>

      {/* 報告預覽卡 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* 報告標題 */}
        <div className="bg-primary/5 border-b border-border px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">政策前评估报告意见书</p>
              <h3 className="text-base font-semibold text-foreground leading-snug">{policy.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                评估日期：{new Date().toLocaleDateString("zh-CN")} · 共 {totalClauses} 条政策条款
              </p>
            </div>
            {/* 綜合評分 */}
            <div className="ml-auto text-center shrink-0">
              <p className={`text-3xl font-bold ${scoreColor}`}>{overallScore}</p>
              <p className={`text-xs font-medium ${scoreColor}`}>{scoreLabel}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">综合评分</p>
            </div>
          </div>
        </div>

        {/* 評估摘要 */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">评估摘要</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "条款拆解", value: `${totalClauses} 条`, sub: "已完成分类", ok: true },
              { label: "上位政策一致性", value: `${superiorIssues} 处关注`, sub: step3 ? `共检索 ${step3.superiorChecks.length} 部上位政策` : "待完成", ok: superiorIssues === 0 },
              { label: "交叉条款冲突", value: `${crossIssues} 处冲突`, sub: step3 ? `共发现 ${step3.crossClauses.length} 处交叉` : "待完成", ok: crossIssues === 0 },
              { label: "资金测算", value: `${fundTotal} 万元/年`, sub: `覆盖 ${step4?.fundClauses.reduce((s, f) => s + f.estCompanies, 0) ?? 0} 家企业`, ok: true },
              { label: "合规性问题", value: `${complianceFail} 项`, sub: step5 ? `共核查 ${step5.length} 个维度` : "待完成", ok: complianceFail === 0 },
              { label: "优化建议", value: `${opinionCount} 条`, sub: "综合评估意见", ok: true },
            ].map(({ label, value, sub, ok }) => (
              <div key={label} className="rounded-lg border border-border bg-background px-3 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  {ok
                    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{value}</p>
                <p className="text-[11px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>

          {/* 主要發現 */}
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-foreground">主要发现与建议</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {superiorIssues > 0 && <li className="flex items-start gap-1.5"><span className="text-amber-500 shrink-0 mt-0.5">•</span>上位政策一致性方面存在 {superiorIssues} 处需关注情形，建议进一步对齐国家和市级政策标准</li>}
              {crossIssues > 0 && <li className="flex items-start gap-1.5"><span className="text-red-500 shrink-0 mt-0.5">•</span>发现 {crossIssues} 处与现行政策存在冲突的条款，建议出台前进行协调清理</li>}
              {complianceFail > 0 && <li className="flex items-start gap-1.5"><span className="text-amber-500 shrink-0 mt-0.5">•</span>合规性评估发现 {complianceFail} 个需关注维度，建议逐项整改后再行出台</li>}
              <li className="flex items-start gap-1.5"><span className="text-primary shrink-0 mt-0.5">•</span>资金类条款预计年度资金需求 {fundTotal} 万元，建议提前纳入年度财政预算安排</li>
              <li className="flex items-start gap-1.5"><span className="text-primary shrink-0 mt-0.5">•</span>建议政策出台前召开专家论证会，重点论证第四条、第九条的可操作性</li>
            </ul>
          </div>
        </div>

        {/* 操作區 */}
        <div className="px-6 pb-5 flex items-center gap-3">
          {!generated && !isGenerating && (
            <button
              onClick={handleGenerate}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              生成完整报告意见书
            </button>
          )}
          {isGenerating && (
            <div className="flex-1 py-2.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center gap-3">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <div className="flex-1 max-w-xs">
                <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${downloadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <span className="text-xs text-primary font-medium">{Math.round(downloadProgress)}%</span>
            </div>
          )}
          {generated && (
            <>
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                报告已生成
              </div>
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                下载报告意见书（TXT）
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** 生成政策前评估报告正文 */
export function generateReportText({ policy, clauses, step3, step4, step5, step6 }: Props): string {
  const now = new Date().toLocaleDateString("zh-CN");
  const totalClauses = clauses.length;
  const fundTotal = step4?.fundClauses.reduce((s, f) => s + f.estBudget, 0) ?? 0;
  const fundCompanies = step4?.fundClauses.reduce((s, f) => s + f.estCompanies, 0) ?? 0;
  const complianceIssues = step5?.filter(r => r.level !== "pass") ?? [];
  const crossConflicts = step3?.crossClauses.filter(c => c.crossType === "conflict") ?? [];
  const crossDuplicates = step3?.crossClauses.filter(c => c.crossType === "duplicate") ?? [];

  const catLabel = (cat: string) =>
    cat === "condition" ? "条件达成类" : cat === "competition" ? "竞争促进类" : "营商环境类";

  const consistLabel = (l: string) =>
    l === "consistent" ? "一致" : l === "partial" ? "部分一致" : "冲突";

  const levelLabel = (l: string) =>
    l === "pass" ? "通过" : l === "warning" ? "需关注" : "不合规";

  const prioLabel = (p: string) =>
    p === "high" ? "高优先级" : p === "medium" ? "中优先级" : "低优先级";

  const lines: string[] = [];

  const push = (...args: string[]) => lines.push(...args);

  push(
    `政策前评估报告意见书`,
    ``,
    `评估对象：${policy.title}`,
    `评估日期：${now}`,
    `文件来源：${policy.source === "upload" ? "本地上传" : "政策起草库"}`,
    ``,
  );

  // ── 综合结论 ──
  const hasIssue = complianceIssues.length > 0 || crossConflicts.length > 0;
  push(
    `综合评估结论`,
    ``,
    hasIssue
      ? `本政策整体方向合理，与上位法律法规总体一致，但在合规性和条款衔接方面存在${complianceIssues.length + crossConflicts.length}处需重点关注的问题，建议在出台前予以修改完善。`
      : `本政策整体方向合理，条款结构清晰，与上位法律法规保持一致，合规性评估通过，具备出台条件。`,
    ``,
  );

  // ── 一、条款拆解 ──
  push(`一、条款拆解与分类`);
  push(``);
  if (totalClauses > 0) {
    push(`本政策共涉及 ${totalClauses} 条核心条款，按类型分类如下：`);
    push(``);
    const grouped: Record<string, typeof clauses> = {};
    for (const c of clauses) {
      grouped[c.category] = grouped[c.category] ?? [];
      grouped[c.category].push(c);
    }
    for (const [cat, items] of Object.entries(grouped)) {
      push(`【${catLabel(cat)}】（共 ${items.length} 条）`);
      for (const c of items) {
        push(`  ${c.article}　${c.text}`);
      }
      push(``);
    }
  } else {
    push(`条款拆解进行中，请稍候…`);
    push(``);
  }

  // ── 二、上位政策一致性 ──
  push(`二、上位政策一致性评估`);
  push(``);
  if (step3) {
    push(`共检索 ${step3.superiorChecks.length} 部上位法律法规，评估结果如下：`);
    push(``);
    for (const s of step3.superiorChecks) {
      push(`  ● ${s.policyTitle}（${s.source}）`);
      push(`    一致性：${consistLabel(s.consistencyLevel)}`);
      push(`    说明：${s.note}`);
      push(``);
    }
    if (step3.crossClauses.length > 0) {
      push(`交叉条款检索：发现 ${step3.crossClauses.length} 处交叉，其中冲突 ${crossConflicts.length} 处、重复 ${crossDuplicates.length} 处。`);
      push(``);
      for (const c of step3.crossClauses) {
        const typeLabel = c.crossType === "conflict" ? "冲突" : c.crossType === "duplicate" ? "重复" : "互补";
        push(`  ● [${typeLabel}] ${c.ourArticle} "${c.ourClause}"`);
        push(`    与 ${c.crossPolicy} 中"${c.crossClause}"存在${typeLabel}。`);
        push(`    处理建议：${c.suggestion}`);
        push(``);
      }
    } else {
      push(`交叉条款检索：未发现与现行政策存在冲突或重复的条款。`);
      push(``);
    }
  } else {
    push(`一致性评估进行中，请稍候…`);
    push(``);
  }

  // ── 三、落地性评估 ──
  push(`三、落地性评估`);
  push(``);
  if (step4) {
    if (step4.fundClauses.length > 0) {
      push(`（一）资金类条款测算`);
      push(``);
      push(`本政策共涉及 ${step4.fundClauses.length} 条资金扶持条款，预计年度财政需求合计 ${fundTotal} 万元，覆盖企业约 ${fundCompanies} 家。`);
      push(``);
      for (const f of step4.fundClauses) {
        push(`  ● ${f.article}　${f.clauseText}`);
        push(`    预计覆盖 ${f.estCompanies} 家企业，年度资金规模约 ${f.estBudget} 万元（覆盖率 ${f.coverageRate}）。`);
        if (f.agentNote) push(`    测算说明：${f.agentNote}`);
        push(``);
      }
    }
    if (step4.nonFundClauses.length > 0) {
      push(`（二）非资金类条款`);
      push(``);
      for (const n of step4.nonFundClauses) {
        const clarity = n.audienceClarity === "clear" ? "受众明确" : n.audienceClarity === "vague" ? "受众描述模糊" : "受众界定缺失";
        push(`  ● ${n.article}　${n.clauseText}`);
        push(`    受众清晰度：${clarity}。${n.audienceNote}`);
        push(``);
      }
    }
  } else {
    push(`落地性评估进行中，请稍候…`);
    push(``);
  }

  // ── 四、合规性评估 ──
  push(`四、合规性评估`);
  push(``);
  if (step5) {
    const passed = step5.filter(r => r.level === "pass").length;
    push(`共核查 ${step5.length} 个合规维度，通过 ${passed} 项，需关注 ${step5.length - passed} 项。`);
    push(``);
    for (const c of step5) {
      push(`  ● ${c.dimension}：${levelLabel(c.level)}`);
      push(`    ${c.detail}`);
      if (c.suggestion) push(`    整改建议：${c.suggestion}`);
      push(``);
    }
  } else {
    push(`合规性评估进行中，请稍候…`);
    push(``);
  }

  // ── 五、综合意见与建议 ──
  push(`五、综合意见与建议`);
  push(``);
  if (step6 && step6.length > 0) {
    for (const o of step6) {
      push(`  ● [${prioLabel(o.priority)}] ${o.category}：${o.opinion}`);
      push(`    ${o.detail}`);
      push(``);
    }
  } else {
    push(`（综合意见生成中，请稍候…）`);
    push(``);
  }

  // ── 附注 ──
  push(`附注`);
  push(``);
  push(`本报告由 AI 智能分析系统自动生成，仅供政策起草参考，不作为正式法律意见。最终出台前，请结合实际情况组织专家论证及合法性审查。`);

  return lines.join("\n");
}
