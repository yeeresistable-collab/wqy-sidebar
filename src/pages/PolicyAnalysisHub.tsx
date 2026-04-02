import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AnalysisTask = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

const mockTasks: AnalysisTask[] = [
  {
    id: "task-1",
    title: "生物制造条款分析",
    createdAt: "2026-01-09 11:13:51",
    updatedAt: "2026-03-06 17:17:54",
  },
  {
    id: "task-2",
    title: "具身比对分析",
    createdAt: "2026-02-11 10:42:13",
    updatedAt: "2026-02-11 10:42:25",
  },
  {
    id: "task-3",
    title: "章节任务测试",
    createdAt: "2026-02-12 09:56:32",
    updatedAt: "2026-02-12 09:56:32",
  },
  {
    id: "task-4",
    title: "123",
    createdAt: "2026-03-09 18:27:01",
    updatedAt: "2026-03-09 18:28:02",
  },
  {
    id: "task-5",
    title: "测试",
    createdAt: "2026-03-30 23:20:19",
    updatedAt: "2026-03-30 23:20:19",
  },
];

export default function PolicyAnalysisHub() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const filteredTasks = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return mockTasks;
    return mockTasks.filter((task) => task.title.toLowerCase().includes(normalized));
  }, [keyword]);

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-[1800px] space-y-8 p-6 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => navigate("/policy-writing")}
            className="inline-flex items-center gap-1 transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            返回政策制定
          </button>
          <span>/</span>
          <span className="text-foreground">政策对比分析</span>
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative w-full max-w-[650px]">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="请输入对比分析任务名称进行搜索"
                className="h-14 rounded-2xl border-[#d8dbe2] bg-white pl-6 pr-14 text-lg shadow-none placeholder:text-[#c1c4cd] focus-visible:ring-primary"
              />
              <Search className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="h-14 rounded-2xl border-[#d8dbe2] px-8 text-[18px] text-foreground"
                onClick={() => setKeyword("")}
              >
                重置
              </Button>
              <Button className="h-14 rounded-2xl bg-primary px-8 text-[18px] font-semibold hover:bg-primary/90">
                查询
              </Button>
            </div>
          </div>

          <Button
            className="h-14 rounded-2xl bg-primary px-8 text-[18px] font-semibold hover:bg-primary/90"
            onClick={() => navigate("/policy-analysis")}
          >
            <Plus className="h-5 w-5" />
            新建对比分析任务
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="rounded-[22px] border border-[#e4e6eb] bg-white p-8 shadow-none transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
                  onClick={() => navigate("/policy-analysis")}
                >
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ffd7de] text-[#f06277]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[18px] font-semibold text-foreground md:text-[20px]">
                      {task.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#8b909d]">
                  <button
                    type="button"
                    className="transition-colors hover:text-primary"
                    aria-label={`编辑 ${task.title}`}
                  >
                    <Pencil className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    className="transition-colors hover:text-destructive"
                    aria-label={`删除 ${task.title}`}
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="mt-10 space-y-2 text-[16px] leading-8 text-[#7d828f] md:text-[18px]">
                <p>创建时间: {task.createdAt}</p>
                <p>修改时间: {task.updatedAt}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-8 lg:flex-row lg:items-center lg:justify-end">
          <div className="text-[18px] font-medium text-foreground">共 {filteredTasks.length} 条</div>

          <div className="flex items-center gap-2 text-[#c4c8d2]">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent transition-colors hover:border-[#d8dbe2] hover:bg-accent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary text-[20px] font-semibold text-primary"
            >
              1
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent transition-colors hover:border-[#d8dbe2] hover:bg-accent"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            className={cn(
              "inline-flex h-12 items-center gap-3 rounded-xl border border-[#d8dbe2] px-5 text-[18px] text-foreground",
            )}
          >
            10 条/页
            <ChevronDown className="h-4 w-4 text-[#9ca3af]" />
          </button>
        </div>
      </div>
    </div>
  );
}
