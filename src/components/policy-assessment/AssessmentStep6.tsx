import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Loader2, Star, TrendingUp, Users2, Clock } from "lucide-react";

export interface OtherOpinion {
  id: string;
  category: string;
  icon: React.ElementType;
  priority: "high" | "medium" | "low";
  opinion: string;
  detail: string;
}

export type Step6Result = OtherOpinion[];

const PRIORITY_META = {
  high: { label: "高优先级", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" },
  medium: { label: "中优先级", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  low: { label: "低优先级", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" },
};

function mockStep6(): Step6Result {
  return [
    {
      id: "o1", category: "政策目标量化", icon: TrendingUp, priority: "high",
      opinion: "部分政策目标缺乏可量化的考核指标",
      detail: "政策文件中\"提升产业竞争力\"\"优化营商环境\"等表述较为宏观，建议补充具体的可量化目标（如：3年内区内高新技术企业数量增长30%，企业开办时间压缩至0.5个工作日），便于后续绩效评价",
    },
    {
      id: "o2", category: "实施保障机制", icon: Star, priority: "high",
      opinion: "政策缺少配套的联席会议协调机制",
      detail: "本政策涉及发改、科技、财政、人社等多个部门，建议设立政策实施联席会议制度，明确牵头单位，建立定期会商机制和信息共享平台，防止政策实施碎片化",
    },
    {
      id: "o3", category: "政策有效期管理", icon: Clock, priority: "medium",
      opinion: "建议明确政策的定期评估和动态调整机制",
      detail: "本政策拟定有效期为3年，建议在政策文本中明确：（1）施行满1年开展中期评估；（2）建立政策效果反馈渠道；（3）允许在重大市场环境变化时启动临时修订程序",
    },
    {
      id: "o4", category: "宣传推广路径", icon: Users2, priority: "medium",
      opinion: "缺少政策知晓度提升的配套措施",
      detail: "建议制定专项宣传方案，通过政府官网、公众号、政策超市等渠道多渠道发布，并联合行业协会开展政策解读培训，确保目标企业充分知晓并及时申报",
    },
    {
      id: "o5", category: "与周边政策协同", icon: Lightbulb, priority: "low",
      opinion: "可考虑与周边区域形成政策联动",
      detail: "建议主动对接毗邻区域的同类政策，探索建立区域性政策联盟，避免政策洼地效应导致的企业跨区套利，同时可借鉴先进地区的成熟做法完善本地政策体系",
    },
  ];
}

interface Props {
  result: Step6Result | null;
  onComplete: (result: Step6Result) => void;
}

export function AssessmentStep6({ result: externalResult, onComplete }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">(externalResult ? "done" : "idle");
  const [result, setResult] = useState<Step6Result | null>(externalResult);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!externalResult) {
      setStatus("loading");
      let p = 0;
      const timer = setInterval(() => {
        p += Math.random() * 14 + 7;
        if (p >= 100) {
          p = 100;
          clearInterval(timer);
          const r = mockStep6();
          setResult(r);
          onComplete(r);
          setStatus("done");
        }
        setProgress(p);
      }, 220);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">其他评估意见</h2>
        <p className="text-sm text-muted-foreground">针对政策目标、保障机制、宣传推广等方面提出综合优化建议</p>
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
          <p className="text-sm text-muted-foreground">正在生成综合评估意见...</p>
        </div>
      )}

      {status === "done" && result && (
        <div className="space-y-3">
          {result.map((item, i) => {
            const prMeta = PRIORITY_META[item.priority];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`rounded-xl border p-4 space-y-2.5 ${prMeta.bg}`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={`h-4 w-4 shrink-0 ${prMeta.color}`} />
                  <span className="text-sm font-semibold text-foreground flex-1">{item.category}</span>
                  <span className={`text-xs font-medium ${prMeta.color}`}>{prMeta.label}</span>
                </div>
                <p className="text-sm font-medium text-foreground pl-6">{item.opinion}</p>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">{item.detail}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
