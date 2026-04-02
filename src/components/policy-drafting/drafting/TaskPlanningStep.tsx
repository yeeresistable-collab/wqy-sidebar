import { motion } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";

export interface PlanTask {
  id: string;
  title: string;
  description: string;
  status: "pending" | "running" | "done";
}

interface TaskPlanningStepProps {
  tasks: PlanTask[];
  policyTitle: string;
}

export function TaskPlanningStep({ tasks, policyTitle }: TaskPlanningStepProps) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground mb-1">任务规划</h3>
        <p className="text-xs text-muted-foreground">
          根据「{policyTitle}」自动生成执行计划
        </p>
      </div>
      <div className="space-y-0">
        {tasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="relative flex gap-3"
          >
            {/* Vertical connector line */}
            {i < tasks.length - 1 && (
              <div className="absolute left-[15px] top-[32px] w-[2px] h-[calc(100%-16px)] bg-border" />
            )}
            {/* Status icon */}
            <div className="relative z-10 mt-1 shrink-0">
              {task.status === "done" ? (
                <div className="w-8 h-8 rounded-full gov-gradient flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              ) : task.status === "running" ? (
                <div className="w-8 h-8 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
            {/* Content */}
            <div
              className={`flex-1 rounded-lg border px-4 py-3 mb-3 transition-colors ${
                task.status === "running"
                  ? "border-primary/30 bg-primary/5"
                  : task.status === "done"
                  ? "border-border bg-card"
                  : "border-border bg-card/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{task.title}</span>
                {task.status === "done" && (
                  <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                    已完成
                  </span>
                )}
                {task.status === "running" && (
                  <span className="text-xs text-primary font-medium">执行中...</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
