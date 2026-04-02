import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { searchPolicies } from "@/lib/policyDraftApi";

export interface PolicyItem {
  id: string;
  title: string;
  url: string;
  selected: boolean;
  level: "national" | "beijing" | "other";
  source?: string;
}

interface PolicySearchStepProps {
  policyTitle: string;
  coreElements: string;
  onPoliciesSelected: (policies: PolicyItem[]) => void;
  policies: PolicyItem[];
}


const levelLabels: Record<string, string> = {
  national: "国家级政策",
  beijing: "北京市政策",
  other: "其他省市政策",
};

export function PolicySearchStep({ policyTitle, coreElements, onPoliciesSelected, policies: externalPolicies }: PolicySearchStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(externalPolicies.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [policies, setPolicies] = useState<PolicyItem[]>(externalPolicies.length > 0 ? externalPolicies : []);
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (externalPolicies.length > 0) return;
    setIsSearching(true);
    setError(null);
    searchPolicies(policyTitle, coreElements)
      .then(({ policies: result }) => {
        setPolicies(result);
        onPoliciesSelected(result);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsSearching(false));
  }, [policyTitle, coreElements]);

  const togglePolicy = (id: string) => {
    const updated = policies.map(p => p.id === id ? { ...p, selected: !p.selected } : p);
    setPolicies(updated);
    onPoliciesSelected(updated);
  };

  const toggleLevel = (level: string) => {
    setCollapsedLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };

  const toggleAllInLevel = (level: string) => {
    const levelPolicies = policies.filter(p => p.level === level);
    const allSelected = levelPolicies.every(p => p.selected);
    const updated = policies.map(p => p.level === level ? { ...p, selected: !allSelected } : p);
    setPolicies(updated);
    onPoliciesSelected(updated);
  };

  const filteredPolicies = searchQuery
    ? policies.filter(p => p.title.includes(searchQuery) || p.source?.includes(searchQuery))
    : policies;

  const levels: Array<"national" | "beijing" | "other"> = ["national", "beijing", "other"];

  const selectedCount = policies.filter(p => p.selected).length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">智能政策检索</h3>
        <p className="text-xs text-muted-foreground">
          根据「{policyTitle}」自动检索相关政策，默认全部选中作为参考文档
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索政策库..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">正在根据政策标题智能检索相关政策...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
          <p className="text-sm">检索失败：{error}</p>
          <button
            className="text-xs underline text-muted-foreground hover:text-foreground"
            onClick={() => {
              setError(null);
              setIsSearching(true);
              searchPolicies(policyTitle, coreElements)
                .then(({ policies: result }) => { setPolicies(result); onPoliciesSelected(result); })
                .catch((err: Error) => setError(err.message))
                .finally(() => setIsSearching(false));
            }}
          >
            重试
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              共检索到 <span className="text-foreground font-medium">{policies.length}</span> 条相关政策，
              已选 <span className="text-primary font-medium">{selectedCount}</span> 条作为参考
            </p>
          </div>

          {levels.map(level => {
            const levelPolicies = filteredPolicies.filter(p => p.level === level);
            if (levelPolicies.length === 0) return null;
            const allSelected = levelPolicies.every(p => p.selected);
            const someSelected = levelPolicies.some(p => p.selected);
            const isCollapsed = collapsedLevels[level];

            return (
              <div key={level} className="border border-border rounded-lg overflow-hidden">
                {/* Level header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleLevel(level)}
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">{levelLabels[level]}</span>
                    <span className="text-xs text-muted-foreground">（{levelPolicies.length}）</span>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={allSelected}
                      // @ts-ignore
                      indeterminate={someSelected && !allSelected}
                      onCheckedChange={() => toggleAllInLevel(level)}
                    />
                    <span className="text-xs text-muted-foreground">全选</span>
                  </div>
                </div>

                {/* Policy list */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="divide-y divide-border">
                        {levelPolicies.map((policy, i) => (
                          <div
                            key={policy.id}
                            className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/20 ${
                              policy.selected ? "bg-primary/[0.02]" : ""
                            }`}
                          >
                            <Checkbox
                              checked={policy.selected}
                              onCheckedChange={() => togglePolicy(policy.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <a
                                href={policy.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline truncate block"
                                onClick={e => e.stopPropagation()}
                              >
                                {policy.title}
                              </a>
                            </div>
                            {policy.source && (
                              <span className="text-xs text-muted-foreground shrink-0">{policy.source}</span>
                            )}
                            <a
                              href={policy.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
