import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, Sparkles, FileText, ClipboardCheck, CheckCircle, MessageSquare, Search, Upload, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Undo2, Redo2, Loader2, Pencil, Check, X, Plus, ChevronDown, ChevronRight, Copy, AlertTriangle, ShieldAlert, RefreshCw, Users, Banknote, BarChart3, TrendingUp, ExternalLink, Wand2, PenLine, Expand, Calculator, BookmarkPlus, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { PolicyItem } from "./PolicySearchStep";
import type { OutlineSection, OutlineSubSection } from "./OutlineGenerationStep";
import { generateContent, type Citation } from "@/lib/policyDraftApi";

interface PolicyOutputPageProps {
  policyTitle: string;
  coreElements?: string;
  selectedPolicies?: PolicyItem[];
  outline?: OutlineSection[];
  onBack: () => void;
  /** 快速起草模式：跳过 loading 骨架，直接打字机输出全文 */
  typewriterMode?: boolean;
}

const editorTools = [
  { id: "outline", icon: Sparkles, label: "提纲编辑" },
  { id: "clause", icon: FileText, label: "生成条款" },
  { id: "review", icon: CheckCircle, label: "审稿核稿" },
  { id: "evaluate", icon: MessageSquare, label: "政策自评估" },
  { id: "calculate", icon: Calculator, label: "政策测算" },
];

/** 段落 AI 操作選單 */
const PARA_ACTIONS = [
  { id: "accompany", icon: PenLine,      label: "AI伴写",    desc: "基于上下文续写内容" },
  { id: "expand",    icon: Expand,       label: "扩写",      desc: "丰富段落细节与论据" },
  { id: "polish",    icon: Paintbrush,   label: "润色",      desc: "优化表达与措辞" },
  { id: "calculate", icon: Calculator,   label: "资金测算",  desc: "测算资金规模与覆盖" },
  { id: "reserve",   icon: BookmarkPlus, label: "加入条款储备库", desc: "收藏至条款储备库" },
] as const;

type CalculatorTab = "calculator" | "result" | "companies";

type CompanyRecord = {
  id: number;
  name: string;
  creditCode: string;
  capital: number;
  address: string;
  establishedAt: string;
  industry: string;
  category: string;
};

const CALCULATOR_COMPANIES: CompanyRecord[] = [
  { id: 1, name: "北京盛通包装印刷有限公司", creditCode: "91110302582534431E", capital: 6000, address: "北京市北京经济技术开发区兴盛街11号", establishedAt: "2011-09-15", industry: "制造业", category: "有限责任公司（法人独资）" },
  { id: 2, name: "北京久其政务软件股份有限公司", creditCode: "911103027839538276", capital: 33000, address: "北京市北京经济技术开发区西环中路6号", establishedAt: "2006-01-12", industry: "信息传输、软件和信息技术服务业", category: "其他股份有限公司(非上市)" },
  { id: 3, name: "北京天润融通科技股份有限公司", creditCode: "91110108785512910D", capital: 5166, address: "北京市北京经济技术开发区荣华南路2号院1号楼2901", establishedAt: "2006-02-23", industry: "科学研究和技术服务业", category: "股份有限公司" },
  { id: 4, name: "中冶赛迪电气技术有限公司", creditCode: "91110302669901310K", capital: 31000, address: "北京市北京经济技术开发区博兴一路10号", establishedAt: "2007-12-05", industry: "科学研究和技术服务业", category: "有限责任公司" },
  { id: 5, name: "北京惠达通泰供应链管理有限责任公司", creditCode: "91110112MA01K8TU9X", capital: 3000, address: "北京市北京经济技术开发区（通州）景盛南二街29号2幢", establishedAt: "2019-05-21", industry: "租赁和商务服务业", category: "有限责任公司" },
  { id: 6, name: "德迈特医学技术（北京）有限公司", creditCode: "9111011266560428X9", capital: 348.377, address: "北京市通州区中关村科技园区通州园金桥科技产业基地环科中路16号68号楼一层、二层A", establishedAt: "2007-08-27", industry: "科学研究和技术服务业", category: "有限责任公司" },
  { id: 7, name: "北京首创大气环境科技股份有限公司", creditCode: "91110108746132464M", capital: 24640, address: "北京市北京经济技术开发区（通州）兴贸一街7号院4号楼3层302室", establishedAt: "2002-12-27", industry: "科学研究和技术服务业", category: "股份有限公司" },
  { id: 8, name: "北京天助畅运医疗技术股份有限公司", creditCode: "91110302696331572A", capital: 6800, address: "北京市北京经济技术开发区荣华中路8号院", establishedAt: "2009-11-10", industry: "卫生和社会工作", category: "股份有限公司" },
  { id: 9, name: "赛诺威盛科技（北京）股份有限公司", creditCode: "91110108784823011A", capital: 12500, address: "北京市北京经济技术开发区科创六街88号", establishedAt: "2005-05-18", industry: "制造业", category: "股份有限公司" },
  { id: 10, name: "北京互时科技股份有限公司", creditCode: "91110108672844763N", capital: 8200, address: "北京市北京经济技术开发区荣京东街3号", establishedAt: "2008-03-06", industry: "信息传输、软件和信息技术服务业", category: "股份有限公司" },
];

const CALCULATOR_INDUSTRY_DATA = [
  { name: "制造业", value: 42, color: "#3b82f6" },
  { name: "信息传输、软件和信息技术服务业", value: 8, color: "#22c1c3" },
  { name: "科学研究和技术服务业", value: 143, color: "#fb923c" },
  { name: "租赁和商务服务业", value: 2, color: "#c084fc" },
  { name: "文化、体育和娱乐业", value: 1, color: "#8b5cf6" },
  { name: "建筑业", value: 2, color: "#65a30d" },
  { name: "批发和零售业", value: 5, color: "#ca8a04" },
  { name: "交通运输、仓储和邮政业", value: 1, color: "#f472b6" },
];

const CALCULATOR_CATEGORY_DATA = [
  { name: "有限责任公司（法人独资）", value: 39 },
  { name: "其他股份有限公司(非上市)", value: 18 },
  { name: "有限责任公司", value: 39 },
  { name: "股份有限公司", value: 26 },
  { name: "股份合作制", value: 7 },
  { name: "集体所有制", value: 6 },
  { name: "有限责任公司（台港澳与境内合资）", value: 3 },
  { name: "有限责任公司（中外合资）", value: 2 },
  { name: "有限责任公司（外商投资）", value: 2 },
  { name: "其他", value: 1 },
];

function PolicyCalculatorWorkspace() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>("calculator");
  const [clauseContent, setClauseContent] = useState("对在经开区注册的专精特新企业，实缴资本大于100万的按照实缴资本5%给予支持，最高不超过300万");
  const [supportMode, setSupportMode] = useState<"fixed" | "ratio">("ratio");
  const [capitalValue, setCapitalValue] = useState("100");
  const [ratioValue, setRatioValue] = useState("5.00");
  const [maxAmount, setMaxAmount] = useState("300.00");
  const [isCalculating, setIsCalculating] = useState(false);
  const [resultReady, setResultReady] = useState(true);

  const companyCount = 204;
  const totalSupport = 26706.12;
  const displayedCompanies = CALCULATOR_COMPANIES;

  const startCalculation = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setResultReady(true);
      setActiveTab("result");
    }, 1000);
  };

  const renderTabButton = (tab: CalculatorTab, label: string) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`border-b-2 px-6 py-4 text-[15px] font-semibold transition-colors ${
        activeTab === tab ? "border-primary text-primary" : "border-transparent text-foreground/80 hover:text-primary"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5">
        <div className="flex items-center">
          {renderTabButton("calculator", "政策测算")}
          {renderTabButton("result", "测算结果")}
          {renderTabButton("companies", "企业名单")}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
          <PenLine className="h-3.5 w-3.5" />
          意见反馈
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "calculator" && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl border border-border">
              <div className="border-b border-border px-5 py-5">
                <h3 className="flex items-center gap-2 text-[18px] font-bold text-foreground">
                  <span className="h-8 w-1 rounded-full bg-primary" />
                  条款内容
                </h3>
                <div className="mt-5">
                  <textarea
                    value={clauseContent}
                    onChange={(e) => setClauseContent(e.target.value)}
                    className="min-h-[88px] w-full resize-none rounded-2xl border border-border bg-background px-5 py-4 text-[14px] leading-7 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="mt-2 text-right text-sm text-muted-foreground">{clauseContent.length} / 500</div>
                </div>
                <Button className="mt-4 rounded-xl bg-primary px-6 hover:bg-primary/90">智能解析</Button>
              </div>

              <div className="px-5 py-5">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-[18px] font-bold text-foreground">
                    <span className="h-8 w-1 rounded-full bg-primary" />
                    测算条件
                  </h3>
                  <div className="flex items-center gap-6 text-primary">
                    <button type="button" className="flex items-center gap-2 text-[15px] font-medium">
                      <Plus className="h-4 w-4" />
                      添加条件
                    </button>
                    <button type="button" className="flex items-center gap-2 text-[15px] font-medium">
                      <X className="h-4 w-4" />
                      清空条件
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="mb-3 text-[15px] font-medium text-foreground">实缴资本</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <input value="实缴资本" readOnly className="h-12 w-[180px] rounded-xl border border-border bg-muted/20 px-4 text-[15px] text-muted-foreground" />
                      <button type="button" className="flex h-12 w-16 items-center justify-center rounded-xl border border-border bg-background text-[24px] text-foreground">
                        &gt;
                      </button>
                      <input value={capitalValue} onChange={(e) => setCapitalValue(e.target.value)} className="h-12 w-[140px] rounded-xl border border-border bg-background px-4 text-[15px] text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
                      <span className="text-[18px] text-foreground">万元</span>
                      <button type="button" className="rounded-full border border-border p-1 text-muted-foreground"><Plus className="h-4 w-4" /></button>
                      <button type="button" className="rounded-full border border-border p-1 text-muted-foreground"><X className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[15px] font-medium text-foreground">企业资质类-资质称号</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-[15px] text-foreground">
                        专精特新
                        <X className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <button type="button" className="rounded-full border border-border p-1 text-muted-foreground"><X className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-4 text-[15px] text-foreground">
                      <span className="font-medium">扶持方式:</span>
                      <label className="flex items-center gap-2">
                        <input type="radio" checked={supportMode === "fixed"} onChange={() => setSupportMode("fixed")} />
                        固定金额
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" checked={supportMode === "ratio"} onChange={() => setSupportMode("ratio")} />
                        固定比例
                      </label>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[15px] font-medium text-foreground">依据指标:</span>
                        <select className="h-12 w-[180px] rounded-xl border border-border bg-background px-4 text-[15px] text-foreground outline-none">
                          <option>实缴资本</option>
                          <option>营业收入</option>
                          <option>研发投入</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[15px] font-medium text-foreground">支持比例:</span>
                        <input value={ratioValue} onChange={(e) => setRatioValue(e.target.value)} className="h-12 w-[120px] rounded-xl border border-border bg-background px-4 text-[15px] text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
                        <span className="text-[18px] text-foreground">%</span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <span className="text-[15px] font-medium text-foreground">最高:</span>
                      <input value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="h-12 w-[140px] rounded-xl border border-border bg-background px-4 text-[15px] text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
                      <select className="h-12 w-[120px] rounded-xl border border-border bg-background px-4 text-[15px] text-foreground outline-none">
                        <option>万元</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button onClick={startCalculation} className="mt-8 rounded-xl bg-primary px-8 py-6 text-[16px] hover:bg-primary/90" disabled={isCalculating}>
                  {isCalculating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />测算中...</> : "开始测算"}
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-border p-5">
                <h3 className="flex items-center gap-2 text-[18px] font-bold text-foreground">
                  <span className="h-8 w-1 rounded-full bg-primary" />
                  测算结果
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-blue-50 p-5">
                    <p className="text-[16px] font-semibold text-foreground">获扶持企业</p>
                    <p className="mt-3 text-5xl font-bold text-slate-900">{companyCount}<span className="ml-2 text-2xl font-medium">家</span></p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-5">
                    <p className="text-[16px] font-semibold text-foreground">总扶持金额</p>
                    <p className="mt-3 text-5xl font-bold text-slate-900">{totalSupport.toFixed(2)}<span className="ml-2 text-2xl font-medium">万元</span></p>
                  </div>
                </div>
                <div className="mt-6 border-t border-border pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[15px] font-semibold text-foreground">以下为符合条件的部分企业名称（最多显示100家企业）</p>
                    <button type="button" onClick={() => setActiveTab("companies")} className="text-[15px] font-medium text-primary">
                      查看更多企业信息 &gt;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-x-10 gap-y-3 text-[15px] leading-7 text-foreground md:grid-cols-2">
                    {displayedCompanies.slice(0, 12).map((company) => (
                      <div key={company.id} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                        <span>{company.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "result" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="rounded-2xl bg-blue-50 px-8 py-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[18px] font-semibold text-foreground">获扶持企业</p>
                      <p className="mt-4 text-6xl font-bold text-slate-900">{companyCount}<span className="ml-2 text-2xl font-medium">家</span></p>
                    </div>
                    <button type="button" onClick={() => setActiveTab("companies")} className="text-[16px] font-medium text-primary">查看企业 &raquo;</button>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="rounded-2xl bg-blue-50 px-8 py-10">
                  <p className="text-[18px] font-semibold text-foreground">总扶持金额</p>
                  <p className="mt-4 text-6xl font-bold text-slate-900">{totalSupport.toFixed(2)}<span className="ml-2 text-2xl font-medium">万元</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-6 py-5">
                  <h3 className="flex items-center gap-2 text-[18px] font-bold text-foreground">
                    <span className="h-8 w-1 rounded-full bg-primary" />
                    测算企业行业分布
                  </h3>
                </div>
                <div className="grid min-h-[420px] grid-cols-1 items-center gap-4 px-6 py-6 md:grid-cols-[1fr_1.1fr]">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={CALCULATOR_INDUSTRY_DATA} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={2}>
                          {CALCULATOR_INDUSTRY_DATA.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value} 家`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {CALCULATOR_INDUSTRY_DATA.map((item) => {
                      const percentage = ((item.value / companyCount) * 100).toFixed(2);
                      return (
                        <div key={item.name} className="flex items-center gap-3 text-[14px] text-foreground">
                          <span className="h-3.5 w-3.5 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
                          <span>{item.name} {percentage}% ({item.value})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-6 py-5">
                  <h3 className="flex items-center gap-2 text-[18px] font-bold text-foreground">
                    <span className="h-8 w-1 rounded-full bg-primary" />
                    测算企业性质分布
                  </h3>
                </div>
                <div className="h-[420px] px-4 py-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={CALCULATOR_CATEGORY_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 90 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-90} textAnchor="end" interval={0} height={120} tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => `${value} 家`} />
                      <Bar dataKey="value" fill="#73a4f6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "companies" && (
          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-6 py-5">
              <h3 className="flex items-center gap-2 text-[18px] font-bold text-foreground">
                <span className="h-8 w-1 rounded-full bg-primary" />
                已为您找到<span className="text-primary">{companyCount}</span>家符合条件的企业
              </h3>
            </div>
            <div className="overflow-x-auto px-6 py-5">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-muted/30 text-left text-[15px] font-semibold text-foreground">
                    {["序号", "企业名称", "统一社会信用代码", "注册资本(万元)", "地址", "成立日期", "所属行业"].map((head) => (
                      <th key={head} className="border-b border-border px-4 py-4">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedCompanies.map((company) => (
                    <tr key={company.id} className="text-[15px] text-foreground">
                      <td className="border-b border-border px-4 py-5">{company.id}</td>
                      <td className="border-b border-border px-4 py-5 font-medium">{company.name}</td>
                      <td className="border-b border-border px-4 py-5">{company.creditCode}</td>
                      <td className="border-b border-border px-4 py-5">{company.capital}</td>
                      <td className="border-b border-border px-4 py-5">{company.address}</td>
                      <td className="border-b border-border px-4 py-5">{company.establishedAt}</td>
                      <td className="border-b border-border px-4 py-5">{company.industry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReferencePanel({ selectedPolicies = [] }: { selectedPolicies?: PolicyItem[] }) {
  const initialDocs = selectedPolicies.map((p) => ({ title: p.title, selected: p.selected }));
  const [docs, setDocs] = useState(initialDocs.length > 0 ? initialDocs : []);
  const selectedDocs = docs.filter((d) => d.selected);

  const toggleDoc = (index: number) => {
    setDocs((prev) => prev.map((d, i) => (i === index ? { ...d, selected: !d.selected } : d)));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">参考文档</h3>
        </div>
        <p className="text-xs text-muted-foreground">管理和选择用于政策生成的参考文档</p>
      </div>

      {/* Selected docs */}
      {selectedDocs.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">已选文档（{selectedDocs.length}）</p>
          {selectedDocs.map((doc) => (
            <div
              key={doc.title}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-muted/50 text-xs"
            >
              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-foreground truncate">{doc.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索文档库..."
          className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* Upload */}
      <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-2.5 py-2 rounded-lg border border-dashed border-border hover:border-primary/30">
        <Upload className="h-3.5 w-3.5" />
        上传本地文件
      </button>

      {/* Document library */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground mb-2">文档库</p>
        {docs.map((doc, i) => (
          <button
            key={doc.title}
            onClick={() => toggleDoc(i)}
            className={`flex items-center gap-2.5 w-full text-left px-2.5 py-2.5 rounded-lg text-xs transition-colors ${
              doc.selected
                ? "bg-primary/5 hover:bg-primary/10"
                : "hover:bg-muted/50"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                doc.selected
                  ? "border-primary bg-primary"
                  : "border-border"
              }`}
            >
              {doc.selected && (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`truncate ${doc.selected ? "text-foreground font-medium" : "text-foreground"}`}>
              {doc.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 政策工具選項 ─────────────────────────────────────────
const POLICY_TOOLS = [
  { value: "subsidy", label: "资金补贴类" },
  { value: "tax", label: "税收减免类" },
  { value: "talent", label: "人才引进类" },
  { value: "land", label: "用地保障类" },
  { value: "credit", label: "金融信贷类" },
  { value: "award", label: "奖励扶持类" },
  { value: "platform", label: "平台建设类" },
  { value: "procurement", label: "政府采购类" },
];

const REFERENCE_CLAUSES: Record<string, string[]> = {
  subsidy: [
    "对研发投入给予不超过实际发生额30%的补贴，单个企业年度最高500万元",
    "对符合条件的企业一次性给予20万元落地奖励",
    "对购置先进设备按设备价款的15%给予补贴，单次最高100万元",
  ],
  tax: [
    "对符合条件的高新技术企业按15%的税率征收企业所得税",
    "企业研发费用允许加计扣除100%，形成无形资产的按175%摊销",
    "对技术转让所得500万元以下部分免征企业所得税",
  ],
  talent: [
    "对引进的顶尖人才给予最高500万元安家补贴及配套科研经费",
    "对高层次人才提供人才公寓保障，租金按市场价70%收取",
    "对博士及以上学历人才给予每月3000元生活补贴，期限3年",
  ],
  land: [
    "对重点产业项目优先保障建设用地指标，享受土地出让金优惠",
    "对符合条件的企业允许弹性年期出让，最短5年",
    "支持企业利用自有用地建设研发楼宇，容积率适当提高",
  ],
  credit: [
    "对成长型科技企业给予最高500万元无抵押信用贷款",
    "对贷款利率超过同期LPR部分给予贴息补贴，每年最高100万元",
    "为区内企业建立融资信用档案，提供绿色通道融资服务",
  ],
  award: [
    "对新认定的国家级专精特新'小巨人'企业给予100万元奖励",
    "对获得国家科技进步奖的企业，按奖励金额1:1配套奖励",
    "对产品销售额首次突破1亿元的企业给予50万元奖励",
  ],
  platform: [
    "对新建国家级重点实验室给予最高2000万元建设补贴",
    "对企业建设的公共技术服务平台给予运营补贴，每年最高200万元",
    "支持企业牵头组建产业联盟，给予秘书处运营经费支持",
  ],
  procurement: [
    "政府采购创新产品优先采购区内企业产品，份额不低于30%",
    "对区内企业参与政府采购项目给予5%价格评审优惠",
    "建立政府首购和订购机制，对新产品推广应用给予支持",
  ],
};

// ─── 生成條款面板 ─────────────────────────────────────────
function ClauseGeneratorPanel({ policyTitle }: { policyTitle: string }) {
  const [objective, setObjective] = useState("");
  const [tool, setTool] = useState("");
  const [generatedClause, setGeneratedClause] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [refClauses, setRefClauses] = useState<string[]>([]);
  const [showRef, setShowRef] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShowRef = () => {
    setRefClauses(REFERENCE_CLAUSES[tool] || []);
    setShowRef(true);
  };

  const handleGenerate = () => {
    if (!tool) return;
    setIsGenerating(true);
    setGeneratedClause("");
    const toolLabel = POLICY_TOOLS.find(t => t.value === tool)?.label || "";
    const base = REFERENCE_CLAUSES[tool]?.[0] || "";
    const result = `【${toolLabel}】\n\n${objective ? `基于政策目标"${objective}"，结合${policyTitle}的实际情况，` : ""}${base}。\n\n申报企业须满足以下条件：\n（一）在本区注册并正常经营一年以上；\n（二）企业信用状况良好；\n（三）提交完整的申请材料并通过专家评审。`;
    let i = 0;
    const interval = setInterval(() => {
      if (i < result.length) {
        setGeneratedClause(result.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 18);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedClause).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-4 space-y-0 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">生成条款</h3>

      {/* 政策目標 */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-0.5 h-3.5 bg-primary rounded-full" />
          <p className="text-xs font-medium text-foreground">政策目标</p>
        </div>
        <input
          type="text"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="请输入政策目标"
          className="w-full h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* 政策工具 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3.5 bg-primary rounded-full" />
            <p className="text-xs font-medium text-foreground">政策工具</p>
          </div>
          <button
            onClick={handleShowRef}
            disabled={!tool}
            className="text-xs px-2.5 py-1 rounded-md border border-primary text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            参考条款
          </button>
        </div>
        <div className="relative">
          <select
            value={tool}
            onChange={(e) => { setTool(e.target.value); setShowRef(false); setRefClauses([]); }}
            className="w-full h-9 px-3 pr-8 text-xs rounded-lg border border-border bg-background text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
          >
            <option value="">请选择政策工具</option>
            {POLICY_TOOLS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* 參考條款彈出 */}
        <AnimatePresence>
          {showRef && refClauses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="mt-2 rounded-lg border border-primary/20 bg-primary/3 p-2 space-y-1.5"
            >
              <p className="text-[11px] font-medium text-primary mb-1.5">参考条款示例</p>
              {refClauses.map((clause, i) => (
                <div
                  key={i}
                  onClick={() => { setGeneratedClause(clause); setShowRef(false); }}
                  className="text-[11px] text-muted-foreground leading-relaxed px-2 py-1.5 rounded-md hover:bg-primary/8 hover:text-foreground cursor-pointer transition-colors border border-transparent hover:border-primary/15"
                >
                  {i + 1}. {clause}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 生成條款區域 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3.5 bg-primary rounded-full" />
            <p className="text-xs font-medium text-foreground">生成条款</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!tool || isGenerating}
            className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity font-medium flex items-center gap-1"
          >
            {isGenerating && <Loader2 className="h-3 w-3 animate-spin" />}
            生成条款
          </button>
        </div>
        <div className="flex-1 relative">
          <textarea
            value={generatedClause}
            onChange={(e) => setGeneratedClause(e.target.value)}
            placeholder="点击「生成条款」自动生成，或直接在此输入条款内容"
            className="w-full h-full min-h-[160px] resize-none px-3 py-2.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 leading-relaxed"
          />
          {generatedClause && !isGenerating && (
            <button
              onClick={handleCopy}
              className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              {copied ? "已复制" : "复制"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 審稿核稿相關型別 ─────────────────────────────────────
type IssueLevel = "sensitive" | "improper";

interface ReviewIssue {
  id: string;
  word: string;
  level: IssueLevel;
  reason: string;
  suggestion: string;
}

/** 模擬審稿：掃描文章中的敏感詞和不當用詞 */
function detectIssues(text: string): ReviewIssue[] {
  const sensitivePatterns: { word: string; reason: string; suggestion: string }[] = [
    { word: "一律", reason: "絕對化用語，易引發歧義", suggestion: "建議改為「原則上」或「一般情況下」" },
    { word: "必须", reason: "強制性用語，法律適用邊界不清", suggestion: "建議結合具體條件說明" },
    { word: "严禁", reason: "禁止性絕對用語，需配合處罰條款", suggestion: "建議明確違規後果" },
    { word: "绝对", reason: "絕對化表述，政策文件應避免", suggestion: "建議刪除或改為限定描述" },
    { word: "最高", reason: "最高額度表述需配套資金來源說明", suggestion: "建議標注「每自然年度最高」" },
    { word: "无条件", reason: "與依法行政原則衝突", suggestion: "建議補充適用條件" },
  ];
  const improperPatterns: { word: string; reason: string; suggestion: string }[] = [
    { word: "等等", reason: "政策文件末尾列舉應使用「等」", suggestion: "改為「等」" },
    { word: "尽快", reason: "時限模糊，缺乏可操作性", suggestion: "建議明確具體時間節點" },
    { word: "适当", reason: "量化標準不明確", suggestion: "建議補充具體比例或金額範圍" },
    { word: "有关部门", reason: "職責主體不清晰", suggestion: "建議明確具體責任部門名稱" },
    { word: "根据情况", reason: "裁量空間過大，不易執行", suggestion: "建議細化判定標準" },
    { word: "相关", reason: "指代不明，政策文件應明確", suggestion: "建議改為具體的主體或事項名稱" },
  ];

  const issues: ReviewIssue[] = [];
  let idx = 0;

  [...sensitivePatterns, ...improperPatterns].forEach(({ word, reason, suggestion }, i) => {
    if (text.includes(word)) {
      const level: IssueLevel = i < sensitivePatterns.length ? "sensitive" : "improper";
      issues.push({ id: `issue-${idx++}`, word, level, reason, suggestion });
    }
  });

  // 若正文較短（mock），補充幾條示範
  if (issues.length < 3) {
    issues.push(
      { id: `issue-${idx++}`, word: "一律", level: "sensitive", reason: "絕對化用語，易引發歧義", suggestion: "建議改為「原則上」" },
      { id: `issue-${idx++}`, word: "尽快", level: "improper", reason: "時限模糊，缺乏可操作性", suggestion: "建議明確具體時間節點" },
      { id: `issue-${idx++}`, word: "有关部门", level: "improper", reason: "職責主體不清晰", suggestion: "建議明確具體責任部門名稱" },
    );
  }
  return issues;
}

// ─── 審稿核稿面板 ─────────────────────────────────────────
function ReviewPanel({
  content,
  onReviewComplete,
}: {
  content: string;
  onReviewComplete: (issues: ReviewIssue[]) => void;
}) {
  const [status, setStatus] = useState<"idle" | "reviewing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [issues, setIssues] = useState<ReviewIssue[]>([]);
  const [activeIssue, setActiveIssue] = useState<string | null>(null);

  const STEPS = [
    "正在加载文档内容...",
    "检测敏感词汇...",
    "分析不当用语...",
    "核查法规合规性...",
    "生成审稿报告...",
  ];
  const [stepIdx, setStepIdx] = useState(0);

  const handleStart = () => {
    setStatus("reviewing");
    setProgress(0);
    setStepIdx(0);
    setIssues([]);

    let p = 0;
    let s = 0;
    const timer = setInterval(() => {
      p += Math.random() * 12 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(timer);
        const found = detectIssues(content);
        setIssues(found);
        setProgress(100);
        setStatus("done");
        onReviewComplete(found);
      } else {
        setProgress(p);
        const nextStep = Math.min(Math.floor(p / 20), STEPS.length - 1);
        if (nextStep > s) s = nextStep;
        setStepIdx(s);
      }
    }, 280);
  };

  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
    setIssues([]);
    setActiveIssue(null);
    onReviewComplete([]);
  };

  const sensitiveCount = issues.filter(i => i.level === "sensitive").length;
  const improperCount = issues.filter(i => i.level === "improper").length;

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">审稿核稿</h3>
        {status === "done" && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3 w-3" />重新审稿
          </button>
        )}
      </div>

      {/* 待機狀態 */}
      {status === "idle" && (
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">自动检测政策文本</p>
              <p className="text-[11px] text-muted-foreground">识别敏感词及不当用词并高亮标注</p>
            </div>
          </div>
          <button
            onClick={handleStart}
            disabled={!content}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            开始审稿核稿
          </button>
        </div>
      )}

      {/* 審稿中 */}
      {status === "reviewing" && (
        <div className="flex flex-col items-center justify-center flex-1 gap-5">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
              <circle
                cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                className="text-primary transition-all duration-300"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-foreground">{STEPS[stepIdx]}</p>
            <p className="text-[11px] text-muted-foreground">请稍候</p>
          </div>
          <div className="w-full space-y-1.5">
            {STEPS.map((step, i) => (
              <div key={i} className={`flex items-center gap-2 text-[11px] transition-colors ${i <= stepIdx ? "text-foreground" : "text-muted-foreground/50"}`}>
                {i < stepIdx
                  ? <Check className="h-3 w-3 text-primary shrink-0" />
                  : i === stepIdx
                    ? <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />
                    : <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />}
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 審稿完成 */}
      {status === "done" && (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          {/* 統計 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 px-3 py-2.5 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
              <div>
                <p className="text-[10px] text-red-600 dark:text-red-400">敏感词</p>
                <p className="text-base font-bold text-red-600 dark:text-red-400">{sensitiveCount}</p>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 px-3 py-2.5 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400">不当用词</p>
                <p className="text-base font-bold text-amber-600 dark:text-amber-400">{improperCount}</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            共发现 <span className="font-medium text-foreground">{issues.length}</span> 处问题，已在文章中高亮标注，点击下方条目可定位
          </p>

          {/* 問題列表 */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setActiveIssue(prev => prev === issue.id ? null : issue.id)}
                className={`rounded-lg border cursor-pointer transition-colors ${
                  issue.level === "sensitive"
                    ? "border-red-200 dark:border-red-900/50 hover:bg-red-50/50 dark:hover:bg-red-950/20"
                    : "border-amber-200 dark:border-amber-900/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                } ${activeIssue === issue.id ? (issue.level === "sensitive" ? "bg-red-50 dark:bg-red-950/20" : "bg-amber-50 dark:bg-amber-950/20") : "bg-card"}`}
              >
                <div className="flex items-center gap-2 px-2.5 py-2">
                  {issue.level === "sensitive"
                    ? <ShieldAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    issue.level === "sensitive"
                      ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                      : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                  }`}>
                    「{issue.word}」
                  </span>
                  <span className={`text-[10px] ml-auto ${issue.level === "sensitive" ? "text-red-500" : "text-amber-500"}`}>
                    {issue.level === "sensitive" ? "敏感词" : "不当用词"}
                  </span>
                </div>
                <AnimatePresence>
                  {activeIssue === issue.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="px-2.5 pb-2.5 space-y-1 border-t border-border/50 pt-2">
                        <p className="text-[11px] text-muted-foreground"><span className="text-foreground font-medium">问题：</span>{issue.reason}</p>
                        <p className="text-[11px] text-muted-foreground"><span className="text-foreground font-medium">建议：</span>{issue.suggestion}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 自評估建議面板 ───────────────────────────────────────

type EvalLevel = "clear" | "vague" | "missing";

interface ClauseEval {
  id: string;
  /** 條款摘要（前30字） */
  clause: string;
  /** 受衆對象 */
  audience: { level: EvalLevel; note: string };
  /** 扶持方式 */
  method: { level: EvalLevel; note: string };
  /** 扶持力度 */
  intensity: { level: EvalLevel; note: string };
  /** 整體可落地性分數（0-100） */
  score: number;
}

const EVAL_LABEL: Record<EvalLevel, string> = { clear: "明確", vague: "模糊", missing: "缺失" };
const EVAL_COLOR: Record<EvalLevel, string> = {
  clear: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  vague: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  missing: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};
const EVAL_DOT: Record<EvalLevel, string> = {
  clear: "bg-emerald-500",
  vague: "bg-amber-500",
  missing: "bg-red-500",
};

/** 從政策全文中提取條款並模擬評估 */
function evaluateClauses(content: string, policyTitle: string): ClauseEval[] {
  const mockClauses = [
    {
      clause: `对符合条件的${policyTitle.includes("科技") ? "科技" : ""}企业给予资金补贴`,
      audience: { level: "vague" as EvalLevel, note: "\"符合条件的企业\"范围未明确，建议细化行业、规模、注册地等准入标准" },
      method: { level: "clear" as EvalLevel, note: "资金补贴方式明确" },
      intensity: { level: "missing" as EvalLevel, note: "补贴金额、比例及上限均未说明，无法量化预期收益" },
      score: 42,
    },
    {
      clause: "对引进高层次人才给予生活补贴及安家费",
      audience: { level: "vague" as EvalLevel, note: "\"高层次人才\"定义模糊，建议对接国家人才目录或设定学历/职称门槛" },
      method: { level: "clear" as EvalLevel, note: "生活补贴与安家费均为常见扶持方式，执行路径清晰" },
      intensity: { level: "vague" as EvalLevel, note: "补贴金额区间未提及，建议明确各档次对应额度" },
      score: 58,
    },
    {
      clause: "对新认定的高新技术企业给予一次性奖励",
      audience: { level: "clear" as EvalLevel, note: "受众为新认定高企，认定标准清晰，边界明确" },
      method: { level: "clear" as EvalLevel, note: "一次性奖励操作简单，兑现路径明确" },
      intensity: { level: "missing" as EvalLevel, note: "奖励金额未注明，建议参照同类城市设定50-100万元区间" },
      score: 65,
    },
    {
      clause: "优先保障重点产业项目用地指标，享受土地出让优惠",
      audience: { level: "vague" as EvalLevel, note: "\"重点产业项目\"需配套产业目录，否则审批自由裁量空间过大" },
      method: { level: "clear" as EvalLevel, note: "用地保障与价格优惠的扶持逻辑清晰" },
      intensity: { level: "vague" as EvalLevel, note: "\"优惠\"程度不明，建议明确折扣比例或地价上限" },
      score: 55,
    },
    {
      clause: "对符合条件的贷款给予利率贴息补贴",
      audience: { level: "clear" as EvalLevel, note: "结合申贷企业范围限定，受众较为清晰" },
      method: { level: "clear" as EvalLevel, note: "贴息补贴操作成熟，银行配合度高" },
      intensity: { level: "clear" as EvalLevel, note: "贴息比例、年度上限均有说明，可落地性强" },
      score: 88,
    },
  ];

  // 若有真實正文，根據行數截取替換 clause 文字
  if (content.length > 100) {
    const lines = content.split("\n").filter(l => l.trim().length > 10);
    mockClauses.forEach((mc, i) => {
      if (lines[i * 3]) mc.clause = lines[i * 3].slice(0, 36).trim() + (lines[i * 3].length > 36 ? "..." : "");
    });
  }
  return mockClauses;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-600 dark:text-emerald-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  const bg = score >= 80 ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" : score >= 60 ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border text-xs font-bold ${color} ${bg}`}>
      {score}分
    </span>
  );
}

function DimTag({ level, label }: { level: EvalLevel; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${EVAL_COLOR[level]}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${EVAL_DOT[level]}`} />
      {label}：{EVAL_LABEL[level]}
    </span>
  );
}

function EvaluationPanel({ content, policyTitle }: { content: string; policyTitle: string }) {
  const [status, setStatus] = useState<"idle" | "evaluating" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ClauseEval[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [stepIdx, setStepIdx] = useState(0);

  const STEPS = [
    "解析政策条款结构...",
    "评估受众对象清晰度...",
    "分析扶持方式可行性...",
    "衡量扶持力度明确性...",
    "生成可落地性报告...",
  ];

  const handleStart = () => {
    setStatus("evaluating");
    setProgress(0);
    setStepIdx(0);
    setResults([]);

    let p = 0;
    let s = 0;
    const timer = setInterval(() => {
      p += Math.random() * 10 + 6;
      if (p >= 100) {
        p = 100;
        clearInterval(timer);
        const evals = evaluateClauses(content, policyTitle);
        setResults(evals);
        setProgress(100);
        setStatus("done");
      } else {
        setProgress(p);
        const ns = Math.min(Math.floor(p / 20), STEPS.length - 1);
        if (ns > s) s = ns;
        setStepIdx(s);
      }
    }, 300);
  };

  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
    setResults([]);
    setExpanded({});
  };

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const avgScore = results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
  const clearCount = results.filter(r => r.audience.level === "clear" && r.method.level === "clear" && r.intensity.level === "clear").length;

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-sm font-semibold text-foreground">政策自评估</h3>
        {status === "done" && (
          <button onClick={handleReset} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3 w-3" />重新评估
          </button>
        )}
      </div>

      {/* 待機 */}
      {status === "idle" && (
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">条款可落地性评估</p>
              <p className="text-[11px] text-muted-foreground">从受众对象、扶持方式、扶持力度<br />三维度衡量条款描写是否明确</p>
            </div>
          </div>
          <button
            onClick={handleStart}
            disabled={!content}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            开始自评估
          </button>
        </div>
      )}

      {/* 評估中 */}
      {status === "evaluating" && (
        <div className="flex flex-col items-center justify-start gap-5 pt-4 flex-1">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
              <circle
                cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                className="text-primary transition-all duration-300"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full space-y-1.5">
            {STEPS.map((step, i) => (
              <div key={i} className={`flex items-center gap-2 text-[11px] transition-colors ${i <= stepIdx ? "text-foreground" : "text-muted-foreground/50"}`}>
                {i < stepIdx
                  ? <Check className="h-3 w-3 text-primary shrink-0" />
                  : i === stepIdx
                    ? <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />
                    : <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />}
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 評估完成 */}
      {status === "done" && (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          {/* 總覽卡 */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-4 shrink-0">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">综合评分</p>
              <ScoreBadge score={avgScore} />
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex-1 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-base font-bold text-foreground">{results.length}</p>
                <p className="text-[10px] text-muted-foreground">总条款</p>
              </div>
              <div>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{clearCount}</p>
                <p className="text-[10px] text-muted-foreground">完全明确</p>
              </div>
              <div>
                <p className="text-base font-bold text-amber-600 dark:text-amber-400">{results.length - clearCount}</p>
                <p className="text-[10px] text-muted-foreground">待完善</p>
              </div>
            </div>
          </div>

          {/* 圖例 */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {(["clear", "vague", "missing"] as EvalLevel[]).map(lv => (
              <div key={lv} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className={`w-2 h-2 rounded-full ${EVAL_DOT[lv]}`} />
                {EVAL_LABEL[lv]}
              </div>
            ))}
          </div>

          {/* 條款卡片列表 */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {results.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card overflow-hidden">
                {/* 卡片頭部 */}
                <div
                  className="flex items-start gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(r.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground font-medium leading-snug line-clamp-2">{r.clause}</p>
                    {/* 三維標籤 */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <DimTag level={r.audience.level} label="受众" />
                      <DimTag level={r.method.level} label="方式" />
                      <DimTag level={r.intensity.level} label="力度" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <ScoreBadge score={r.score} />
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${expanded[r.id] ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* 展開詳情 */}
                <AnimatePresence>
                  {expanded[r.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-3 py-2.5 space-y-2">
                        {[
                          { icon: Users, label: "受众对象", data: r.audience },
                          { icon: Banknote, label: "扶持方式", data: r.method },
                          { icon: BarChart3, label: "扶持力度", data: r.intensity },
                        ].map(({ icon: Icon, label, data }) => (
                          <div key={label} className="flex gap-2">
                            <div className={`flex items-center gap-1 shrink-0 text-[10px] font-medium w-16 ${
                              data.level === "clear" ? "text-emerald-600 dark:text-emerald-400" :
                              data.level === "vague" ? "text-amber-600 dark:text-amber-400" :
                              "text-red-600 dark:text-red-400"
                            }`}>
                              <Icon className="h-3 w-3 shrink-0" />
                              {label}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug flex-1">{data.note}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 大綱 Fallback（後端未返回時的預設結構）────────────────
const FALLBACK_OUTLINE: OutlineSection[] = [
  {
    id: "ch1", title: "一、总则",
    subSections: [
      { id: "ch1-1", title: "1.1 制定目的", keyPoints: ["明确政策出台背景", "阐述政策目标"], referencePolicies: [] },
      { id: "ch1-2", title: "1.2 适用范围", keyPoints: ["界定适用对象", "明确地域范围"], referencePolicies: [] },
    ],
  },
  {
    id: "ch2", title: "二、支持内容",
    subSections: [
      { id: "ch2-1", title: "2.1 支持方式", keyPoints: ["列举具体扶持工具", "说明资金来源"], referencePolicies: [] },
      { id: "ch2-2", title: "2.2 支持标准", keyPoints: ["量化支持力度", "分档设定标准"], referencePolicies: [] },
    ],
  },
  {
    id: "ch3", title: "三、申报条件",
    subSections: [
      { id: "ch3-1", title: "3.1 申报主体资格", keyPoints: ["注册地要求", "经营年限及规模门槛"], referencePolicies: [] },
      { id: "ch3-2", title: "3.2 申报材料", keyPoints: ["基本材料清单", "核查及佐证材料"], referencePolicies: [] },
    ],
  },
  {
    id: "ch4", title: "四、申报流程",
    subSections: [
      { id: "ch4-1", title: "4.1 受理与审核", keyPoints: ["申报时间窗口", "审核流程与时限"], referencePolicies: [] },
      { id: "ch4-2", title: "4.2 资金拨付", keyPoints: ["拨付方式", "绩效跟踪要求"], referencePolicies: [] },
    ],
  },
  {
    id: "ch5", title: "五、附则",
    subSections: [
      { id: "ch5-1", title: "5.1 解释权与生效日期", keyPoints: ["主管部门", "生效日期"], referencePolicies: [] },
    ],
  },
];

// ─── 行內編輯器（大綱面板用）────────────────────────────────
function OutlineInlineEditor({
  value, onSave, className = "",
}: { value: string; onSave: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const commit = () => { onSave(draft.trim() || value); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };
  if (!editing) {
    return (
      <span
        className={`group/oe flex items-center gap-1 cursor-pointer ${className}`}
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        <span className="flex-1">{value}</span>
        <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover/oe:opacity-100 shrink-0 transition-opacity" />
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 w-full">
      <input
        ref={ref} value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
        className={`flex-1 min-w-0 bg-primary/5 border border-primary/30 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary/30 ${className}`}
      />
      <button onClick={commit} className="text-primary shrink-0"><Check className="h-3 w-3" /></button>
      <button onClick={cancel} className="text-muted-foreground shrink-0"><X className="h-3 w-3" /></button>
    </span>
  );
}

export function PolicyOutputPage({
  policyTitle,
  coreElements = "",
  selectedPolicies = [],
  outline: outlineProp = [],
  onBack,
  typewriterMode = false,
}: PolicyOutputPageProps) {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const fullContentRef = useRef("");

  /** 審稿核稿結果 */
  const [reviewIssues, setReviewIssues] = useState<ReviewIssue[]>([]);

  /** 正文引用列表 */
  const [citations, setCitations] = useState<Citation[]>([]);

  /** 段落互動 */
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [paraMenuIdx, setParaMenuIdx] = useState<number | null>(null);
  const [paraActionResult, setParaActionResult] = useState<{ idx: number; action: string; text: string } | null>(null);
  const [paraActionLoading, setParaActionLoading] = useState(false);

  /** AI 全文潤色 */
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishDone, setPolishDone] = useState(false);

  /** 可編輯大綱 state — outlineProp 為空時使用模組層級的 FALLBACK_OUTLINE */
  const [editableOutline, setEditableOutline] = useState<OutlineSection[]>(() =>
    outlineProp.length > 0 ? outlineProp : FALLBACK_OUTLINE
  );
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const src = outlineProp.length > 0 ? outlineProp : FALLBACK_OUTLINE;
    const init: Record<string, boolean> = {};
    src.forEach((s) => { init[s.id] = true; });
    return init;
  });
  const [isOutlineRegenerating, setIsOutlineRegenerating] = useState(false);

  /** 提綱面板每節的「參考文檔」輸入框顯示狀態 */
  const [showRefInput, setShowRefInput] = useState<Record<string, boolean>>({});
  const [refInputVal, setRefInputVal] = useState<Record<string, string>>({});

  useEffect(() => {
    if (outlineProp.length > 0) {
      setEditableOutline(outlineProp);
      const init: Record<string, boolean> = {};
      outlineProp.forEach((s) => { init[s.id] = true; });
      setExpandedChapters(init);
    }
  }, [outlineProp.length]);

  /** 重新生成提綱（模擬） */
  const handleRegenerateOutline = () => {
    setIsOutlineRegenerating(true);
    setTimeout(() => {
      const base = outlineProp.length > 0 ? outlineProp : FALLBACK_OUTLINE;
      setEditableOutline(base.map(s => ({
        ...s,
        subSections: s.subSections.map(sub => ({
          ...sub,
          keyPoints: [...sub.keyPoints, "（重新生成补充要点）"],
        })),
      })));
      setIsOutlineRegenerating(false);
    }, 1800);
  };

  /** 節：新增參考文檔 */
  const addRefToSub = (sId: string, subId: string, title: string) => {
    if (!title.trim()) return;
    patchSub(sId, subId, {
      referencePolicies: [
        ...(editableOutline.find(s => s.id === sId)?.subSections.find(s => s.id === subId)?.referencePolicies ?? []),
        title.trim(),
      ],
    });
    setRefInputVal(prev => ({ ...prev, [`${sId}-${subId}`]: "" }));
    setShowRefInput(prev => ({ ...prev, [`${sId}-${subId}`]: false }));
  };

  /** 節：刪除參考文檔 */
  const removeRefFromSub = (sId: string, subId: string, ri: number) => {
    const sub = editableOutline.find(s => s.id === sId)?.subSections.find(s => s.id === subId);
    if (sub) patchSub(sId, subId, { referencePolicies: sub.referencePolicies.filter((_, i) => i !== ri) });
  };

  // ── 大綱編輯操作 ──
  const updateChapterTitle = (sId: string, v: string) =>
    setEditableOutline(prev => prev.map(s => s.id === sId ? { ...s, title: v } : s));

  const patchSub = (sId: string, subId: string, patch: Partial<OutlineSubSection>) =>
    setEditableOutline(prev => prev.map(s =>
      s.id === sId ? { ...s, subSections: s.subSections.map(sub => sub.id === subId ? { ...sub, ...patch } : sub) } : s
    ));

  const updateSubTitle = (sId: string, subId: string, v: string) => patchSub(sId, subId, { title: v });

  const updateKeyPoint = (sId: string, subId: string, pi: number, v: string) => {
    const sub = editableOutline.find(s => s.id === sId)?.subSections.find(s => s.id === subId);
    if (sub) patchSub(sId, subId, { keyPoints: sub.keyPoints.map((k, i) => i === pi ? v : k) });
  };

  const addKeyPoint = (sId: string, subId: string) => {
    const sub = editableOutline.find(s => s.id === sId)?.subSections.find(s => s.id === subId);
    if (sub) patchSub(sId, subId, { keyPoints: [...sub.keyPoints, "新要点"] });
  };

  const removeKeyPoint = (sId: string, subId: string, pi: number) => {
    const sub = editableOutline.find(s => s.id === sId)?.subSections.find(s => s.id === subId);
    if (sub) patchSub(sId, subId, { keyPoints: sub.keyPoints.filter((_, i) => i !== pi) });
  };

  const addSubSection = (sId: string) =>
    setEditableOutline(prev => prev.map(s =>
      s.id === sId ? { ...s, subSections: [...s.subSections, { id: `${sId}-${Date.now()}`, title: "新节标题", keyPoints: ["新要点"], referencePolicies: [] }] } : s
    ));

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    generateContent({ policyTitle, coreElements, selectedPolicies, outline: outlineProp })
      .then(({ content, citations: cites }) => {
        if (cites?.length) setCitations(cites);
        fullContentRef.current = content;
        setIsLoading(false);

        /**
         * typewriterMode：快速起草入口，跳过等待直接逐字输出；
         * 正常模式：12ms/字；快速模式：6ms/字（更快体验打字机效果）
         */
        const charDelay = typewriterMode ? 6 : 12;
        let index = 0;
        const interval = setInterval(() => {
          if (index < content.length) {
            setDisplayedText(content.slice(0, index + 1));
            index++;
          } else {
            setIsComplete(true);
            clearInterval(interval);
          }
        }, charDelay);
        return () => clearInterval(interval);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 將文章文字按問題詞語分割並包裹高亮 span
   * 敏感詞 → 紅色底，不當用詞 → 橙色底
   */
  /** 將純文字 token 轉為 React 節點，同時處理 [ref:N] 角標 */
  const renderToken = (token: string, keyPrefix: string) => {
    const citationMap = Object.fromEntries(citations.map(c => [`[ref:${c.index}]`, c]));
    const refPattern = citations.length > 0
      ? new RegExp(`(\\[ref:\\d+\\])`, "g")
      : null;

    if (!refPattern) return <span key={keyPrefix}>{token}</span>;

    const subParts = token.split(refPattern);
    return (
      <span key={keyPrefix}>
        {subParts.map((sub, si) => {
          const cite = citationMap[sub];
          if (!cite) return <span key={si}>{sub}</span>;
          return (
            <span key={si} className="relative inline-block group/cite">
              <a
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-w-[1.1em] h-[1.1em] text-[10px] font-bold leading-none align-super bg-primary/15 hover:bg-primary/30 text-primary rounded border border-primary/30 px-0.5 mx-0.5 cursor-pointer transition-colors no-underline"
                title={`${cite.title}${cite.source ? ` — ${cite.source}` : ""}`}
              >
                {cite.index}
              </a>
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none opacity-0 group-hover/cite:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                <span className="flex flex-col items-start gap-0.5 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg px-3 py-2.5 text-[11px] w-[380px] whitespace-normal">
                  <span className="font-semibold text-foreground">{cite.title}</span>
                  {cite.source && <span className="text-muted-foreground">{cite.source}</span>}
                  <span className="text-primary text-[10px]">点击跳转政策原文 →</span>
                </span>
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-1 overflow-hidden">
                  <span className="block w-2 h-2 bg-popover border-r border-b border-border rotate-45 -translate-y-1.5 translate-x-0" />
                </span>
              </span>
            </span>
          );
        })}
      </span>
    );
  };

  /**
   * 渲染正文：同時處理審稿高亮（底色）和引用角標 [ref:N]
   */
  const renderHighlightedText = (text: string) => {
    // 先按審稿敏感詞分割，再對每個片段處理引用角標
    if (reviewIssues.length === 0) {
      return <>{renderToken(text, "all")}</>;
    }

    const pattern = reviewIssues.map(i => i.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const regex = new RegExp(`(${pattern})`, "g");
    const parts = text.split(regex);
    const issueMap = Object.fromEntries(reviewIssues.map(i => [i.word, i]));

    return (
      <>
        {parts.map((part, idx) => {
          const issue = issueMap[part];
          if (issue) {
            return (
              <mark
                key={idx}
                title={`${issue.level === "sensitive" ? "敏感词" : "不当用词"}：${issue.reason}`}
                className={`rounded px-0.5 cursor-help ${
                  issue.level === "sensitive"
                    ? "bg-red-200/70 dark:bg-red-800/50 text-red-800 dark:text-red-200 underline decoration-red-400 decoration-wavy underline-offset-2"
                    : "bg-amber-200/70 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 underline decoration-amber-400 decoration-wavy underline-offset-2"
                }`}
              >
                {part}
              </mark>
            );
          }
          return renderToken(part, `t-${idx}`);
        })}
      </>
    );
  };

  const handleToolClick = (id: string) => {
    setActivePanel((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* 快速起草模式：打字机输出进度提示条 */}
      {typewriterMode && !isComplete && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 mb-3 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 shrink-0"
        >
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-amber-500"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <span className="text-xs font-medium">AI 正在输出政策全文，请稍候…</span>
        </motion.div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-foreground">政策文件编辑</h2>
        </div>
        <div className="flex gap-2">
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-2"
            >
              <Button
                size="sm"
                className="text-xs gap-1.5 gov-gradient text-primary-foreground hover:opacity-90"
                onClick={() => navigate("/policy-writing/pre-evaluation")}
              >
                去评估
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left tool sidebar — 無右側面板時垂直置中 */}
        <div className="w-16 shrink-0 flex flex-col items-center gap-1 pt-2">
          {editorTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg transition-colors cursor-pointer group w-full ${
                activePanel === tool.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent/50"
              }`}
            >
              <tool.icon className={`h-4 w-4 transition-colors ${
                activePanel === tool.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              }`} />
              <span className={`text-[10px] transition-colors leading-tight text-center ${
                activePanel === tool.id ? "text-primary font-medium" : "text-muted-foreground group-hover:text-primary"
              }`}>
                {tool.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main content area */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-card rounded-xl border border-border min-w-0 flex flex-col min-h-0"
        >
          {activePanel === "calculate" ? (
            <PolicyCalculatorWorkspace />
          ) : (
            <>
              {/* Editor toolbar */}
              <div className="flex items-center gap-0.5 px-4 py-2 border-b border-border flex-wrap shrink-0">
                <div className="flex items-center gap-0.5">
                  <button className="p-1.5 rounded hover:bg-muted transition-colors" title="撤销"><Undo2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button className="p-1.5 rounded hover:bg-muted transition-colors" title="重做"><Redo2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </div>
                <div className="w-px h-4 bg-border mx-1.5" />
                <select className="h-7 px-2 text-xs rounded border border-border bg-background text-foreground appearance-none cursor-pointer">
                  <option>正文</option>
                  <option>标题一</option>
                  <option>标题二</option>
                  <option>标题三</option>
                </select>
                <select className="h-7 px-2 text-xs rounded border border-border bg-background text-foreground appearance-none cursor-pointer ml-1">
                  <option>14px</option>
                  <option>12px</option>
                  <option>16px</option>
                  <option>18px</option>
                  <option>20px</option>
                </select>
                <div className="w-px h-4 bg-border mx-1.5" />
                <div className="flex items-center gap-0.5">
                  <button className="p-1.5 rounded hover:bg-muted transition-colors" title="加粗"><Bold className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button className="p-1.5 rounded hover:bg-muted transition-colors" title="斜体"><Italic className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button className="p-1.5 rounded hover:bg-muted transition-colors" title="下划线"><Underline className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button className="p-1.5 rounded hover:bg-muted transition-colors" title="删除线"><Strikethrough className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </div>
                <div className="w-px h-4 bg-border mx-1.5" />
                <div className="flex items-center gap-0.5">
                  <button className="p-1.5 rounded hover:bg-muted transition-colors bg-muted" title="左对齐"><AlignLeft className="h-3.5 w-3.5 text-foreground" /></button>
                  <button className="p-1.5 rounded hover:bg-muted transition-colors" title="居中"><AlignCenter className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button className="p-1.5 rounded hover:bg-muted transition-colors" title="右对齐"><AlignRight className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </div>
                <div className="w-px h-4 bg-border mx-1.5" />
                <div className="flex items-center gap-0.5">
                  <button className="p-1.5 rounded hover:bg-muted transition-colors" title="无序列表"><List className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button className="p-1.5 rounded hover:bg-muted transition-colors" title="有序列表"><ListOrdered className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </div>
                <div className="w-px h-4 bg-border mx-1.5" />
                <button
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                    isPolishing
                      ? "bg-primary/10 text-primary cursor-not-allowed"
                      : polishDone
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gradient-to-r from-violet-500 to-primary text-white hover:opacity-90 shadow-sm"
                  }`}
                  title="AI全文润色"
                  disabled={isPolishing || !isComplete}
                  onClick={() => {
                    if (polishDone) { setPolishDone(false); return; }
                    setIsPolishing(true);
                    setTimeout(() => { setIsPolishing(false); setPolishDone(true); }, 2200);
                  }}
                >
                  {isPolishing
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />润色中…</>
                    : polishDone
                    ? <><Check className="h-3.5 w-3.5" />润色完成</>
                    : <><Wand2 className="h-3.5 w-3.5" />AI全文润色</>}
                </button>
              </div>

              <div
                className="px-12 py-8 overflow-y-auto flex-1"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("[data-para-menu]")) return;
                  setParaMenuIdx(null);
                }}
              >
                <p className="font-semibold text-lg mb-6 text-foreground text-center">{policyTitle}</p>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">正在根据检索与大纲生成政策全文...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive">
                    <p className="text-sm">正文生成失败：{error}</p>
                  </div>
                ) : (
                  <>
                {/* 段落逐行渲染，完成後支援 hover 互動 */}
                <div className="text-sm text-foreground leading-[1.8] space-y-1 pr-4">
                  {isComplete ? (
                    displayedText.split("\n").map((line, idx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={idx} className="h-2" />;
                      const isActive = activeParagraph === idx;
                      const isMenuOpen = paraMenuIdx === idx;
                      return (
                        <div
                          key={idx}
                          className="group relative flex items-start gap-2"
                          onMouseEnter={() => setActiveParagraph(idx)}
                          onMouseLeave={() => { if (paraMenuIdx !== idx) setActiveParagraph(null); }}
                        >
                          {/* 左側 AI 圖標 */}
                          <button
                            className={`shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-all ${
                              isMenuOpen
                                ? "opacity-100 bg-primary text-white shadow"
                                : "opacity-0 group-hover:opacity-100 bg-primary/10 text-primary hover:bg-primary hover:text-white"
                            }`}
                            title="AI 操作"
                            onClick={(e) => {
                              e.stopPropagation();
                              setParaMenuIdx(isMenuOpen ? null : idx);
                              setActiveParagraph(idx);
                              setParaActionResult(null);
                            }}
                          >
                            <Sparkles className="h-3 w-3" />
                          </button>

                          {/* 段落文字 */}
                          <div
                            className={`flex-1 rounded px-1 -mx-1 transition-colors ${
                              isActive || isMenuOpen ? "bg-primary/5" : ""
                            }`}
                          >
                            {renderHighlightedText(line)}
                          </div>

                          {/* 操作選單 */}
                          {isMenuOpen && (
                            <div
                              data-para-menu
                              className="absolute left-6 top-6 z-50 bg-card border border-border rounded-xl shadow-lg p-2 w-56"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="text-[10px] text-muted-foreground px-2 pb-1.5 font-medium">AI 段落操作</p>
                              {PARA_ACTIONS.map((action) => {
                                const Icon = action.icon;
                                const isLoading = paraActionLoading && paraActionResult?.action === action.id && paraActionResult.idx === idx;
                                return (
                                  <button
                                    key={action.id}
                                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left"
                                    onClick={() => {
                                      setParaActionLoading(true);
                                      setParaActionResult({ idx, action: action.id, text: "" });
                                      setTimeout(() => {
                                        const resultMap: Record<string, string> = {
                                          accompany: "（AI伴写）本条款可进一步明确适用范围，建议补充：符合条件的企业须在本市注册登记满一年，且近三年无重大违规记录...",
                                          expand: "（扩写）为确保政策精准落地，本条款在执行过程中应注意以下几点：一是明确申报主体资格；二是规范资金拨付流程；三是建立绩效评估机制...",
                                          polish: "（润色）本条款经优化后表述更为规范：依据相关法律法规，对符合条件的市场主体给予相应支持，具体标准由主管部门另行制定。",
                                          calculate: "（资金测算）预计覆盖企业：约 1,200 家；年度资金需求：约 3,600 万元；人均补贴：约 3 万元/企业。",
                                          reserve: "✓ 已成功加入条款储备库",
                                        };
                                        setParaActionResult({ idx, action: action.id, text: resultMap[action.id] ?? "操作完成" });
                                        setParaActionLoading(false);
                                      }, 1200);
                                    }}
                                  >
                                    {isLoading
                                      ? <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                                      : <Icon className="h-3.5 w-3.5 text-primary shrink-0" />}
                                    <div>
                                      <p className="text-xs font-medium text-foreground">{action.label}</p>
                                      <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                                    </div>
                                  </button>
                                );
                              })}
                              {/* 操作結果展示 */}
                              {paraActionResult && paraActionResult.idx === idx && paraActionResult.text && !paraActionLoading && (
                                <div className="mt-2 mx-1 p-2 bg-primary/5 rounded-lg border border-primary/20">
                                  <p className="text-[11px] text-foreground leading-relaxed">{paraActionResult.text}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="whitespace-pre-line">
                      {displayedText}<span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom" />
                    </div>
                  )}
                </div>

                {isComplete && (
                  <>
                    {reviewIssues.length > 0 && (
                      <div className="flex items-center gap-3 mt-6 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="inline-block w-3 h-3 rounded bg-red-200/70 border border-red-300" />
                          <span className="text-red-600 dark:text-red-400">敏感词</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="inline-block w-3 h-3 rounded bg-amber-200/70 border border-amber-300" />
                          <span className="text-amber-600 dark:text-amber-400">不当用词</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">（将鼠标悬停到高亮词查看说明）</span>
                      </div>
                    )}

                    {/* 參考文獻列表 */}
                    {citations.length > 0 && (
                      <div className="mt-8 pt-5 border-t border-border/60">
                        <p className="text-xs font-semibold text-foreground mb-2.5">参考文献</p>
                        <ol className="space-y-1.5 list-none">
                          {citations.map((cite) => (
                            <li key={cite.index} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center justify-center min-w-[1.3em] h-[1.3em] text-[10px] font-bold bg-primary/10 text-primary rounded border border-primary/20 shrink-0 mt-0.5">
                                {cite.index}
                              </span>
                              <span className="leading-relaxed">
                                {cite.title}
                                {cite.source && <span className="text-muted-foreground/70 ml-1">[{cite.source}]</span>}
                                {cite.url && (
                                  <a
                                    href={cite.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 ml-1.5 text-primary hover:underline"
                                  >
                                    查看原文
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                )}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <p className="text-muted-foreground italic mt-6 text-xs text-center">
                      （AI 生成内容仅供参考，请根据实际情况修改完善）
                    </p>
                  </>
                )}
                  </>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Right side panel */}
        <AnimatePresence>
          {activePanel && activePanel !== "calculate" && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 360 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 overflow-hidden min-h-0"
            >
              <div className="w-[360px] bg-card rounded-xl border border-border h-full flex flex-col min-h-0">
                {activePanel === "outline" && (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* 頭部：固定不滾動 */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                      <h3 className="text-sm font-semibold text-foreground">提纲编辑</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">点击可编辑</span>
                        <button
                          onClick={handleRegenerateOutline}
                          disabled={isOutlineRegenerating}
                          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                          {isOutlineRegenerating
                            ? <><Loader2 className="h-3 w-3 animate-spin" />生成中…</>
                            : <><RefreshCw className="h-3 w-3" />重新生成</>}
                        </button>
                      </div>
                    </div>

                    {/* 可滾動的大綱內容 */}
                    <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
                      <div className="text-xs space-y-2">
                        {editableOutline.map((section) => (
                          <div key={section.id} className="rounded-lg border border-border overflow-hidden">
                            {/* 一級章標題 */}
                            <div
                              className="flex items-center gap-1.5 px-2.5 py-2 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
                              onClick={() => setExpandedChapters(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                            >
                              {expandedChapters[section.id]
                                ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                                : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                              <OutlineInlineEditor
                                value={section.title}
                                onSave={(v) => updateChapterTitle(section.id, v)}
                                className="font-semibold text-foreground text-xs"
                              />
                            </div>

                            {/* 二級節 */}
                            {expandedChapters[section.id] && (
                              <div className="divide-y divide-border/50">
                                {section.subSections?.map((sub) => {
                                  const refKey = `${section.id}-${sub.id}`;
                                  return (
                                    <div key={sub.id} className="px-3 py-2 space-y-1.5">
                                      {/* 節標題 */}
                                      <OutlineInlineEditor
                                        value={sub.title}
                                        onSave={(v) => updateSubTitle(section.id, sub.id, v)}
                                        className="font-medium text-foreground text-[11px] w-full"
                                      />
                                      {/* 要點列表 */}
                                      <ul className="space-y-0.5 pl-2">
                                        {sub.keyPoints?.map((pt, pi) => (
                                          <li key={pi} className="flex items-center gap-1 group/kp">
                                            <span className="text-primary shrink-0 text-[10px]">•</span>
                                            <OutlineInlineEditor
                                              value={pt}
                                              onSave={(v) => updateKeyPoint(section.id, sub.id, pi, v)}
                                              className="text-muted-foreground text-[11px] flex-1"
                                            />
                                            <button
                                              onClick={() => removeKeyPoint(section.id, sub.id, pi)}
                                              className="opacity-0 group-hover/kp:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                                            >
                                              <X className="h-2.5 w-2.5" />
                                            </button>
                                          </li>
                                        ))}
                                      </ul>
                                      <button
                                        onClick={() => addKeyPoint(section.id, sub.id)}
                                        className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-primary transition-colors pl-2"
                                      >
                                        <Plus className="h-3 w-3" />添加要点
                                      </button>

                                      {/* 參考文檔標籤列表（ref 是物件，顯示 title 欄位） */}
                                      {(sub.referencePolicies?.length ?? 0) > 0 && (
                                        <div className="flex flex-wrap gap-1 pl-2 pt-0.5">
                                          {sub.referencePolicies.map((ref, ri) => {
                                            const label = typeof ref === "string" ? ref : ref.title;
                                            return (
                                              <span key={ri} className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5">
                                                <FileText className="h-2.5 w-2.5 shrink-0" />
                                                {label}
                                                <button
                                                  onClick={() => removeRefFromSub(section.id, sub.id, ri)}
                                                  className="hover:text-destructive transition-colors ml-0.5"
                                                >
                                                  <X className="h-2.5 w-2.5" />
                                                </button>
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* 新增參考文檔 */}
                                      {showRefInput[refKey] ? (
                                        <div className="flex items-center gap-1 pl-2">
                                          <input
                                            autoFocus
                                            value={refInputVal[refKey] ?? ""}
                                            onChange={e => setRefInputVal(prev => ({ ...prev, [refKey]: e.target.value }))}
                                            onKeyDown={e => {
                                              if (e.key === "Enter") addRefToSub(section.id, sub.id, refInputVal[refKey] ?? "");
                                              if (e.key === "Escape") setShowRefInput(prev => ({ ...prev, [refKey]: false }));
                                            }}
                                            placeholder="输入参考文档名称…"
                                            className="flex-1 text-[11px] border border-border rounded px-2 py-0.5 bg-background outline-none focus:border-primary"
                                          />
                                          <button
                                            onClick={() => addRefToSub(section.id, sub.id, refInputVal[refKey] ?? "")}
                                            className="text-primary hover:text-primary/80"
                                          >
                                            <Check className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() => setShowRefInput(prev => ({ ...prev, [refKey]: false }))}
                                            className="text-muted-foreground hover:text-foreground"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setShowRefInput(prev => ({ ...prev, [refKey]: true }))}
                                          className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-primary transition-colors pl-2"
                                        >
                                          <Plus className="h-3 w-3" />添加参考文档
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                                {/* 新增節 */}
                                <button
                                  onClick={() => addSubSection(section.id)}
                                  className="flex items-center gap-1 w-full px-3 py-1.5 text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors border-t border-dashed border-border"
                                >
                                  <Plus className="h-3 w-3" />添加节
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activePanel === "clause" && (
                  <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                    <ClauseGeneratorPanel policyTitle={policyTitle} />
                  </div>
                )}
                {activePanel === "review" && (
                  <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                    <ReviewPanel
                      content={displayedText}
                      onReviewComplete={setReviewIssues}
                    />
                  </div>
                )}
                {activePanel === "evaluate" && (
                  <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                    <EvaluationPanel content={displayedText} policyTitle={policyTitle} />
                  </div>
                )}
                {activePanel !== "mindmap" && activePanel !== "outline" && activePanel !== "reference" && activePanel !== "clause" && activePanel !== "review" && activePanel !== "evaluate" && (
                  <div className="p-4 flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
                    <p className="text-sm">功能开发中...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
