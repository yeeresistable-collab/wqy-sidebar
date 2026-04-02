import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Zap, ListChecks, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PolicySearchStep, type PolicyItem } from "@/components/policy-drafting/drafting/PolicySearchStep";
import { PolicyAnalysisStep, type ClauseComparison } from "@/components/policy-drafting/drafting/PolicyAnalysisStep";
import { OutlineGenerationStep, ReferenceDocPanel, type OutlineSection } from "@/components/policy-drafting/drafting/OutlineGenerationStep";
import { PolicyOutputPage } from "@/components/policy-drafting/drafting/PolicyOutputPage";
import { QuickDraftProgress } from "@/components/policy-drafting/drafting/QuickDraftProgress";

const flowSteps = [
  { id: 1, label: "输入政策标题" },
  { id: 2, label: "政策检索" },
  { id: 3, label: "核心要素生成" },
  { id: 4, label: "大纲生成" },
  { id: 5, label: "政策编辑" },
];

interface PolicyDraftingFlowProps {
  onBack: () => void;
  initialTitle?: string;
  /** 从助手流式起草直接传入的完整政策内容，有值时跳过所有步骤直接进入编辑器 */
  directContent?: string;
}

export function PolicyDraftingFlow({
  onBack,
  initialTitle,
  directContent,
}: PolicyDraftingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  /** 已完成（訪問過）的最大步驟，用於控制步驟條可點擊範圍 */
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [title, setTitle] = useState(initialTitle || "");
  const [coreElements, setCoreElements] = useState("");
  const [coreItems, setCoreItems] = useState<{ id: string; text: string; refs: { id: string; title: string; url?: string; clause?: string }[] }[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<PolicyItem[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ClauseComparison[]>([]);
  const [outlineResult, setOutlineResult] = useState<OutlineSection[]>([]);
  const [draggingDocTitle, setDraggingDocTitle] = useState<string | null>(null);
  /** 大纲已保存状态（localStorage 持久化） */
  const [outlineSaved, setOutlineSaved] = useState(false);
  /** 起草是否已完成（进入步骤5即算完成） */
  const [draftCompleted, setDraftCompleted] = useState(false);
  /** 快速起草模式：显示进度页，完成后直接进入编辑器（打字机模式） */
  const [quickMode, setQuickMode] = useState(false);
  /** 快速起草完成后切到编辑器并开启打字机输出 */
  const [quickDraftReady, setQuickDraftReady] = useState(false);
  const [quickDraftResult, setQuickDraftResult] = useState<{
    policies: PolicyItem[];
    outline: OutlineSection[];
  }>({ policies: [], outline: [] });

  const goNext = () => {
    if (currentStep < 5) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setMaxReachedStep(prev => Math.max(prev, next));
    }
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  /** 點擊步驟條跳轉：只允許跳到已訪問過的前序步驟 */
  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep && stepId <= maxReachedStep) {
      setCurrentStep(stepId);
    }
  };

  /** 快速起草：后台各步骤完成后直接跳到编辑器（打字机模式） */
  const handleQuickDraftComplete = (result: { policies: PolicyItem[]; outline: OutlineSection[] }) => {
    setQuickDraftResult(result);
    setQuickDraftReady(true);
  };

  // 从助手直接传入内容：跳过所有步骤，直接进入编辑器
  if (directContent) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <PolicyOutputPage
          policyTitle={initialTitle || "政策文件"}
          coreElements={coreElements}
          selectedPolicies={[]}
          outline={[]}
          onBack={onBack}
          directContent={directContent}
        />
      </div>
    );
  }

  // 快速起草进度页
  if (quickMode && !quickDraftReady) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setQuickMode(false)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
        <QuickDraftProgress
          policyTitle={title}
          coreElements={coreElements}
          onComplete={handleQuickDraftComplete}
        />
      </div>
    );
  }

  // 快速起草完成 → 直接进入编辑器（打字机模式）
  if (quickDraftReady) {
    if (!draftCompleted) {
      setDraftCompleted(true);
      localStorage.setItem("policy-draft-completed", "1");
    }
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <PolicyOutputPage
          policyTitle={title}
          coreElements={coreElements}
          selectedPolicies={quickDraftResult.policies}
          outline={quickDraftResult.outline}
          onBack={() => { setQuickDraftReady(false); setQuickMode(false); }}
          typewriterMode
        />
      </div>
    );
  }

  // Step 5: Full-page editor（分步起草）
  if (currentStep === 5) {
    // 进入编辑器即标记起草已完成（写入 localStorage，助手读取此标记判断是否提示）
    if (!draftCompleted) {
      setDraftCompleted(true);
      localStorage.setItem("policy-draft-completed", "1");
    }
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <PolicyOutputPage
          policyTitle={title}
          coreElements={coreElements}
          selectedPolicies={selectedPolicies}
          outline={outlineResult}
          onBack={() => setCurrentStep(4)}
        />
      </div>
    );
  }

  /** 步驟條底部按鈕列：左側返回 + 右側下一步 */
  const renderBottomActions = (nextLabel: string, nextDisabled = false) => (
    <div className="flex items-center gap-3 pt-2">
      {currentStep > 1 && (
        <Button
          variant="outline"
          onClick={goBack}
          className="h-11 px-5 text-sm font-medium flex items-center gap-1.5 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          返回上一步
        </Button>
      )}
      <Button
        onClick={goNext}
        disabled={nextDisabled}
        className="flex-1 h-11 gov-gradient text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
      >
        {nextLabel}
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Back to home */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </button>

      {/* Flow stepper — 前序已訪問步驟可點擊 */}
      <div className="flex items-center justify-center gap-0 mb-2">
        {flowSteps.map((step, i) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = step.id < currentStep && step.id <= maxReachedStep;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  onClick={() => handleStepClick(step.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all
                    ${isCompleted ? "gov-gradient text-primary-foreground" : ""}
                    ${isCurrent ? "border-2 border-primary text-primary bg-primary/10" : ""}
                    ${!isCompleted && !isCurrent ? "bg-muted text-muted-foreground" : ""}
                    ${isClickable ? "cursor-pointer hover:opacity-80 ring-2 ring-primary/30 ring-offset-1" : "cursor-default"}
                  `}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
                </div>
                <span
                  onClick={() => handleStepClick(step.id)}
                  className={`text-xs font-medium whitespace-nowrap transition-colors
                    ${isCurrent ? "text-primary" : ""}
                    ${isCompleted ? "text-foreground" : ""}
                    ${!isCompleted && !isCurrent ? "text-muted-foreground" : ""}
                    ${isClickable ? "cursor-pointer hover:text-primary underline-offset-2 hover:underline" : "cursor-default"}
                  `}
                >
                  {step.label}
                </span>
              </div>
              {i < flowSteps.length - 1 && (
                <div
                  className={`w-12 h-[2px] mx-3 transition-colors ${
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content（Step 4 雙欄佈局需跳出 max-w 限制，單獨處理） */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className={currentStep === 4 ? "" : "max-w-4xl mx-auto"}
      >
        {/* Step 1: Input */}
        {currentStep === 1 && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">输入政策标题</h2>
              <p className="text-sm text-muted-foreground">请输入政策标题，AI 将自动检索参考政策并生成初稿</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy-title" className="text-sm font-medium">
                政策标题 <span className="text-primary">*</span>
              </Label>
              <Input
                id="policy-title"
                placeholder="请输入政策标题，例如：关于促进新一代信息技术产业发展的若干政策"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11"
              />
            </div>

            {/* 起草方式选择 */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* 快速起草 */}
              <button
                onClick={() => { if (title.trim()) setQuickMode(true); }}
                disabled={!title.trim()}
                className={`group relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all
                  ${title.trim()
                    ? "border-primary/30 hover:border-primary hover:bg-primary/[0.03] cursor-pointer"
                    : "border-border opacity-50 cursor-not-allowed"
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">快速起草</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AI 自动完成检索、分析、大纲生成全流程，完成后直接输出政策全文，适合快速生成初稿。
                </p>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-600">
                  <Zap className="h-3 w-3" />
                  一键直达
                </div>
              </button>

              {/* 分步起草 */}
              <button
                onClick={() => { if (title.trim()) goNext(); }}
                disabled={!title.trim()}
                className={`group relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all
                  ${title.trim()
                    ? "border-primary/30 hover:border-primary hover:bg-primary/[0.03] cursor-pointer"
                    : "border-border opacity-50 cursor-not-allowed"
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">分步起草</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  按步骤逐一完成政策检索、对比分析、大纲编辑，全程可干预调整，适合精细化定制。
                </p>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-600">
                  <ListChecks className="h-3 w-3" />
                  逐步精控
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Policy Search */}
        {currentStep === 2 && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <PolicySearchStep
              policyTitle={title}
              coreElements={coreElements}
              policies={selectedPolicies}
              onPoliciesSelected={setSelectedPolicies}
            />
            {renderBottomActions(
              `下一步：核心要素生成（已选 ${selectedPolicies.filter(p => p.selected).length} 条）`,
              selectedPolicies.filter(p => p.selected).length === 0
            )}
          </div>
        )}

        {/* Step 3: Core elements generation (formerly analysis) */}
        {currentStep === 3 && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <PolicyAnalysisStep
              selectedPolicies={selectedPolicies}
              onAnalysisComplete={setAnalysisResult}
              onCoreElementsChange={(v: string) => setCoreElements(v)}
              onCoreElementsItemsChange={(items) => setCoreItems(items)}
            />
            {renderBottomActions("下一步：生成大纲")}
          </div>
        )}

        {/* Step 4: Outline Generation — 雙欄：左側卡片 + 右側 sticky 面板 */}
        {currentStep === 4 && (
          <div className="flex gap-4 items-start">
            {/* 左側卡片（含大綱 + 底部按鈕） */}
            <div className="flex-1 min-w-0 bg-card rounded-xl border border-border p-6 space-y-6">
              <OutlineGenerationStep
                policyTitle={title}
                coreElements={coreElements}
                selectedPolicies={selectedPolicies}
                analysisResult={analysisResult}
                coreItems={coreItems}
                onOutlineComplete={setOutlineResult}
                draggingTitle={draggingDocTitle}
                onDragStart={setDraggingDocTitle}
                onDragEnd={() => setDraggingDocTitle(null)}
              />
              {/* 底部操作区：保存大纲 + 下一步 */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 pt-2">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={goBack}
                      className="h-11 px-5 text-sm font-medium flex items-center gap-1.5 shrink-0"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      返回上一步
                    </Button>
                  )}
                  {/* 保存大纲按钮 */}
                  <Button
                    variant="outline"
                    disabled={outlineResult.length === 0}
                    onClick={() => {
                      // 持久化保存
                      const saved = {
                        title,
                        outline: outlineResult,
                        savedAt: Date.now(),
                      };
                      localStorage.setItem("policy-draft-outline", JSON.stringify(saved));
                      setOutlineSaved(true);
                      // 通知助手：已保存大纲但未完成起草
                      window.dispatchEvent(new CustomEvent("assistant:outline-saved", {
                        detail: { title, draftCompleted: false },
                      }));
                    }}
                    className="h-11 px-5 text-sm font-medium flex items-center gap-1.5 shrink-0"
                  >
                    <BookmarkCheck className={`h-4 w-4 ${outlineSaved ? "text-primary" : ""}`} />
                    {outlineSaved ? "大纲已保存" : "保存大纲"}
                  </Button>
                  <Button
                    onClick={goNext}
                    className="flex-1 h-11 gov-gradient text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    下一步：生成政策全文
                  </Button>
                </div>
                {outlineSaved && (
                  <p className="text-xs text-muted-foreground pl-1">
                    大纲已保存，下次进入起草页时可从保存点继续。
                  </p>
                )}
              </div>
            </div>

            {/* 右側 sticky 參考文件面板 */}
            <ReferenceDocPanel
              policies={selectedPolicies}
              draggingTitle={draggingDocTitle}
              onDragStart={setDraggingDocTitle}
              onDragEnd={() => setDraggingDocTitle(null)}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
