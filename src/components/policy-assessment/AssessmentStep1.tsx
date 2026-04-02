import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle, X, ChevronDown, ChevronRight, Search,
} from "lucide-react";

/** 已選政策文件 */
export interface AssessmentPolicy {
  id: string;
  title: string;
  source: "upload" | "library";
  content?: string;
}

const LIBRARY_POLICIES = [
  { id: "lp1", title: "关于促进新一代信息技术产业高质量发展的若干政策措施", dept: "发改委" },
  { id: "lp2", title: "关于支持人工智能产业创新发展的若干措施", dept: "科技局" },
  { id: "lp3", title: "北京经济技术开发区促进高精尖产业发展若干政策", dept: "经开区" },
  { id: "lp4", title: "关于加快推进绿色低碳产业发展的实施意见", dept: "生态局" },
  { id: "lp5", title: "关于进一步优化营商环境的若干措施", dept: "行政审批" },
  { id: "lp6", title: "关于招商引资优惠政策的通知", dept: "招商局" },
  { id: "lp7", title: "高层次人才引进与培育专项政策", dept: "人社局" },
  { id: "lp8", title: "中小微企业孵化扶持政策办法", dept: "工信局" },
];

interface Props {
  selected: AssessmentPolicy | null;
  onSelect: (policy: AssessmentPolicy) => void;
}

export function AssessmentStep1({ selected, onSelect }: Props) {
  const [tab, setTab] = useState<"upload" | "library">("upload");
  const [librarySearch, setLibrarySearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ all: true });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const filtered = LIBRARY_POLICIES.filter(p =>
    p.title.includes(librarySearch) || p.dept.includes(librarySearch)
  );

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    onSelect({ id: `upload-${Date.now()}`, title: file.name.replace(/\.[^.]+$/, ""), source: "upload" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">选择评估政策</h2>
        <p className="text-sm text-muted-foreground">上传政策文件或从政策起草库中选择待评估政策</p>
      </div>

      {/* 已選狀態 */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-primary/30 bg-primary/5"
          >
            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{selected.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selected.source === "upload" ? "本地上传" : "来自政策起草库"}
              </p>
            </div>
            <button
              onClick={() => onSelect(null!)}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {[
          { key: "upload", label: "本地上传" },
          { key: "library", label: "从起草库选择" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "upload" | "library")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 上傳區 */}
      {tab === "upload" && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-xl py-14 cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">点击或拖拽上传政策文件</p>
            <p className="text-xs text-muted-foreground mt-1">支持 PDF、Word、TXT 格式，文件大小不超过 20MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={e => handleFileChange(e.target.files)}
          />
        </div>
      )}

      {/* 起草庫選擇 */}
      {tab === "library" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={librarySearch}
              onChange={e => setLibrarySearch(e.target.value)}
              placeholder="搜索起草库中的政策..."
              className="w-full h-10 pl-9 pr-4 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">暂无匹配政策</p>
            ) : filtered.map(p => (
              <div
                key={p.id}
                onClick={() => onSelect({ id: p.id, title: p.title, source: "library" })}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-muted/40 ${
                  selected?.id === p.id ? "bg-primary/5" : ""
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selected?.id === p.id ? "border-primary bg-primary" : "border-border"
                }`}>
                  {selected?.id === p.id && (
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{p.title}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded">{p.dept}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
