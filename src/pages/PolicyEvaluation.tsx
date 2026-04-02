import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  ChevronRight,
  ClipboardList,
  BrainCircuit,
  PenLine,
  Download,
  CircleAlert,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/PageHero";



const recentPolicies = ["北京经开区产业发展促进办法", "科技创新企业扶持专项", "中小企业融资支持政策"];

const dimensions = [
  { title: "整体情况分析", desc: "从政策目标、结构和总体执行情况把握整体画像", icon: FileText, bg: "bg-red-50", iconBg: "bg-red-100", iconColor: "text-primary" },
  { title: "内容逐条分析", desc: "围绕核心条款逐项分析设计逻辑与兑现表现", icon: ClipboardList, bg: "bg-blue-50", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { title: "实施效果分析", desc: "结合执行数据评估政策实施成效与覆盖情况", icon: BarChart3, bg: "bg-green-50", iconBg: "bg-green-100", iconColor: "text-green-600" },
  { title: "存在问题分析", desc: "识别执行偏差、落地堵点与政策设计短板", icon: CircleAlert, bg: "bg-amber-50", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { title: "优化建议分析", desc: "形成面向决策与优化迭代的可执行建议", icon: Lightbulb, bg: "bg-teal-50", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
];

const recentTasks = [
  { name: "北京经开区产业发展促进办法", status: "completed", label: "已完成", time: "2024-03-20", color: "text-green-600", bgColor: "bg-green-50 border-green-200", StatusIcon: CheckCircle2 },
  { name: "科技创新企业扶持专项", status: "in-progress", label: "进行中", time: "2024-03-19", color: "text-orange-500", bgColor: "bg-orange-50 border-orange-200", StatusIcon: Clock },
  { name: "中小企业融资支持政策", status: "editing", label: "编辑中", time: "2024-03-18", color: "text-orange-500", bgColor: "bg-orange-50 border-orange-200", StatusIcon: Clock },
];

const PolicyEvaluation = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("policy") ?? searchParams.get("query") ?? ""
  );
  const navigate = useNavigate();
  const autostart = searchParams.get("autostart") === "1";

  useEffect(() => {
    setSearchQuery(searchParams.get("policy") ?? searchParams.get("query") ?? "");
  }, [searchParams]);

  /** 自动跳转：来自助手推送且 autostart=1 时直接进入评估 */
  useEffect(() => {
    const policyParam = searchParams.get("policy");
    if (autostart && policyParam) {
      navigate(
        `/policy-analysis?policy=${encodeURIComponent(policyParam)}`,
        { replace: true }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHero
          title="政策评价"
          description="面向政策统筹和决策人员，基于数据分析评估政策效果并提供优化建议。"
        />

        {/* Stats + Flow in one row */}
        <div className="flex items-start gap-6">
          <div className="flex h-[150px] w-72 shrink-0 flex-col justify-between rounded-[28px] bg-primary px-5 py-4 text-primary-foreground">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold leading-none">28</span>
                <span className="text-lg font-semibold opacity-90">份</span>
              </div>
              <p className="mt-3 text-base font-semibold">已评估政策数</p>
            </div>
            <div className="flex items-center justify-between border-t border-primary-foreground/20 pt-3">
              <span className="text-sm font-medium opacity-95">本月新增: +5</span>
              <div className="flex items-center gap-1 text-sm font-semibold opacity-95">
                <TrendingUp className="w-3.5 h-3.5" />
                12%
              </div>
            </div>
          </div>

          <Card className="flex-1 p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">政策评价流程</h3>
            <div className="flex items-center justify-between overflow-x-auto">
              {[
                { label: "选择政策", icon: ClipboardList },
                { label: "智能分析", icon: BrainCircuit },
                { label: "编辑润色", icon: PenLine },
                { label: "导出报告", icon: Download },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs whitespace-nowrap text-foreground font-semibold">{step.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex items-center shrink-0 -mt-5">
                      <ChevronRight className="w-5 h-5 text-primary/40" />
                      <ChevronRight className="w-5 h-5 text-primary/40 -ml-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 选择待评估政策 */}
        <Card className="border-2 border-primary shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 pt-6 px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-bold">选择待评估政策</CardTitle>
                <span className="px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">从这里开始</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 ml-[52px]">搜索并选择您要评估的政策，然后开始分析</p>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 pt-4">
            {/* 来自助手推送时显示已选政策提示 */}
            {searchParams.get("policy") && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  已选择政策：<span className="font-medium text-primary">{searchParams.get("policy")}</span>，可直接点击「开始评估」一键生成报告。
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索政策名称/关键词"
                  className={`pl-10 h-12 text-base rounded-lg ${searchParams.get("policy") ? "border-primary/40 bg-primary/5" : "border-border"}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base font-semibold rounded-lg"
                onClick={() =>
                  navigate(
                    searchQuery.trim()
                      ? `/policy-analysis?policy=${encodeURIComponent(searchQuery.trim())}`
                      : "/policy-analysis"
                  )
                }
              >
                {searchParams.get("policy") ? "一键生成报告" : "开始评估"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 核心评估维度 */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">核心评估维度</h3>
          <div className="grid grid-cols-5 gap-4">
            {dimensions.map((d) => (
              <div
                key={d.title}
                className={`${d.bg} rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div className={`w-12 h-12 rounded-xl ${d.iconBg} flex items-center justify-center mb-4`}>
                  <d.icon className={`w-6 h-6 ${d.iconColor}`} />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{d.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 最近评估任务 */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">最近评估任务</h3>
          <div className="grid grid-cols-3 gap-4">
            {recentTasks.map((t) => (
              <div key={t.name} className="border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
                <p className="text-base font-semibold text-foreground mb-4">{t.name}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${t.bgColor} ${t.color}`}>
                    <t.StatusIcon className="w-3.5 h-3.5" />
                    {t.label}
                  </div>
                  <span className="text-sm text-muted-foreground">{t.time}</span>
                </div>
                <button className="flex items-center gap-1.5 text-primary text-sm hover:underline mx-auto">
                  <Eye className="w-4 h-4" />
                  查看详情
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PolicyEvaluation;
