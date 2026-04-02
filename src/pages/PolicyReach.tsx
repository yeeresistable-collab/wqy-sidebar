import { useEffect, useMemo, useState, type ElementType } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle,
  ChevronsRight,
  ChevronRight,
  Clock,
  Factory,
  Filter,
  Search,
  Send,
  Tag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DEPARTMENTS, POLICY_ITEMS, PUSHED_COMPANIES, type PolicyItem, type PushedCompany } from "@/data/policyReachData";
import { PageHero } from "@/components/PageHero";

const TYPE_META: Record<string, { bg: string; text: string }> = {
  补贴: { bg: "bg-blue-100", text: "text-blue-700" },
  奖励: { bg: "bg-amber-100", text: "text-amber-700" },
  减免: { bg: "bg-emerald-100", text: "text-emerald-700" },
  服务: { bg: "bg-purple-100", text: "text-purple-700" },
  融资: { bg: "bg-rose-100", text: "text-rose-700" },
};

const STATUS_META: Record<PushedCompany["status"], { icon: ElementType; color: string; bg: string }> = {
  已触达: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  已申报: { icon: BadgeCheck, color: "text-blue-600", bg: "bg-blue-50" },
  未响应: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
};

const SIZE_COLOR: Record<PushedCompany["size"], string> = {
  大型: "text-primary",
  中型: "text-blue-600",
  小型: "text-amber-600",
  微型: "text-muted-foreground",
};

const reachFlowSteps = [
  { icon: Tag, title: "政策自动打标", tag: "做识别" },
  { icon: Users, title: "企业画像匹配", tag: "找对象" },
  { icon: Send, title: "政策智能推送", tag: "做触达" },
  { icon: TrendingUp, title: "触达效果检测", tag: "看反馈" },
];

const reachOverviewStats = [
  { label: "触达政策数量", value: "128", unit: "项", note: "本月新增 12 项", icon: Tag, color: "text-primary", bg: "bg-primary/10" },
  { label: "覆盖企业数量", value: "3,286", unit: "家", note: "较上周提升 8.6%", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  { label: "触达次数", value: "9,842", unit: "次", note: "短信、站内信、专员触达", icon: Send, color: "text-blue-600", bg: "bg-blue-500/10" },
  { label: "申报转化率", value: "34.7", unit: "%", note: "近 30 天平均转化率", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-500/10" },
];

function PolicyList({ onSelect, initialSearch }: { onSelect: (item: PolicyItem) => void; initialSearch?: string }) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    setSearch(initialSearch ?? "");
  }, [initialSearch]);

  const filtered = useMemo(() => {
    return POLICY_ITEMS.filter((item) => {
      const matchSearch = !search || item.title.includes(search) || item.department.includes(search);
      const matchDept = deptFilter === "all" || item.department === deptFilter;
      const matchStart = !startFilter || item.startDate >= startFilter;
      const matchEnd = !endFilter || item.endDate <= endFilter;
      return matchSearch && matchDept && matchStart && matchEnd;
    });
  }, [deptFilter, endFilter, search, startFilter]);

  const activeFilterCount = [deptFilter !== "all", !!startFilter, !!endFilter].filter(Boolean).length;

  const clearFilters = () => {
    setDeptFilter("all");
    setStartFilter("");
    setEndFilter("");
  };

  const isDeadlineSoon = (endDate: string) => {
    const diff = (new Date(endDate).getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 14;
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索事项名称或部门..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilter((current) => !current)}
              className={`flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors ${
                showFilter || activeFilterCount > 0
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <Filter className="h-4 w-4" />
              筛选
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilter && (
            <div className="overflow-hidden">
                <div className="space-y-4 rounded-xl border border-border bg-card p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        主管部门
                      </label>
                      <select
                        value={deptFilter}
                        onChange={(event) => setDeptFilter(event.target.value)}
                        className="h-9 w-full cursor-pointer rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="all">全部部门</option>
                        {DEPARTMENTS.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        兑现开始
                      </label>
                      <input
                        type="date"
                        value={startFilter}
                        onChange={(event) => setStartFilter(event.target.value)}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        兑现截止
                      </label>
                      <input
                        type="date"
                        value={endFilter}
                        onChange={(event) => setEndFilter(event.target.value)}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  {activeFilterCount > 0 && (
                    <div className="flex justify-end">
                      <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                        <X className="h-3 w-3" />
                        清除所有筛选
                      </button>
                    </div>
                  )}
                </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            共 <span className="font-semibold text-foreground">{filtered.length}</span> 条事项
          </p>
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Search className="h-10 w-10 opacity-30" />
            <p className="text-sm">暂无匹配事项</p>
          </Card>
        ) : (
          filtered.map((item, index) => {
            const expired = isExpired(item.endDate);
            const soon = isDeadlineSoon(item.endDate);
            const typeMeta = TYPE_META[item.type];

            return (
              <div key={item.id}>
                <Card
                  className="cursor-pointer p-5 transition-all hover:-translate-y-px hover:border-primary/30 hover:shadow-md"
                  onClick={() => onSelect(item)}
                >
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="flex flex-wrap items-start gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${typeMeta.bg} ${typeMeta.text}`}>
                          {item.type}
                        </span>
                        {soon && !expired && (
                          <span className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                            <Clock className="h-3 w-3" />
                            即将截止
                          </span>
                        )}
                        {expired && <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">已结束</span>}
                        <h3 className="text-sm font-semibold text-foreground transition-colors hover:text-primary">{item.title}</h3>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {item.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          兑现：{item.startDate} ~ {item.endDate}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xl font-bold text-primary">{item.totalPushed}</p>
                      <p className="text-[10px] text-muted-foreground">已推送企业</p>
                      <ChevronRight className="ml-auto mt-2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PolicyDetail({
  item,
  onBack,
  initialSearch,
  initialExpandedId,
}: {
  item: PolicyItem;
  onBack: () => void;
  initialSearch?: string;
  initialExpandedId?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setSearch(initialSearch ?? "");
  }, [initialSearch]);

  useEffect(() => {
    setExpandedId(initialExpandedId ?? null);
  }, [initialExpandedId]);

  const companies = useMemo(() => PUSHED_COMPANIES.filter((company) => company.policyId === item.id), [item.id]);

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const matchSearch =
        !search || company.name.includes(search) || company.industry.includes(search) || company.registrationNo.includes(search);
      const matchStatus = statusFilter === "all" || company.status === statusFilter;
      const matchSize = sizeFilter === "all" || company.size === sizeFilter;
      return matchSearch && matchStatus && matchSize;
    });
  }, [companies, search, sizeFilter, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      已触达: companies.filter((company) => company.status === "已触达").length,
      已申报: companies.filter((company) => company.status === "已申报").length,
      未响应: companies.filter((company) => company.status === "未响应").length,
    }),
    [companies],
  );

  return (
    <div className="space-y-5">
      <div>
        <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回事项列表
        </button>

        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${TYPE_META[item.type].bg} ${TYPE_META[item.type].text}`}>
              {item.type}
            </span>
            <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {item.department}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              兑现期：{item.startDate} ~ {item.endDate}
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "推送总数", value: companies.length, icon: Send, color: "text-primary" },
          { label: "已申报", value: statusCounts.已申报, icon: BadgeCheck, color: "text-blue-600" },
          { label: "未响应", value: statusCounts.未响应, icon: AlertCircle, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-3 px-4 py-3">
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索企业名称、统一社会信用代码、行业..."
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-w-[100px] cursor-pointer rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
          >
            <option value="all">全部状态</option>
            <option value="已申报">已申报</option>
            <option value="未响应">未响应</option>
          </select>
          <select
            value={sizeFilter}
            onChange={(event) => setSizeFilter(event.target.value)}
            className="min-w-[90px] cursor-pointer rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
          >
            <option value="all">全部规模</option>
            <option value="大型">大型</option>
            <option value="中型">中型</option>
            <option value="小型">小型</option>
            <option value="微型">微型</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground">
          共 <span className="font-semibold text-foreground">{filtered.length}</span> 家企业
        </p>
      </Card>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Users className="h-10 w-10 opacity-30" />
            <p className="text-sm">暂无匹配企业</p>
          </Card>
        ) : (
          filtered.map((company, index) => {
            const displayStatus = company.status === "已触达" ? "已申报" : company.status;
            const statusMeta = STATUS_META[displayStatus];
            const isExpanded = expandedId === company.id;

            return (
              <div key={company.id}>
                <Card className="overflow-hidden">
                  <div
                    className="flex cursor-pointer items-start gap-4 p-4 transition-colors hover:bg-muted/20"
                    onClick={() => setExpandedId(isExpanded ? null : company.id)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {company.name.slice(2, 4)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">{company.name}</h4>
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusMeta.bg} ${statusMeta.color}`}>
                          <statusMeta.icon className="h-3 w-3" />
                          {displayStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Factory className="h-3.5 w-3.5" />
                          {company.industry}
                        </span>
                        <span className={`font-medium ${SIZE_COLOR[company.size]}`}>{company.size}企业</span>
                        <span className="font-mono text-[11px]">{company.registrationNo}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {company.matchPoints.slice(0, 2).map((point) => (
                          <span key={point} className="flex items-center gap-1 rounded-md border border-primary/15 bg-primary/8 px-2 py-0.5 text-[11px] text-primary">
                            <CheckCircle className="h-3 w-3" />
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>

                  {isExpanded && (
                    <div className="overflow-hidden">
                        <div className="space-y-4 border-t border-border bg-muted/20 px-5 py-4">
                          <div>
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                              <Tag className="h-3.5 w-3.5 text-primary" />
                              符合事项要求的条件
                            </p>
                            <ul className="space-y-1.5">
                              {company.matchPoints.map((point) => (
                                <li key={point} className="flex items-start gap-2 text-xs text-foreground">
                                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                              <TrendingUp className="h-3.5 w-3.5 text-primary" />
                              推送原因
                            </p>
                            <p className="rounded-lg border border-border bg-background px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                              {company.pushReason}
                            </p>
                          </div>
                        </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function PolicyReach() {
  const [searchParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<PolicyItem | null>(null);
  const assistantQuery = searchParams.get("q") ?? "";
  const assistantItemId = searchParams.get("itemId");
  const assistantCompanyId = searchParams.get("companyId");

  useEffect(() => {
    if (assistantItemId) {
      const matchedItem = POLICY_ITEMS.find((item) => item.id === assistantItemId) ?? null;
      setSelectedItem(matchedItem);
      return;
    }

    if (assistantQuery) {
      setSelectedItem(null);
    }
  }, [assistantItemId, assistantQuery]);

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHero
          title="政策触达"
          description="面向政策执行人员，实现政策与企业的精准匹配与高效触达。"
        />

        {!selectedItem && (
          <div className="space-y-4">
            <Card className="border border-border px-6 py-4">
              <h2 className="mb-4 text-base font-bold text-foreground">政策触达流程</h2>
              <div className="flex items-center justify-between gap-2 overflow-x-auto">
                {reachFlowSteps.map((step, i) => (
                  <div key={step.title} className="flex min-w-[170px] flex-1 items-center">
                    <div className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="whitespace-nowrap text-sm font-semibold text-foreground">{step.title}</span>
                      <span className="text-xs text-muted-foreground">{step.tag}</span>
                    </div>
                    {i < reachFlowSteps.length - 1 && (
                      <ChevronsRight className="h-6 w-6 shrink-0 text-primary/30" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {reachOverviewStats.map((stat) => (
                <Card key={stat.label} className="border border-border p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <div className="mt-3 flex items-end gap-1">
                        <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                        <span className="pb-1 text-sm text-muted-foreground">{stat.unit}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{stat.note}</p>
                    </div>
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedItem ? (
          <div>
              <PolicyDetail
                item={selectedItem}
                onBack={() => setSelectedItem(null)}
                initialSearch={assistantQuery}
                initialExpandedId={assistantCompanyId}
              />
          </div>
        ) : (
          <div>
              <PolicyList onSelect={setSelectedItem} initialSearch={assistantQuery} />
          </div>
        )}
      </div>
    </div>
  );
}
