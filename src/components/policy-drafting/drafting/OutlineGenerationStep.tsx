import { useState, useEffect, useRef, DragEvent, CSSProperties } from "react";
import { motion } from "framer-motion";
import {
  Loader2, FileText, ChevronDown, ChevronRight,
  Pencil, Check, X, Plus, GripVertical,
} from "lucide-react";
import { generateOutline } from "@/lib/policyDraftApi";
import type { PolicyItem } from "./PolicySearchStep";
import type { ClauseComparison } from "./PolicyAnalysisStep";

/** 二級節：第X條 */
export interface OutlineSubSection {
  id: string;
  title: string;
  keyPoints: string[];
  referencePolicies: { title: string; clause: string }[];
}

/** 一級章：第X章 */
export interface OutlineSection {
  id: string;
  title: string;
  subSections: OutlineSubSection[];
}

interface OutlineGenerationStepProps {
  policyTitle: string;
  coreElements: string;
  selectedPolicies: PolicyItem[];
  analysisResult?: ClauseComparison[];
  onOutlineComplete?: (outline: OutlineSection[]) => void;
  /** 外部傳入的拖拽文件標題（由父層統一管理） */
  draggingTitle?: string | null;
  /** 通知父層開始拖拽 */
  onDragStart?: (title: string) => void;
  /** 通知父層結束拖拽 */
  onDragEnd?: () => void;
}

// ─── 行內文字編輯器 ──────────────────────────────────────
function InlineEditor({
  value,
  onSave,
  textClass = "",
  inputClass = "",
}: {
  value: string;
  onSave: (v: string) => void;
  textClass?: string;
  inputClass?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => { onSave(draft.trim() || value); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (!editing) {
    return (
      <span
        className={`group/ie flex items-center gap-1 cursor-pointer min-w-0 ${textClass}`}
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        <span className="truncate">{value}</span>
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/ie:opacity-100 shrink-0 transition-opacity" />
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 flex-1 min-w-0">
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
        className={`flex-1 min-w-0 bg-primary/5 border border-primary/30 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary/40 text-xs ${inputClass}`}
      />
      <button onClick={commit} className="text-primary hover:text-primary/70 shrink-0"><Check className="h-3.5 w-3.5" /></button>
      <button onClick={cancel} className="text-muted-foreground hover:text-foreground shrink-0"><X className="h-3.5 w-3.5" /></button>
    </span>
  );
}

// ─── 右側參考文件面板（export 供父層使用）──────────────────
// 用佔位 div 保持佈局空間，面板本體用 fixed 定位跟隨滾動
export function ReferenceDocPanel({
  policies,
  draggingTitle,
  onDragStart,
  onDragEnd,
}: {
  policies: PolicyItem[];
  draggingTitle: string | null;
  onDragStart: (title: string) => void;
  onDragEnd: () => void;
}) {
  const selected = policies.filter((p) => p.selected);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  useEffect(() => {
    /** 根據佔位 div 的位置動態計算 fixed 面板的位置 */
    const updatePosition = () => {
      if (!placeholderRef.current) return;
      const rect = placeholderRef.current.getBoundingClientRect();
      // header 高度 56px（h-14）+ 24px padding，確保面板不超過 header 下方
      const MIN_TOP = 56 + 24;
      const top = Math.max(MIN_TOP, rect.top);
      setPanelStyle({
        position: "fixed",
        top,
        left: rect.left,
        width: rect.width,
        maxHeight: `calc(100vh - ${top}px - 16px)`,
        zIndex: 10,
      });
    };

    updatePosition();

    // 監聽 main 滾動容器
    const scrollEl = document.querySelector("main");
    scrollEl?.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });

    return () => {
      scrollEl?.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  const panelContent = (
    <>
      <div className="px-4 py-3 border-b border-border bg-muted/20 shrink-0">
        <p className="text-sm font-semibold text-foreground">参考文档库</p>
        <p className="text-xs text-muted-foreground mt-0.5">拖拽文档到左侧章节</p>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-1">
        {selected.map((p) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e: DragEvent) => { e.dataTransfer.effectAllowed = "copy"; onDragStart(p.title); }}
            onDragEnd={onDragEnd}
            className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border text-xs cursor-grab active:cursor-grabbing select-none transition-colors
              ${draggingTitle === p.title
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/40 text-foreground"
              }`}
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <FileText className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span className="leading-snug line-clamp-2">{p.title}</span>
          </div>
        ))}
        {selected.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">暂无已选政策</p>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* 佔位 div：保持右側空間，不可見 */}
      <div ref={placeholderRef} className="w-60 shrink-0" style={{ minHeight: 200 }} />

      {/* fixed 定位的真實面板 */}
      {panelStyle.left !== undefined && (
        <div
          className="flex flex-col border border-border rounded-xl bg-card overflow-hidden shadow-sm"
          style={panelStyle}
        >
          {panelContent}
        </div>
      )}
    </>
  );
}

// ─── 二級節組件 ──────────────────────────────────────────
function SubSectionBlock({
  sub,
  dropTargetId,
  onDragOver,
  onDragLeave,
  onDrop,
  onUpdateTitle,
  onUpdateKeyPoint,
  onAddKeyPoint,
  onRemoveKeyPoint,
  onRemoveRef,
}: {
  sub: OutlineSubSection;
  dropTargetId: string | null;
  onDragOver: (id: string) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent, id: string) => void;
  onUpdateTitle: (v: string) => void;
  onUpdateKeyPoint: (pi: number, v: string) => void;
  onAddKeyPoint: () => void;
  onRemoveKeyPoint: (pi: number) => void;
  onRemoveRef: (ri: number) => void;
}) {
  const isDropTarget = dropTargetId === sub.id;

  return (
    <div
      onDragOver={(e: DragEvent) => { e.preventDefault(); onDragOver(sub.id); }}
      onDragLeave={onDragLeave}
      onDrop={(e: DragEvent) => onDrop(e, sub.id)}
      className={`rounded-lg border px-4 py-3 space-y-3 transition-colors ${
        isDropTarget ? "border-primary bg-primary/5" : "border-border/60 bg-background"
      }`}
    >
      {/* 二級標題 */}
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-xs font-semibold text-muted-foreground shrink-0 mr-1">▸</span>
        <InlineEditor
          value={sub.title}
          onSave={onUpdateTitle}
          textClass="text-xs font-semibold text-foreground"
        />
      </div>

      {/* 核心要點 */}
      <div>
        <p className="text-[11px] font-medium text-muted-foreground mb-1.5">核心要点</p>
        <ul className="space-y-1">
          {sub.keyPoints.map((pt, pi) => (
            <li key={pi} className="flex items-center gap-2 group/pt">
              <span className="text-primary text-xs shrink-0">•</span>
              <InlineEditor
                value={pt}
                onSave={(v) => onUpdateKeyPoint(pi, v)}
                textClass="text-xs text-foreground flex-1"
              />
              <button
                onClick={() => onRemoveKeyPoint(pi)}
                className="opacity-0 group-hover/pt:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={onAddKeyPoint}
          className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
        >
          <Plus className="h-3 w-3" />添加要点
        </button>
      </div>

      {/* 參考政策 */}
      <div>
        <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
          参考政策
          {isDropTarget && <span className="ml-2 text-primary animate-pulse">松开鼠标以添加</span>}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {sub.referencePolicies.map((ref, ri) => (
            <span
              key={ri}
              className="group/ref flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/15 text-[11px] text-primary max-w-[200px]"
            >
              <FileText className="h-3 w-3 shrink-0" />
              <span className="truncate" title={ref.title}>{ref.title}</span>
              <button
                onClick={() => onRemoveRef(ri)}
                className="opacity-0 group-hover/ref:opacity-100 transition-opacity shrink-0 text-primary/50 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {sub.referencePolicies.length === 0 && (
            <span className="text-[11px] text-muted-foreground italic">
              {isDropTarget ? "放开以添加" : "可从右侧拖入参考政策"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 主組件 ──────────────────────────────────────────────
export function OutlineGenerationStep({
  policyTitle,
  coreElements,
  selectedPolicies,
  analysisResult,
  onOutlineComplete,
  draggingTitle: externalDraggingTitle,
  onDragStart,
  onDragEnd,
}: OutlineGenerationStepProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [outline, setOutline] = useState<OutlineSection[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const draggingTitle = externalDraggingTitle ?? null;
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  useEffect(() => {
    setIsGenerating(true);
    setError(null);
    generateOutline({ policyTitle, coreElements, selectedPolicies, analysisResult })
      .then(({ outline: result }) => {
        setOutline(result);
        const exp: Record<string, boolean> = {};
        result.forEach((s) => { exp[s.id] = true; });
        setExpandedChapters(exp);
        onOutlineComplete?.(result);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsGenerating(false));
  }, []);

  const update = (next: OutlineSection[]) => {
    setOutline(next);
    onOutlineComplete?.(next);
  };

  const toggleChapter = (id: string) =>
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── 章級編輯 ──
  const updateChapterTitle = (sId: string, v: string) =>
    update(outline.map((s) => s.id === sId ? { ...s, title: v } : s));

  const addSubSection = (sId: string) => {
    const section = outline.find((s) => s.id === sId)!;
    const newSub: OutlineSubSection = {
      id: `${sId}-${Date.now()}`,
      title: "新节标题",
      keyPoints: ["新要点"],
      referencePolicies: [],
    };
    update(outline.map((s) => s.id === sId ? { ...s, subSections: [...s.subSections, newSub] } : s));
  };

  // ── 節級編輯 ──
  const patchSub = (sId: string, subId: string, patch: Partial<OutlineSubSection>) =>
    update(outline.map((s) =>
      s.id === sId
        ? { ...s, subSections: s.subSections.map((sub) => sub.id === subId ? { ...sub, ...patch } : sub) }
        : s
    ));

  const updateSubTitle = (sId: string, subId: string, v: string) =>
    patchSub(sId, subId, { title: v });

  const updateKeyPoint = (sId: string, subId: string, pi: number, v: string) => {
    const sub = outline.find((s) => s.id === sId)!.subSections.find((sub) => sub.id === subId)!;
    patchSub(sId, subId, { keyPoints: sub.keyPoints.map((k, i) => i === pi ? v : k) });
  };

  const addKeyPoint = (sId: string, subId: string) => {
    const sub = outline.find((s) => s.id === sId)!.subSections.find((sub) => sub.id === subId)!;
    patchSub(sId, subId, { keyPoints: [...sub.keyPoints, "新要点"] });
  };

  const removeKeyPoint = (sId: string, subId: string, pi: number) => {
    const sub = outline.find((s) => s.id === sId)!.subSections.find((sub) => sub.id === subId)!;
    patchSub(sId, subId, { keyPoints: sub.keyPoints.filter((_, i) => i !== pi) });
  };

  const removeRef = (sId: string, subId: string, ri: number) => {
    const sub = outline.find((s) => s.id === sId)!.subSections.find((sub) => sub.id === subId)!;
    patchSub(sId, subId, { referencePolicies: sub.referencePolicies.filter((_, i) => i !== ri) });
  };

  // ── 拖拽放入 ──
  const handleDrop = (e: DragEvent, sId: string, subId: string) => {
    e.preventDefault();
    setDropTargetId(null);
    if (!draggingTitle) return;
    const sub = outline.find((s) => s.id === sId)!.subSections.find((sub) => sub.id === subId)!;
    if (sub.referencePolicies.some((r) => r.title === draggingTitle)) return;
    patchSub(sId, subId, {
      referencePolicies: [...sub.referencePolicies, { title: draggingTitle, clause: "参见该政策相关条款。" }],
    });
    onDragEnd?.();
  };

  // ── 渲染 ──

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">正在根据检索与分析结果生成政策大纲...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
        <p className="text-sm">大纲生成失败：{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">大纲生成</h3>
        <p className="text-xs text-muted-foreground">
          点击章节标题或要点可直接编辑；将右侧文档拖入二级节可添加参考政策
        </p>
      </div>

      {/* 大綱列表（無右側面板，面板由父層渲染） */}
      <div className="space-y-3">
        {outline.map((section, si) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.06 }}
            className="border border-border rounded-xl overflow-hidden"
          >
            {/* 一級章標題欄 */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  onClick={() => toggleChapter(section.id)}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  {expandedChapters[section.id]
                    ? <ChevronDown className="h-4 w-4" />
                    : <ChevronRight className="h-4 w-4" />}
                </button>
                <InlineEditor
                  value={section.title}
                  onSave={(v) => updateChapterTitle(section.id, v)}
                  textClass="text-sm font-bold text-foreground"
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                {section.subSections.length} 节
              </span>
            </div>

            {/* 二級節列表 */}
            {expandedChapters[section.id] && (
              <div className="p-3 space-y-2">
                {section.subSections.map((sub) => (
                  <SubSectionBlock
                    key={sub.id}
                    sub={sub}
                    dropTargetId={dropTargetId}
                    onDragOver={setDropTargetId}
                    onDragLeave={() => setDropTargetId(null)}
                    onDrop={(e, subId) => handleDrop(e, section.id, subId)}
                    onUpdateTitle={(v) => updateSubTitle(section.id, sub.id, v)}
                    onUpdateKeyPoint={(pi, v) => updateKeyPoint(section.id, sub.id, pi, v)}
                    onAddKeyPoint={() => addKeyPoint(section.id, sub.id)}
                    onRemoveKeyPoint={(pi) => removeKeyPoint(section.id, sub.id, pi)}
                    onRemoveRef={(ri) => removeRef(section.id, sub.id, ri)}
                  />
                ))}

                {/* 新增節 */}
                <button
                  onClick={() => addSubSection(section.id)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-primary/5 border border-dashed border-border hover:border-primary/30"
                >
                  <Plus className="h-3.5 w-3.5" />
                  添加二级节
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
