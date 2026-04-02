import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { PolicyItem } from "./PolicySearchStep";
import { analyzePolicies } from "@/lib/policyDraftApi";

interface PolicyAnalysisStepProps {
  selectedPolicies: PolicyItem[];
  /** 分析完成後回傳結果給父層 */
  onAnalysisComplete?: (analysis: ClauseComparison[]) => void;
}

export interface ClauseComparison {
  id: string;
  policyTitle: string;
  source: string;
  targetAudience: string;
  supportMethod: string;
  supportLevel: string;
  highlights: { field: string; type: "high" | "medium" | "unique" }[];
}


function HighlightCell({ text, isHighlighted, highlightType }: { text: string; isHighlighted: boolean; highlightType?: "high" | "medium" | "unique" }) {
  if (!isHighlighted) return <span>{text}</span>;

  const bgMap = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    unique: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  };

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs border ${bgMap[highlightType || "high"]}`}>
      {text}
    </span>
  );
}

export function PolicyAnalysisStep({ selectedPolicies, onAnalysisComplete }: PolicyAnalysisStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<ClauseComparison[]>([]);
  const [summary, setSummary] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAnalyzing(true);
    setError(null);
    analyzePolicies(selectedPolicies)
      .then(({ analysis: result, summary: sum }) => {
        setAnalysis(result);
        setSummary(sum);
        onAnalysisComplete?.(result);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsAnalyzing(false));
  }, []);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">正在对选中的 {selectedPolicies.filter(p => p.selected).length} 条政策进行核心条款抽取与比对分析...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
        <p className="text-sm">分析失败：{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">政策对比分析</h3>
        <p className="text-xs text-muted-foreground">
          自动抽取参考政策核心条款，对比适用对象、扶持方式与扶持力度，差异高亮标注
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-destructive/20 border border-destructive/30" />
          <span className="text-muted-foreground">力度突出</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30" />
          <span className="text-muted-foreground">值得关注</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30" />
          <span className="text-muted-foreground">特色做法</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-border rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-semibold w-[200px]">政策名称</TableHead>
                <TableHead className="text-xs font-semibold w-[80px]">来源</TableHead>
                <TableHead className="text-xs font-semibold">适用对象</TableHead>
                <TableHead className="text-xs font-semibold">扶持方式</TableHead>
                <TableHead className="text-xs font-semibold">扶持力度</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.map((row, i) => {
                const hasHL = (field: string) => row.highlights.some(h => h.field === field);
                const getHLType = (field: string) => row.highlights.find(h => h.field === field)?.type;

                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="border-b border-border hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="text-xs font-medium text-foreground align-top py-3">
                      {row.policyTitle}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground align-top py-3">
                      {row.source}
                    </TableCell>
                    <TableCell className="text-xs text-foreground align-top py-3">
                      <HighlightCell
                        text={row.targetAudience}
                        isHighlighted={hasHL("targetAudience")}
                        highlightType={getHLType("targetAudience")}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-foreground align-top py-3">
                      <HighlightCell
                        text={row.supportMethod}
                        isHighlighted={hasHL("supportMethod")}
                        highlightType={getHLType("supportMethod")}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-foreground align-top py-3">
                      <HighlightCell
                        text={row.supportLevel}
                        isHighlighted={hasHL("supportLevel")}
                        highlightType={getHLType("supportLevel")}
                      />
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="bg-muted/30 rounded-lg border border-border p-4 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">分析摘要</span>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
          {summary.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
