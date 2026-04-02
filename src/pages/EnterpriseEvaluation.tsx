import { useNavigate } from "react-router-dom";
import { Award, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { evaluationItems } from "@/data/mockData";

const statusColors: Record<string, string> = {
  "评优中": "default",
  "待评优": "secondary",
  "已完成": "outline",
};

const EnterpriseEvaluation = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-gov-gold" /> 评优事项列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>事项名称</TableHead>
                <TableHead>主管部门</TableHead>
                <TableHead className="text-center">申报企业数</TableHead>
                <TableHead>截止时间</TableHead>
                <TableHead className="text-center">状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluationItems.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => navigate(`/enterprise-evaluation/${item.id}`)}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell className="text-center">{item.enterpriseCount}</TableCell>
                  <TableCell>{item.deadline}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusColors[item.status] as any}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="gap-1 text-primary border-primary/30">
                      <Star className="w-3 h-3" /> 智能评优
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnterpriseEvaluation;
