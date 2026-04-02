import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchTarget = "title" | "content";
type SortMode = "time" | "similarity";

type PolicyResult = {
  id: string;
  title: string;
  department: string;
  docNo: string;
  publishDate: string;
  collected: boolean;
  highlighted?: boolean;
};

const hotKeywords = ["专精特新", "高精尖", "人才十条", "人工智能", "绿色低碳"];

const policies: PolicyResult[] = [
  {
    id: "1",
    title: "北京经济技术开发区经济发展局关于开展2025年生产性服务业十二条政策相关事项（第二批）申报的通知",
    department: "北京经济技术开发区经济发展局",
    docNo: "-",
    publishDate: "2025-08-08",
    collected: true,
    highlighted: true,
  },
  {
    id: "2",
    title: "北京经济技术开发区信息技术产业局关于开展人工智能“模型券”专项奖励申报的通知",
    department: "北京经济技术开发区信息技术产业局",
    docNo: "-",
    publishDate: "2025-08-08",
    collected: true,
  },
  {
    id: "3",
    title: "北京经济技术开发区经济发展局关于开展《北京经济技术开发区促进绿色低碳高质量发展若干措施》节能降碳类事项申报的通知",
    department: "北京经济技术开发区经济发展局",
    docNo: "-",
    publishDate: "2025-08-06",
    collected: true,
  },
  {
    id: "4",
    title: "北京市经济和信息化局 北京市发展和改革委员会 北京市通信管理局关于印发《北京市存量数据中心优化工作方案（2024-2027年）》的通知",
    department: "北京市经济和信息化局；北京市发展和改革委员会；北京市通信管理局",
    docNo: "京经信发〔2024〕62号",
    publishDate: "2024-11-15",
    collected: true,
  },
];

export default function PolicySearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [searchTarget, setSearchTarget] = useState<SearchTarget>((searchParams.get("target") as SearchTarget) || "title");
  const [sortMode, setSortMode] = useState<SortMode>("time");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setKeyword(searchParams.get("q") ?? "");
    setSearchTarget((searchParams.get("target") as SearchTarget) || "title");
  }, [searchParams]);

  const pageResults = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    const filtered = policies.filter((item) => {
      if (!normalized) return true;
      const titleText = `${item.title} ${item.department}`.toLowerCase();
      return titleText.includes(normalized);
    });

    if (sortMode === "time") {
      return [...filtered].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
    }

    return [...filtered].sort((a, b) => Number(b.highlighted) - Number(a.highlighted));
  }, [keyword, sortMode]);

  const allSelected = pageResults.length > 0 && selectedIds.length > 0 && selectedIds.length === pageResults.length;

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? pageResults.map((item) => item.id) : []);
  };

  const toggleSelectItem = (policyId: string, checked: boolean) => {
    setSelectedIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, policyId]));
      }
      return current.filter((id) => id !== policyId);
    });
  };

  const runSearch = () => {
    const next = new URLSearchParams(searchParams);
    if (keyword.trim()) {
      next.set("q", keyword.trim());
    } else {
      next.delete("q");
    }
    next.set("target", searchTarget);
    setSearchParams(next);
  };

  return (
    <div className="min-h-full bg-[#f7f8fa]">
      <div className="mx-auto max-w-[1440px] space-y-6 p-6 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => navigate("/policy-writing")}
            className="inline-flex items-center gap-1 transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            返回政策制定
          </button>
          <span>/</span>
          <span className="text-foreground">政策检索</span>
        </div>

        <Card className="rounded-[28px] border-none bg-white px-6 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="您好！请输入想要检索的政策标题或政策内容～"
                  className="h-14 rounded-2xl border-[#d9dce3] bg-white pl-5 pr-14 text-base shadow-none placeholder:text-[#b0b4be] focus-visible:ring-primary"
                />
                <Search className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6b7280]" />
              </div>
                <Button className="h-14 rounded-2xl bg-primary px-8 text-lg font-semibold hover:bg-primary/90">
                  高级搜索
                </Button>
            </div>

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
                <div className="flex flex-wrap items-center gap-4 text-[15px]">
                  <span className="font-semibold text-primary">热门搜索：</span>
                  {hotKeywords.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setKeyword(item)}
                      className="font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-5 text-[15px]">
                  <span className="font-semibold text-primary">搜索位置：</span>
                  <button
                    type="button"
                    onClick={() => setSearchTarget("title")}
                    className="inline-flex items-center gap-2 text-foreground"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        searchTarget === "title" ? "border-primary" : "border-[#d1d5db]",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          searchTarget === "title" ? "bg-primary" : "bg-transparent",
                        )}
                      />
                    </span>
                    标题
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTarget("content")}
                    className="inline-flex items-center gap-2 text-foreground"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        searchTarget === "content" ? "border-primary" : "border-[#d1d5db]",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          searchTarget === "content" ? "bg-primary" : "bg-transparent",
                        )}
                      />
                    </span>
                    全文
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-[#d8dbe2] px-7 text-base text-foreground"
                  onClick={() => {
                    setKeyword("");
                    setSearchTarget("title");
                    setSelectedIds([]);
                    setSearchParams({});
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  重置
                </Button>
                <Button className="h-12 rounded-xl bg-primary px-8 text-base font-semibold hover:bg-primary/90" onClick={runSearch}>
                  查询
                </Button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-base font-medium text-primary"
                >
                  展开
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-[28px] border-none bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <div className="border-b border-[#eef0f3] px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-6 text-[15px]">
                <div className="flex items-center gap-3">
                    <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))} />
                    <span className="text-[18px] font-semibold text-foreground">
                    相关结果<span className="mx-1 text-primary">{pageResults.length}</span>条
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSortMode("time")}
                  className={cn(
                    "text-[16px] font-medium transition-colors",
                    sortMode === "time" ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  按时间排序
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode("similarity")}
                  className={cn(
                    "text-[16px] font-medium transition-colors",
                    sortMode === "similarity" ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  按相似度排序
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button className="h-12 rounded-xl bg-primary px-7 text-base font-semibold hover:bg-primary/90">
                  批量收藏
                </Button>
                <Button variant="outline" className="h-12 rounded-xl border-[#d8dbe2] px-7 text-base">
                  批量取消收藏
                </Button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#eef0f3]">
            {pageResults.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <div key={item.id} className="flex gap-4 px-6 py-8">
                  <div className="pt-1">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={(checked) => toggleSelectItem(item.id, Boolean(checked))}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-start gap-3">
                      <h3
                        className={cn(
                          "text-[18px] font-semibold leading-8",
                          item.highlighted ? "text-primary" : "text-foreground",
                        )}
                      >
                        {item.title}
                      </h3>
                      {item.highlighted && (
                        <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                          热门匹配
                        </Badge>
                      )}
                    </div>

                    <p className="text-[15px] leading-7 text-[#8b90a0]">
                      发文单位： {item.department}
                      <span className="mx-3">发文字号： {item.docNo}</span>
                      <span>发文时间： {item.publishDate}</span>
                    </p>
                  </div>

                  <div className="flex min-w-[110px] items-center justify-end gap-2 pt-1 text-[#5f6675]">
                    <span className="text-[15px]">{item.collected ? "已收藏" : "收藏"}</span>
                    <Star className={cn("h-5 w-5", item.collected ? "fill-[#f5b800] text-[#f5b800]" : "text-[#c4c8d2]")} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 border-t border-[#eef0f3] px-6 py-5 lg:flex-row lg:items-center lg:justify-end">
            <div className="flex items-center justify-end gap-2 text-[15px] text-foreground">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent transition-colors hover:border-[#d8dbe2] hover:bg-accent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary text-lg font-semibold text-primary">
                1
              </button>
              {[2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-transparent text-lg font-medium transition-colors hover:border-[#d8dbe2] hover:bg-accent"
                >
                  {page}
                </button>
              ))}
              <span className="px-1 text-[#9ca3af]">...</span>
              <button
                type="button"
                className="flex h-12 min-w-[64px] items-center justify-center rounded-xl border border-transparent text-lg font-medium transition-colors hover:border-[#d8dbe2] hover:bg-accent"
              >
                100
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent transition-colors hover:border-[#d8dbe2] hover:bg-accent"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 text-[15px] text-foreground">
              <button
                type="button"
                className="inline-flex h-12 items-center gap-3 rounded-xl border border-[#d8dbe2] px-5"
              >
                10 条/页
                <ChevronDown className="h-4 w-4 text-[#9ca3af]" />
              </button>
              <div className="flex items-center gap-2">
                <span>跳至</span>
                <Input className="h-12 w-20 rounded-xl border-[#d8dbe2] text-center" defaultValue="1" />
                <span>页</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
