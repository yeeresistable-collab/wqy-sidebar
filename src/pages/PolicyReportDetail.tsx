import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { reportDetail } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(350,85%,42%)", "hsl(210,70%,45%)", "hsl(38,90%,55%)", "hsl(145,60%,42%)", "hsl(25,90%,55%)", "hsl(270,50%,50%)"];

const PolicyReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = reportDetail;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/policy-report")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{data.title}</h1>
          <p className="text-sm text-muted-foreground">专报ID: {id}</p>
        </div>
      </div>

      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">整体情况评估</CardTitle>
            <Badge className="gap-1">
              <TrendingUp className="w-3 h-3" /> 兑现率 {data.dimensions.situation.score}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.overallAssessment}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{data.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Items Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">已兑现事项分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.dimensions.items}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(350,85%,42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funds Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">已兑现资金分布（亿元）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.dimensions.funds} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="amount" nameKey="category" label={({ category, percentage }) => `${category} ${percentage}%`}>
                  {data.dimensions.funds.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enterprise Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">已扶持企业分布</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>企业类型</TableHead>
                <TableHead className="text-right">企业数量</TableHead>
                <TableHead className="text-right">占比</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.dimensions.enterprises.map((e) => (
                <TableRow key={e.type}>
                  <TableCell className="font-medium">{e.type}</TableCell>
                  <TableCell className="text-right">{e.count}</TableCell>
                  <TableCell className="text-right">{e.percentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyReportDetail;
