import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AssessmentStep1, type AssessmentPolicy } from "@/components/policy-assessment/AssessmentStep1";
import PolicyAssessmentAuto from "@/components/policy-assessment/PolicyAssessmentAuto";

interface Props {
  onBack: () => void;
}

export function PolicyAssessmentFlow({ onBack }: Props) {
  const [selectedPolicy, setSelectedPolicy] = useState<AssessmentPolicy | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部标题栏 */}
      <div className="flex items-center gap-2 mb-5 shrink-0">
        <button
          onClick={selectedPolicy ? () => setSelectedPolicy(null) : onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-foreground">政策前评估</h2>
      </div>

      {/* 主内容白卡片 */}
      <div className="flex-1 min-h-0 overflow-hidden bg-card rounded-xl border border-border">
        {!selectedPolicy ? (
          /* 政策选择区 */
          <div className="h-full overflow-y-auto">
            <div className="max-w-2xl mx-auto px-8 py-8">
              <AssessmentStep1 selected={selectedPolicy} onSelect={setSelectedPolicy} />
            </div>
          </div>
        ) : (
          /* 自动评估区：左右分割布局完全在卡片内 */
          <div className="h-full flex overflow-hidden">
            <PolicyAssessmentAuto policy={selectedPolicy} onBack={() => setSelectedPolicy(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
