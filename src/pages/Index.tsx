import { useNavigate } from "react-router-dom";
import { FileText, BarChart3, Award, ArrowRight, BookOpen, Building2, Bot, Wallet, RefreshCw, ChevronRight, Eye, Clock, ClipboardList, DollarSign, Users } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/PageHero";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header + 流程 */}
        <div className="space-y-4">
          <PageHero
            title="政策兑现"
            description="面向政策执行人员，支持企业评优、效果监测与专报生成，实时掌握兑现情况。"
          />

          {/* 政策兑现流程 */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">政策兑现流程</h3>
            <div className="flex items-center justify-between overflow-x-auto">
              {[
                { label: "事项发布", icon: BookOpen, highlight: false },
                { label: "企业申报", icon: Building2, highlight: false },
                { label: "企业智能评优", icon: Bot, highlight: true },
                { label: "资金兑现与拨付", icon: Wallet, highlight: true },
                { label: "专报分析与问题发现", icon: BarChart3, highlight: true },
                { label: "政策优化迭代", icon: RefreshCw, highlight: false },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.highlight ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs whitespace-nowrap ${step.highlight ? "text-primary font-semibold" : "text-muted-foreground"}`}>{step.label}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <Card
          className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
          onClick={() => navigate("/enterprise-evaluation")}
        >
          <div className="flex items-center gap-3 p-5 pb-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--gov-orange))]/10 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-[hsl(var(--gov-orange))]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">企业智能评优</h3>
              <p className="text-xs text-muted-foreground"><p className="text-xs text-muted-foreground">智能评分，精准择优</p></p>
            </div>
          </div>
          <div className="px-5 pb-3 flex-1 space-y-3">
            <div className="bg-accent/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-foreground" />
                  </div>
                  <span>申报企业<br/>标签匹配</span>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-foreground" />
                  </div>
                  <span>权重配置</span>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
                    <Bot className="w-4 h-4 text-foreground" />
                  </div>
                  <span>AI自动评分</span>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
                    <Award className="w-4 h-4 text-foreground" />
                  </div>
                  <span>择优筛选列表</span>
                </div>
              </div>
            </div>
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-xs font-semibold text-foreground mb-2">当前评优事项</p>
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground leading-relaxed">2026年信息技术产业领域平台建设专项奖励</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">2026年未来能源领域首台（套）首批次区级认定支持</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">2022-2024年度燃料电池汽车示范应用配套支持</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">2025年度未来能源关键技术创新研发支持</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">2025年新增交通运输业企业奖励</p>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 mt-auto">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
              点击进入智能评优
            </Button>
          </div>
        </Card>

        {/* 兑现效果检测 (stays in middle) */}
        <Card
          className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
          onClick={() => navigate("/effect-dashboard")}
        >
          <div className="flex items-center gap-3 p-5 pb-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--gov-blue))]/10 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 text-[hsl(var(--gov-blue))]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">兑现效果检测</h3>
              <p className="text-xs text-muted-foreground"><p className="text-xs text-muted-foreground">实时监测，动态评估</p></p>
            </div>
          </div>
          <div className="px-5 pb-3 flex-1 space-y-3">
            {/* 上排：饼图 + 柱状图 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-accent/50 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground text-center mb-1">事项兑现情况</p>
                <ResponsiveContainer width="100%" height={80}>
                  <PieChart>
                    <Pie data={[{ name: "已兑现", value: 76 }, { name: "未兑现", value: 23 }]} cx="50%" cy="50%" innerRadius={20} outerRadius={32} dataKey="value" strokeWidth={1}>
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}项`} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-center text-muted-foreground">已兑现 <span className="font-bold text-foreground">76</span>/99 项</p>
              </div>
              <div className="bg-accent/50 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground text-center mb-1">已兑现资金(亿元)</p>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={[{ name: "2022", v: 5.2 }, { name: "2023", v: 12.8 }, { name: "2024", v: 45.6 }, { name: "2025", v: 21.7 }]} barSize={14}>
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Bar dataKey="v" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    <Tooltip formatter={(v: number) => `${v}亿`} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* 下排：企业饼图 + 数字 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-accent/50 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground text-center mb-1">扶持企业分布</p>
                <ResponsiveContainer width="100%" height={80}>
                  <PieChart>
                    <Pie data={[{ name: "大型企业", value: 320 }, { name: "中型企业", value: 980 }, { name: "小微企业", value: 1999 }]} cx="50%" cy="50%" innerRadius={20} outerRadius={32} dataKey="value" strokeWidth={1}>
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--gov-blue))" />
                      <Cell fill="hsl(var(--gov-orange))" />
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}家`} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-center text-muted-foreground">共 <span className="font-bold text-foreground">3299</span> 家</p>
              </div>
              <div className="bg-accent/50 rounded-lg p-2 flex flex-col items-center justify-center gap-1">
                <DollarSign className="w-5 h-5 text-primary" />
                <p className="text-lg font-bold text-foreground leading-tight">85.3<span className="text-[10px] font-normal text-muted-foreground ml-0.5">亿元</span></p>
                <p className="text-[10px] text-muted-foreground">已兑现资金总额</p>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 mt-auto">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
              点击进入兑现效果检测
            </Button>
          </div>
        </Card>

        {/* 兑现专报生成 (was first, now third) */}
        <Card
          className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
          onClick={() => navigate("/policy-report")}
        >
          <div className="flex items-center gap-3 p-5 pb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">兑现专报生成</h3>
              <p className="text-xs text-muted-foreground"><p className="text-xs text-muted-foreground">AI分析，决策支撑</p></p>
            </div>
          </div>
          <div className="px-5 pb-3 flex-1">
            <div className="grid grid-cols-2 gap-3">
              {["整体态势", "事项分布", "资金分布", "企业分布"].map((label) => (
                <div key={label} className="bg-accent/50 rounded-lg p-3 flex flex-col items-center">
                  <p className="text-xs text-muted-foreground mb-2">【{label}】</p>
                  <div className="w-14 h-14 rounded-full border-4 border-primary/30 border-t-primary border-r-primary/60 relative flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-card" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-accent/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">AI优化建议：</span>北京市经开区XX政策资金利用率可提升，建议优化兑现流转效率。
              </p>
            </div>
          </div>
          <div className="px-5 pb-5 mt-auto">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
              点击进入生成专报
            </Button>
          </div>
        </Card>
        </div>

        {/* 最新生成专报 */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">最近生成专报</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "北京经开区产业发展促进办法", status: "已完成", statusColor: "text-green-600 bg-green-50 border-green-200", date: "2024-03-20" },
              { title: "科技创新企业扶持专项", status: "进行中", statusColor: "text-orange-600 bg-orange-50 border-orange-200", date: "2024-03-19" },
              { title: "中小企业融资支持政策", status: "编辑中", statusColor: "text-orange-600 bg-orange-50 border-orange-200", date: "2024-03-18" },
            ].map((report) => (
              <div key={report.title} className="border rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">{report.title}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-[10px] ${report.statusColor}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1" />
                    {report.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{report.date}</span>
                </div>
                <div className="flex justify-end">
                  <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Eye className="w-3 h-3" /> 查看详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
