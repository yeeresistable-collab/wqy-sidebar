import { useNavigate } from "react-router-dom";
import { Search, Plus, FileText, BarChart, PieChart, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { policyReports } from "@/data/mockData";

const chartIcons = { bar: BarChart, pie: PieChart, line: TrendingUp };

const PolicyReport = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">兑现专报生成</h1>
          <p className="text-sm text-muted-foreground mt-1">基于AI分析的政策兑现多维度分析报告</p>
        </div>
        <Button className="gap-1.5" onClick={() => navigate("/policy-report/create")}>
          <Plus className="w-4 h-4" /> 新建专报
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="搜索专报..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policyReports.map((report) => {
          const ChartIcon = chartIcons[report.chartType];
          return (
            <Card
              key={report.id}
              className="gov-card-hover cursor-pointer group"
              onClick={() => navigate(`/policy-report/${report.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant={report.status === "已完成" ? "default" : "secondary"}>
                    {report.status}
                  </Badge>
                </div>
                <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                  {report.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {report.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <ChartIcon className="w-3 h-3" /> 图表报告
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PolicyReport;
