import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, FileText, Clock, ChevronDown, ChevronRight, Brain } from "lucide-react";
import type { PlanTask } from "./TaskPlanningStep";

interface TaskTrackingStepProps {
  tasks: PlanTask[];
  trackingResults: Record<string, string>;
  thinkingState: Record<string, { lines: string[]; done: boolean }>;
}

export function TaskTrackingStep({ tasks, trackingResults, thinkingState }: TaskTrackingStepProps) {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground mb-1">实时跟踪</h3>
        <p className="text-xs text-muted-foreground">实时展示各任务的执行结果</p>
      </div>
      <div className="space-y-3">
        {tasks.map((task, i) => {
          const result = trackingResults[task.id];
          const thinking = thinkingState[task.id];
          const isThinking = thinking && !thinking.done;
          const hasThinked = thinking && thinking.done;
          // Auto-collapse when done, but user can toggle
          const isExpanded = expandedTasks[task.id] !== undefined
            ? expandedTasks[task.id]
            : isThinking; // auto-expand while thinking, collapse when done

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className={`rounded-lg border p-4 transition-colors ${
                task.status === "running"
                  ? "border-primary/30 bg-primary/5"
                  : task.status === "done"
                  ? "border-border bg-card"
                  : "border-border bg-card/50 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {task.status === "done" ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : task.status === "running" ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">{task.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === "done" && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      已完成
                    </span>
                  )}
                  {hasThinked && (
                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Thinking process */}
              <AnimatePresence>
                {thinking && (isExpanded || isThinking) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-muted/50 rounded-md p-3 text-xs leading-relaxed mb-2 border border-border/50">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                        <Brain className="h-3 w-3" />
                        <span>思考过程</span>
                      </div>
                      <div className="space-y-1.5">
                        {thinking.lines.map((line, li) => (
                          <motion.div
                            key={li}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-1.5 text-foreground/80"
                          >
                            <span className="text-primary/60 mt-0.5">›</span>
                            <span>{line}</span>
                          </motion.div>
                        ))}
                        {isThinking && (
                          <div className="flex items-center gap-1.5 text-primary/60">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>思考中...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              {result && (
                <div className="bg-muted/50 rounded-md p-3 text-xs text-foreground leading-relaxed">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <FileText className="h-3 w-3" />
                    <span>执行结果</span>
                  </div>
                  {result}
                </div>
              )}

              {task.status === "running" && !result && !thinking && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full gov-gradient rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "70%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                  <span>处理中...</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
