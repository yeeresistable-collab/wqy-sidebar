import { motion } from "framer-motion";
import type { PlanTask } from "./TaskPlanningStep";

interface MindMapStepProps {
  tasks: PlanTask[];
  policyTitle: string;
  compact?: boolean;
}

interface BranchNode {
  label: string;
  children: string[];
  color: string;
}

const branchData: Record<string, BranchNode> = {
  t1: {
    label: "优化标题",
    children: ["标题规范化", "关键词提取", "格式校验"],
    color: "hsl(var(--primary))",
  },
  t2: {
    label: "核心要素生成",
    children: ["适用范围", "扶持标准", "申报条件", "资金来源", "监督管理"],
    color: "hsl(346 70% 55%)",
  },
  t3: {
    label: "上位政策检索",
    children: ["国家法规", "省级政策", "部委文件"],
    color: "hsl(20 80% 55%)",
  },
  t4: {
    label: "各省市政策库检索",
    children: ["北京", "上海", "深圳", "杭州"],
    color: "hsl(340 65% 50%)",
  },
  t5: {
    label: "条款比对分析",
    children: ["差异标记", "可借鉴条款", "冲突检测"],
    color: "hsl(15 75% 50%)",
  },
  t6: {
    label: "根据文档输出条款",
    children: ["条款生成", "逻辑校验", "格式排版"],
    color: "hsl(355 65% 50%)",
  },
};

export function MindMapStep({ tasks, policyTitle, compact = false }: MindMapStepProps) {
  const svgW = compact ? 560 : 820;
  const svgH = compact ? 220 : 420;
  const centerX = svgW / 2;
  const centerY = svgH / 2;

  // Split tasks into left (top 3) and right (bottom 3) for a horizontal mind map layout
  const leftTasks = tasks.slice(0, 3);
  const rightTasks = tasks.slice(3, 6);

  const branchSpacingY = compact ? 60 : 110;
  const branchOffsetX = compact ? 150 : 240;
  const leafOffsetX = compact ? 90 : 140;
  const leafSpacingY = compact ? 18 : 24;

  const fontSize = compact ? 9 : 12;
  const leafFontSize = compact ? 8 : 10;
  const nodeRx = compact ? 4 : 6;
  const centerRx = compact ? 8 : 10;

  const renderBranch = (task: PlanTask, index: number, side: "left" | "right") => {
    const branch = branchData[task.id] || { label: task.title, children: [], color: "hsl(var(--primary))" };
    const dirX = side === "left" ? -1 : 1;
    const yOffset = (index - 1) * branchSpacingY;
    const bx = centerX + dirX * branchOffsetX;
    const by = centerY + yOffset;

    const children = branch.children;
    const childrenStartY = by - ((children.length - 1) * leafSpacingY) / 2;

    return (
      <g key={task.id}>
        {/* Line from center to branch */}
        <motion.path
          d={`M ${centerX} ${centerY} C ${centerX + dirX * 60} ${centerY}, ${bx - dirX * 60} ${by}, ${bx} ${by}`}
          stroke={branch.color}
          strokeWidth={compact ? 1.5 : 2}
          fill="none"
          strokeOpacity={0.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
        />

        {/* Branch node */}
        <motion.g
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
        >
          <rect
            x={bx - (compact ? 38 : 62)}
            y={by - (compact ? 12 : 16)}
            width={compact ? 76 : 124}
            height={compact ? 24 : 32}
            rx={nodeRx}
            fill={branch.color}
            fillOpacity={0.12}
            stroke={branch.color}
            strokeWidth={1}
          />
          <text
            x={bx}
            y={by + (compact ? 1 : 2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fontWeight={600}
            fill={branch.color}
          >
            {branch.label}
          </text>
        </motion.g>

        {/* Leaf nodes */}
        {children.map((child, ci) => {
          const ly = childrenStartY + ci * leafSpacingY;
          const lx = bx + dirX * leafOffsetX;
          return (
            <motion.g
              key={ci}
              initial={{ opacity: 0, x: dirX * -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 + ci * 0.05, duration: 0.25 }}
            >
              {/* Line from branch to leaf */}
              <line
                x1={bx + dirX * (compact ? 38 : 62)}
                y1={by}
                x2={lx - dirX * (compact ? 28 : 40)}
                y2={ly}
                stroke={branch.color}
                strokeWidth={1}
                strokeOpacity={0.3}
              />
              <rect
                x={lx - (compact ? 28 : 40)}
                y={ly - (compact ? 9 : 12)}
                width={compact ? 56 : 80}
                height={compact ? 18 : 24}
                rx={nodeRx - 1}
                fill={branch.color}
                fillOpacity={0.06}
                stroke={branch.color}
                strokeWidth={0.5}
                strokeOpacity={0.4}
              />
              <text
                x={lx}
                y={ly + (compact ? 1 : 1)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={leafFontSize}
                fill="currentColor"
                opacity={0.7}
              >
                {child}
              </text>
            </motion.g>
          );
        })}
      </g>
    );
  };

  return (
    <div className={compact ? "" : "space-y-4"}>
      {!compact && (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground mb-1">思维导图</h3>
          <p className="text-xs text-muted-foreground">任务全局视图，展示各步骤之间的关系</p>
        </div>
      )}
      <div className="flex items-center justify-center overflow-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="text-foreground"
          style={{ maxWidth: svgW, minHeight: compact ? 200 : 380 }}
        >
          {/* Center node */}
          <motion.g
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <rect
              x={centerX - (compact ? 50 : 72)}
              y={centerY - (compact ? 16 : 22)}
              width={compact ? 100 : 144}
              height={compact ? 32 : 44}
              rx={centerRx}
              fill="hsl(var(--primary))"
            />
            <text
              x={centerX}
              y={centerY + (compact ? 1 : 2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={compact ? 10 : 14}
              fontWeight={700}
              fill="white"
            >
              {(policyTitle || "政策起草").length > 8
                ? (policyTitle || "政策起草").slice(0, 8) + "..."
                : (policyTitle || "政策起草")}
            </text>
          </motion.g>

          {/* Left branches */}
          {leftTasks.map((t, i) => renderBranch(t, i, "left"))}

          {/* Right branches */}
          {rightTasks.map((t, i) => renderBranch(t, i, "right"))}
        </svg>
      </div>
    </div>
  );
}
