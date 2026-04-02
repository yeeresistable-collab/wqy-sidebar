import { Database, Layers3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/PageHero";

export default function ReserveLibrary() {
  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHero title="储备库" description="集中沉淀条款模板、主题方案、政策储备和可复用素材，支撑后续快速调用。"/>

        <Card className="p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Database className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">储备资源</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                这里可用于承载政策主题储备、标准条款模板、历史优秀案例和常用资料，为起草与评估提供基础资源。
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["政策主题储备", "标准条款模板库", "历史优秀案例库"].map((name) => (
              <div key={name} className="rounded-2xl border border-border bg-accent/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Layers3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">可继续扩展内容</p>
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
