import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssessmentStep1, type AssessmentPolicy } from "@/components/policy-assessment/AssessmentStep1";
import { AssessmentStep2, type Clause } from "@/components/policy-assessment/AssessmentStep2";
import { AssessmentStep3, type Step3Result } from "@/components/policy-assessment/AssessmentStep3";
import { AssessmentStep4, type Step4Result } from "@/components/policy-assessment/AssessmentStep4";
import { AssessmentStep5, type Step5Result } from "@/components/policy-assessment/AssessmentStep5";
import { AssessmentStep6, type Step6Result } from "@/components/policy-assessment/AssessmentStep6";
import { AssessmentStep7 } from "@/components/policy-assessment/AssessmentStep7";

const FLOW_STEPS = [
  { id: 1, label: "选择政策" },
  { id: 2, label: "条款拆解" },
  { id: 3, label: "一致性评估" },
  { id: 4, label: "落地性评估" },
  { id: 5, label: "合规性评估" },
  { id: 6, label: "其他意见" },
  { id: 7, label: "生成报告" },
];

interface Props {
  onBack: () => void;
}

export function PolicyAssessmentFlow({ onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);

  // 各步驟資料
  const [selectedPolicy, setSelectedPolicy] = useState<AssessmentPolicy | null>(null);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [step3Result, setStep3Result] = useState<Step3Result | null>(null);
  const [step4Result, setStep4Result] = useState<Step4Result | null>(null);
  const [step5Result, setStep5Result] = useState<Step5Result | null>(null);
  const [step6Result, setStep6Result] = useState<Step6Result | null>(null);

  const goNext = () => {
    const next = currentStep + 1;
    setCurrentStep(next);
    setMaxReachedStep(prev => Math.max(prev, next));
  };

  const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const canGoNext = (): boolean => {
    if (currentStep === 1) return !!selectedPolicy;
    return true;
  };

  const nextLabel: Record<number, string> = {
    1: "下一步：条款拆解",
    2: "下一步：一致性评估",
    3: "下一步：落地性评估",
    4: "下一步：合规性评估",
    5: "下一步：其他意见",
    6: "下一步：生成报告",
    7: "",
  };

  return (
    <div className="flex flex-col h-full">
      {/* 頂部導航 */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-foreground">政策前评估</h2>
        </div>
      </div>

      {/* 步驟條 */}
      <div className="flex items-center justify-center gap-0 mb-6 shrink-0 overflow-x-auto pb-1">
        {FLOW_STEPS.map((step, i) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isReachable = step.id <= maxReachedStep;
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => isReachable && setCurrentStep(step.id)}
                  disabled={!isReachable}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 transition-all ${
                    isCompleted
                      ? "bg-primary text-primary-foreground cursor-pointer"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : isReachable
                          ? "bg-muted text-muted-foreground border border-border cursor-pointer hover:border-primary/40"
                          : "bg-muted text-muted-foreground/40 border border-border/40 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : step.id}
                </button>
                <span className={`text-[11px] font-medium whitespace-nowrap transition-colors hidden sm:block ${
                  isCurrent ? "text-primary" : isReachable ? "text-muted-foreground" : "text-muted-foreground/40"
                }`}>
                  {step.label}
                </span>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className={`w-6 h-[2px] mx-1.5 sm:w-8 transition-colors ${currentStep > step.id ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* 主內容區 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-xl border border-border p-6 space-y-6"
            >
              {currentStep === 1 && (
                <AssessmentStep1
                  selected={selectedPolicy}
                  onSelect={setSelectedPolicy}
                />
              )}
              {currentStep === 2 && selectedPolicy && (
                <AssessmentStep2
                  policy={selectedPolicy}
                  clauses={clauses}
                  onClausesExtracted={setClauses}
                />
              )}
              {currentStep === 3 && (
                <AssessmentStep3
                  clauses={clauses}
                  result={step3Result}
                  onComplete={setStep3Result}
                />
              )}
              {currentStep === 4 && (
                <AssessmentStep4
                  clauses={clauses}
                  result={step4Result}
                  onComplete={setStep4Result}
                />
              )}
              {currentStep === 5 && (
                <AssessmentStep5
                  clauses={clauses}
                  result={step5Result}
                  onComplete={setStep5Result}
                />
              )}
              {currentStep === 6 && (
                <AssessmentStep6
                  result={step6Result}
                  onComplete={setStep6Result}
                />
              )}
              {currentStep === 7 && selectedPolicy && (
                <AssessmentStep7
                  policy={selectedPolicy}
                  clauses={clauses}
                  step3={step3Result}
                  step4={step4Result}
                  step5={step5Result}
                  step6={step6Result}
                />
              )}

              {/* 底部按鈕 */}
              {currentStep < 7 && (
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={goBack} className="h-10 px-5 text-sm">
                      <ArrowLeft className="h-4 w-4 mr-1.5" />返回上一步
                    </Button>
                  )}
                  <Button
                    onClick={goNext}
                    disabled={!canGoNext()}
                    className="flex-1 h-10 gov-gradient text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    {nextLabel[currentStep]}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
