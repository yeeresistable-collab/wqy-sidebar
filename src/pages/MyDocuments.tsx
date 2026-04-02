import { FileText, FolderOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/PageHero";

export default function MyDocuments() {
  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHero title="我的文档" description="统一管理政策草稿、评估报告、专报和分析记录，便于检索与协同。"/>

        <Card className="p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <FolderOpen className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">文档列表</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                这里将集中展示您的政策起草文件、分析报告和历史输出结果，便于统一归档与复用。
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["产业金融扶持专项草稿", "营商环境优化行动方案", "中小企业融资支持报告"].map((name) => (
              <div key={name} className="rounded-2xl border border-border bg-accent/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">最近更新于今天</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
