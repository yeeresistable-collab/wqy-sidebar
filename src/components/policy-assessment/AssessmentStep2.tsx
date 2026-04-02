import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, Tag, DollarSign, Scale, Building2, Plus } from "lucide-react";
import type { AssessmentPolicy } from "./AssessmentStep1";

export type ClauseCategory = "condition" | "competition" | "business";

export interface Clause {
  id: string;
  text: string;
  category: ClauseCategory;
  article: string;
}

const CATEGORY_META: Record<ClauseCategory, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  condition: {
    label: "条件达成类",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: Tag,
  },
  competition: {
    label: "竞争促进类",
    color: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    icon: Scale,
  },
  business: {
    label: "营商环境类",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: Building2,
  },
};

/** 根據政策標題模擬條款拆解 */
function mockExtractClauses(title: string): Clause[] {
  return [
    { id: "c1", article: "第三条", text: "对首次认定为国家级高新技术企业的，给予一次性奖励20万元，连续认定的每次给予10万元奖励。", category: "condition" },
    { id: "c2", article: "第四条", text: "对企业年度研发投入超过上年度50%以上的，按超出部分的20%给予补贴，最高不超过200万元。", category: "condition" },
    { id: "c3", article: "第五条", text: "鼓励企业开展技术创新，对获得国家发明专利授权的企业，每项给予5万元奖励，每家企业每年最高不超过50万元。", category: "competition" },
    { id: "c4", article: "第六条", text: "支持企业参与制定国际、国家、行业标准，对主导制定国际标准的企业给予100万元奖励。", category: "competition" },
    { id: "c5", article: "第七条", text: "深化\"一网通办\"改革，实现企业开办全流程网上办理，办理时限压缩至1个工作日以内。", category: "business" },
    { id: "c6", article: "第八条", text: "推行\"容缺受理\"机制，对申报材料基本齐全、主要内容符合条件的事项，先行受理、后补材料。", category: "business" },
    { id: "c7", article: "第九条", text: "对符合条件的入区企业，提供不低于1000平方米的免费办公场地，使用期限不少于2年。", category: "condition" },
    { id: "c8", article: "第十条", text: "建立公平竞争审查机制，定期对存量政策文件进行合规性审查，及时清理妨碍公平竞争的政策措施。", category: "competition" },
  ];
}

interface Props {
  policy: AssessmentPolicy;
  clauses: Clause[];
  onClausesExtracted: (clauses: Clause[]) => void;
}

export function AssessmentStep2({ policy, clauses: externalClauses, onClausesExtracted }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">(externalClauses.length > 0 ? "done" : "idle");
  const [clauses, setClauses] = useState<Clause[]>(externalClauses);
  const [activeCategory, setActiveCategory] = useState<ClauseCategory | "all">("all");
  const [progress, setProgress] = useState(0);

  const runExtraction = () => {
    setStatus("loading");
    setProgress(0);
    let p = 0;
    const timer = setInterval(() => {
      p += Math.random() * 15 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(timer);
        const extracted = mockExtractClauses(policy.title);
        setClauses(extracted);
        onClausesExtracted(extracted);
        setStatus("done");
      }
      setProgress(p);
    }, 200);
  };

  useEffect(() => {
    if (externalClauses.length === 0 && status === "idle") runExtraction();
  }, []);

  const displayed = activeCategory === "all" ? clauses : clauses.filter(c => c.category === activeCategory);
  const counts = {
    all: clauses.length,
    condition: clauses.filter(c => c.category === "condition").length,
    competition: clauses.filter(c => c.category === "competition").length,
    business: clauses.filter(c => c.category === "business").length,
  };

  const handleCategoryChange = (id: string, category: ClauseCategory) => {
    const updated = clauses.map(c => c.id === id ? { ...c, category } : c);
    setClauses(updated);
    onClausesExtracted(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">条款拆解与分类</h2>
        <p className="text-sm text-muted-foreground">AI 自动将政策条款拆解并按类型分类，可手动调整分类</p>
      </div>

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
              <circle
                cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                className="text-primary transition-all duration-300"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{Math.round(progress)}%</span>
          </div>
          <p className="text-sm text-muted-foreground">正在拆解政策条款并智能分类...</p>
        </div>
      )}

      {status === "done" && (
        <div className="space-y-4">
          {/* 統計 Tab */}
          <div className="flex gap-2 flex-wrap">
            {([["all", "全部"], ["condition", "条件达成类"], ["competition", "竞争促进类"], ["business", "营商环境类"]] as const).map(([key, label]) => {
              const meta = key === "all" ? null : CATEGORY_META[key];
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    activeCategory === key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {meta && <meta.icon className="h-3 w-3" />}
                  {label}
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeCategory === key ? "bg-white/20" : "bg-muted"
                  }`}>{counts[key]}</span>
                </button>
              );
            })}
          </div>

          {/* 條款卡片 */}
          <div className="space-y-2">
            {displayed.map((clause, i) => {
              const meta = CATEGORY_META[clause.category];
              return (
                <motion.div
                  key={clause.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-xl border p-4 ${meta.bg} ${meta.border}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-muted-foreground shrink-0 mt-0.5 w-12">{clause.article}</span>
                    <p className="text-sm text-foreground flex-1 leading-relaxed">{clause.text}</p>
                    <div className="shrink-0">
                      <select
                        value={clause.category}
                        onChange={e => handleCategoryChange(clause.id, e.target.value as ClauseCategory)}
                        className={`text-xs font-medium px-2 py-1 rounded-md border cursor-pointer appearance-none focus:outline-none ${meta.color} ${meta.bg} ${meta.border}`}
                      >
                        {(Object.entries(CATEGORY_META) as [ClauseCategory, typeof CATEGORY_META[ClauseCategory]][]).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
