import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Trash2, Plus, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { evaluationDetail } from "@/data/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  "推荐": { icon: CheckCircle2, color: "text-gov-green" },
  "待定": { icon: MinusCircle, color: "text-gov-gold" },
  "不推荐": { icon: XCircle, color: "text-destructive" },
};

const DONUT_COLORS = ["hsl(145,60%,42%)", "hsl(38,90%,55%)", "hsl(0,84%,60%)"];

const EnterpriseEvaluationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = evaluationDetail;

  const statusCounts = [
    { name: "推荐", value: data.enterprises.filter((e) => e.status === "推荐").length },
    { name: "待定", value: data.enterprises.filter((e) => e.status === "待定").length },
    { name: "不推荐", value: data.enterprises.filter((e) => e.status === "不推荐").length },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/enterprise-evaluation")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{data.name}</h1>
          <p className="text-sm text-muted-foreground">{data.department} · 共 {data.enterprises.length} 家企业申报</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Conditions & Criteria */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">申报条件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.conditions.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
                  {c}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">评优条件</CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs">
                  <Plus className="w-3 h-3" /> 添加
                </Button>
                <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs text-destructive">
                  <Trash2 className="w-3 h-3" /> 清空
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.scoringCriteria.map((c) => (
                <div key={c.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{c.label}</span>
                    <span className="text-primary font-semibold">{c.weight}%</span>
                  </div>
                  <Progress value={c.weight} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
              ))}
              <Button className="w-full gap-1.5 mt-2">
                <Brain className="w-4 h-4" /> 智能解析评分
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Donut Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">评优结果概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {statusCounts.map((_, i) => (
                        <Cell key={i} fill={DONUT_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {statusCounts.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DONUT_COLORS[i] }} />
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="font-semibold text-foreground">{s.value} 家</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">已申报企业评分排名</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>排名</TableHead>
                    <TableHead>企业名称</TableHead>
                    <TableHead className="text-center">综合评分</TableHead>
                    <TableHead className="text-center">研发投入占比</TableHead>
                    <TableHead className="text-center">专利数</TableHead>
                    <TableHead className="text-center">营收增长率</TableHead>
                    <TableHead className="text-center">评定</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.enterprises.map((e, i) => {
                    const cfg = statusConfig[e.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <TableRow key={e.id}>
                        <TableCell>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {i + 1}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell className="text-center font-bold text-primary">{e.score}</TableCell>
                        <TableCell className="text-center">{e.rdRatio}%</TableCell>
                        <TableCell className="text-center">{e.patents}</TableCell>
                        <TableCell className="text-center">{e.revenueGrowth}%</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`gap-1 ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" /> {e.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseEvaluationDetail;
