import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, FileText, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { PolicyItem } from "./PolicySearchStep";
import { generateCoreElementsFromPolicies } from "@/lib/policyDraftApi";

interface PolicyAnalysisStepProps {
  selectedPolicies: PolicyItem[];
  /** 分析完成後回傳结果给父层（兼容旧逻辑） */
  onAnalysisComplete?: (analysis: ClauseComparison[]) => void;
  /** 生成的核心要素（换行分隔）发生变化时回调 */
  onCoreElementsChange?: (coreElements: string) => void;
  /** 生成的核心要素 items（包含引用 clause）变化回调 */
  onCoreElementsItemsChange?: (items: { id: string; text: string; refs: { id: string; title: string; url?: string; clause?: string }[] }[]) => void;
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

export function PolicyAnalysisStep({ selectedPolicies, onAnalysisComplete, onCoreElementsChange, onCoreElementsItemsChange }: PolicyAnalysisStepProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<{ id: string; text: string; refs: { id: string; title: string; url?: string; clause?: string }[] }[]>([]);
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    setIsGenerating(true);
    setError(null);
    generateCoreElementsFromPolicies(selectedPolicies)
      .then(({ coreElements, items: result }) => {
        setItems(result);
        onCoreElementsChange?.(coreElements);
        onCoreElementsItemsChange?.(result);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsGenerating(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeItem = (id: string) => {
    const next = items.filter(i => i.id !== id);
    setItems(next);
    onCoreElementsChange?.(next.map(it => it.text).join("\n"));
    onCoreElementsItemsChange?.(next);
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    const it = { id: `ce-${Date.now()}`, text: newItemText.trim(), refs: [] as { id: string; title: string; url?: string; clause?: string }[] };
    const next = [...items, it];
    setItems(next);
    setNewItemText("");
    onCoreElementsChange?.(next.map(it => it.text).join("\n"));
    onCoreElementsItemsChange?.(next);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">正在根据已选参考政策抽取核心要素…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
        <p className="text-sm">生成失败：{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">核心要素生成</h3>
        <p className="text-xs text-muted-foreground">
          从选中的参考政策中总结出核心要点，并标注来源。支持手动添加和删除要点。
        </p>
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-3 p-3 border border-border rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">{it.text}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <TooltipProvider>
                  {it.refs.map((r) => (
                    <Tooltip key={r.id}>
                      <TooltipTrigger asChild>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/20 text-xs text-muted-foreground cursor-help"
                        >
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[240px]">{r.title}</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="w-80">
                        <div className="text-xs text-muted-foreground mb-2 whitespace-pre-wrap">{r.clause}</div>
                        {r.url && (
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                            打开原文
                          </a>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
                {it.refs.length === 0 && <span className="text-xs text-muted-foreground italic">未标注参考政策</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={() => removeItem(it.id)} className="text-destructive hover:underline text-xs flex items-center gap-1">
                <X className="h-3 w-3" /> 删除
              </button>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2">
          <input
            placeholder="添加新的核心要素，例如：明确扶持对象和范围"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="flex-1 rounded border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30"
          />
          <Button onClick={addItem} className="h-9">添加</Button>
        </div>
      </div>
    </div>
  );
}
