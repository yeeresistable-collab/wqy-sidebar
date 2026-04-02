import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, BookOpen, CheckCircle } from "lucide-react";
import { dashboardData } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";

const COLORS = [
  "hsl(210,70%,50%)", "hsl(145,55%,45%)", "hsl(38,90%,55%)",
  "hsl(350,85%,42%)", "hsl(25,90%,55%)", "hsl(280,60%,50%)"
];

type TabType = "redeem" | "publish";

const EffectDashboard = () => {
  const [searchParams] = useSearchParams();
  const focus = searchParams.get("focus") ?? "items";
  const [activeTab, setActiveTab] = useState<TabType>(focus === "publish" ? "publish" : "redeem");
  const focusLabel =
    focus === "publish" ? "政策发布情况" : focus === "funds" ? "资金兑现情况" : focus === "enterprise" ? "扶持企业分布" : "兑现事项情况";

  useEffect(() => {
    setActiveTab(focus === "publish" ? "publish" : "redeem");
  }, [focus]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background relative">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-primary/90 via-primary to-primary/90 py-3 px-6 flex items-center justify-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="text-lg font-bold text-primary-foreground tracking-widest">北京市经开区兑现效果检测</h1>
      </div>

      {/* Tab Switcher - centered */}
      <div className="flex justify-center py-3">
        <div className="flex bg-muted rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("publish")}
            className={`flex items-center gap-2 px-8 py-2.5 text-sm font-medium transition-all ${
              activeTab === "publish"
                ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`w-6 h-6 rounded flex items-center justify-center ${
              activeTab === "publish" ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
            }`}>
              <FileText className="w-3.5 h-3.5" />
            </div>
            政策发布情况
          </button>
          <button
            onClick={() => setActiveTab("redeem")}
            className={`flex items-center gap-2 px-8 py-2.5 text-sm font-medium transition-all ${
              activeTab === "redeem"
                ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`w-6 h-6 rounded flex items-center justify-center ${
              activeTab === "redeem" ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
            }`}>
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            政策兑现情况
          </button>
        </div>
      </div>

      {/* Date Picker - left aligned */}
      <div className="flex items-center gap-3 px-6 pb-3">
        <span className="text-sm text-muted-foreground font-medium">日期</span>
        <Button variant="outline" size="sm" className="gap-2 px-4 bg-card">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">请选择月份</span>
        </Button>
        <div className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
          当前聚焦：{focusLabel}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {activeTab === "redeem" ? <RedeemView focus={focus} /> : <PublishView />}
      </div>
    </div>
  );
};

/* ==================== 政策兑现情况 ==================== */
function RedeemView({ focus }: { focus: string }) {
  const [itemSubTab, setItemSubTab] = useState(focus === "items" ? 1 : 0);
  const [fundSubTab, setFundSubTab] = useState(focus === "funds" ? 1 : 0);
  const [entSubTab, setEntSubTab] = useState(focus === "enterprise" ? 1 : 0);

  useEffect(() => {
    setItemSubTab(focus === "items" ? 1 : 0);
    setFundSubTab(focus === "funds" ? 1 : 0);
    setEntSubTab(focus === "enterprise" ? 1 : 0);
  }, [focus]);

  const { redeemedItems, redeemedFunds, supportedEnterprises } = dashboardData;

  const itemTabs = ["近六年兑现事项数量", "所选年度兑现事项数量", "兑现事项扶持领域分布"];
  const fundTabs = ["近六年兑现资金统计", "所选年度兑资金统计", "兑现资金扶持领域分布"];
  const entTabs = ["近六年扶持企业数量", "所选年度扶持企业数量", "扶持企业注册资本分布"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* ---- 已兑现事项分析 ---- */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 bg-primary" />
        <CardContent className="p-5">
          <h3 className="text-lg font-bold text-primary mb-4">已兑现事项分析</h3>

          {/* Two donuts side by side */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <LabeledDonut data={redeemedItems.byType} colors={COLORS} />
            <LabeledDonut data={redeemedItems.byStatus} colors={["hsl(210,70%,50%)", "hsl(145,55%,45%)", "hsl(38,90%,55%)"]} />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              已兑现事项数量统计
            </p>
            <SubTabs tabs={itemTabs} active={itemSubTab} onChange={setItemSubTab} />
            <div className="h-[200px] mt-3">
              {itemSubTab === 0 && <TrendLineChart data={redeemedItems.yearlyTrend} label="兑现数量" />}
              {itemSubTab === 1 && <TrendBarChart data={redeemedItems.yearlyTrend} label="兑现数量" />}
              {itemSubTab === 2 && <DistPieChart data={redeemedItems.byField} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- 已兑现资金分析 ---- */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 bg-primary" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-primary">已兑现资金分析</h3>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">本月已拨付资金</p>
              <p className="text-2xl font-bold text-foreground">{redeemedFunds.totalMonthly.toLocaleString()}<span className="text-sm font-normal text-muted-foreground ml-1">万元</span></p>
            </div>
          </div>

          {/* Department bars + Status donut */}
          <div className="grid grid-cols-[1fr_120px] gap-3 mb-4">
            <div className="space-y-1.5">
              {redeemedFunds.byDepartment.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-28 truncate text-muted-foreground">{d.name}</span>
                  <div className="flex-1 bg-muted rounded h-2.5 overflow-hidden">
                    <div className="h-full rounded bg-primary/80" style={{ width: `${(d.amount / 232968) * 100}%` }} />
                  </div>
                  <span className="text-muted-foreground w-20 text-right font-mono text-[10px]">{d.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <LabeledDonut data={redeemedFunds.byStatus} colors={["hsl(210,70%,50%)", "hsl(145,55%,45%)", "hsl(38,90%,55%)"]} />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              已兑现资金情况统计
            </p>
            <SubTabs tabs={fundTabs} active={fundSubTab} onChange={setFundSubTab} />
            <div className="h-[200px] mt-3">
              {fundSubTab === 0 && <TrendLineChart data={redeemedFunds.yearlyTrend} label="兑现资金金额" />}
              {fundSubTab === 1 && <TrendBarChart data={redeemedFunds.yearlyTrend} label="兑现资金" />}
              {fundSubTab === 2 && <DistPieChart data={redeemedFunds.byField} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- 扶持企业情况 ---- */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 bg-primary" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-primary">扶持企业情况</h3>
            <div className="bg-accent text-primary rounded-lg px-4 py-2 text-right">
              <p className="text-xs">扶持企业数</p>
              <p className="text-2xl font-bold">{supportedEnterprises.total.toLocaleString()}<span className="text-sm font-normal ml-1">家</span></p>
            </div>
          </div>

          {/* Two donuts */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <LabeledDonut data={supportedEnterprises.byScale} colors={COLORS} />
            <LabeledDonut data={supportedEnterprises.byIndustry} colors={["hsl(145,55%,45%)", "hsl(210,70%,50%)", "hsl(38,90%,55%)", "hsl(350,85%,42%)"]} />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              已扶持企业情况统计
            </p>
            <SubTabs tabs={entTabs} active={entSubTab} onChange={setEntSubTab} />
            <div className="h-[200px] mt-3">
              {entSubTab === 0 && <TrendLineChart data={supportedEnterprises.yearlyTrend} label="年度扶持企业数量" />}
              {entSubTab === 1 && <TrendBarChart data={supportedEnterprises.yearlyCount} label="企业数量" />}
              {entSubTab === 2 && <DistPieChart data={supportedEnterprises.capitalDistribution} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ==================== 政策发布情况 ==================== */
function PublishView() {
  const { departmentStats, policyPublished, policyInterpreted, itemsPublished, policyByLevel, itemFlow } = dashboardData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_200px] gap-4">
      {/* Left: Department horizontal bar chart */}
      <Card className="border-0 shadow-md overflow-hidden row-span-2">
        <div className="h-1 bg-primary" />
        <CardContent className="p-5">
          <h3 className="text-lg font-bold text-primary mb-3">部门发布情况</h3>
          <div className="flex items-center gap-5 mb-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary" /> 各部门事项发布数量
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gov-orange" /> 各部门政策发布数量
            </span>
          </div>
          <ResponsiveContainer width="100%" height={560}>
            <BarChart data={departmentStats} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
              <Tooltip />
              <Bar dataKey="items" name="事项发布数" fill="hsl(350,85%,42%)" radius={[0, 3, 3, 0]} barSize={7} />
              <Bar dataKey="published" name="政策发布数" fill="hsl(25,90%,55%)" radius={[0, 3, 3, 0]} barSize={7} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Middle top: 3 stat cards */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "政策发布", value: policyPublished, unit: "条", icon: FileText, color: "text-primary" },
            { label: "政策解读", value: policyInterpreted, unit: "条", icon: BookOpen, color: "text-primary" },
            { label: "事项发布", value: itemsPublished, unit: "项", icon: CheckCircle, color: "text-primary" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-md">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-accent rounded-lg flex items-center justify-center">
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-foreground">{s.value}<span className="text-base font-normal text-muted-foreground ml-1">{s.unit}</span></p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Policy by level */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 bg-primary" />
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-primary mb-5">兑现相关政策发布数量</h3>
            <div className="grid grid-cols-3 gap-4">
              {policyByLevel.map((p) => (
                <div key={p.level} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-4">
                    <span className="w-2 h-2 bg-primary rounded-sm" />
                    <span className="text-2xl font-bold text-foreground">{p.count}</span>
                    <span className="text-sm text-muted-foreground">条</span>
                  </div>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-primary/50" />
                  </div>
                  <div className="inline-block bg-gradient-to-r from-primary/80 to-primary text-primary-foreground rounded-md px-6 py-1.5 text-sm font-medium">
                    {p.level}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Item flow */}
      <Card className="border-0 shadow-md overflow-hidden row-span-2">
        <div className="h-1 bg-primary" />
        <CardContent className="p-4">
          <h3 className="text-lg font-bold text-primary mb-4">事项流转情况</h3>
          <div className="space-y-3">
            {[
              { label: "申报中", value: itemFlow.applying, unit: "项", highlight: false },
              { label: "申报已截止", value: itemFlow.expired, unit: "项", highlight: true },
              { label: "已确认扶持结果", value: itemFlow.confirmed, unit: "项", highlight: true },
              { label: "已兑现", value: itemFlow.redeemed, unit: "项", highlight: true },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-border p-4 text-center bg-card">
                <p className="text-sm text-muted-foreground mb-2">{f.label}</p>
                <p className={`text-2xl font-bold ${f.highlight ? "text-primary" : "text-foreground"}`}>
                  {f.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">{f.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ==================== Shared Chart Components ==================== */
function SubTabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(i)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors border ${
            active === i
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/30"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function LabeledDonut({ data, colors }: { data: { name: string; value: number }[]; colors: string[] }) {
  return (
    <div className="h-[140px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={50}
            dataKey="value"
            nameKey="name"
            strokeWidth={1}
            stroke="hsl(0,0%,100%)"
            label={({ name, cx, cy, midAngle, outerRadius: or }) => {
              const RADIAN = Math.PI / 180;
              const radius = (or as number) + 18;
              const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
              const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text x={x} y={y} textAnchor={x > (cx as number) ? "start" : "end"} dominantBaseline="central" fontSize={10} fill="hsl(0,0%,45%)">
                  {name}
                </text>
              );
            }}
          >
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendLineChart({ data, label }: { data: { year: string; value: number }[]; label: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" name={label} stroke="hsl(350,85%,42%)" strokeWidth={2} dot={{ fill: "hsl(350,85%,42%)", r: 3, stroke: "hsl(350,85%,42%)" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function TrendBarChart({ data, label }: { data: { year: string; value: number }[]; label: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="value" name={label} fill="hsl(350,85%,42%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function DistPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" nameKey="name" label={({ name }) => name}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default EffectDashboard;
