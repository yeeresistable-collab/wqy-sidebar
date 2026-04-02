import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockItems = [
  { id: "1", name: '2023年"专精特新"企...', status: "申报已截止,已拨付", type: "免申即享", policy: "（失效）北京经济技...", department: "科技和产业促进局", startDate: "2024-06-26...", endDate: "2024-07-02...", redeemDate: "", confirmDate: "" },
  { id: "2", name: '2023年"国高新"企业...', status: "申报已截止,已拨付", type: "免申即享", policy: "（失效）北京经济技...", department: "科技和产业促进局", startDate: "2024-11-08...", endDate: "2024-11-14...", redeemDate: "", confirmDate: "" },
  { id: "3", name: "总部企业认定奖励", status: "申报已截止,已拨付", type: "免申即享", policy: "（失效）北京经济技...", department: "商务金融局", startDate: "2024-03-06...", endDate: "2024-03-12...", redeemDate: "", confirmDate: "" },
  { id: "4", name: "外资研发中心认定奖励", status: "申报已截止,已拨付", type: "免申即享", policy: "（失效）北京经济技...", department: "商务金融局", startDate: "2024-03-06...", endDate: "2024-03-12...", redeemDate: "", confirmDate: "" },
  { id: "5", name: "经开区促进商业领域...", status: "申报已截止,已拨付", type: "免申即享", policy: "北京经济技术开发区...", department: "商务金融局", startDate: "2024-04-22...", endDate: "2024-04-26...", redeemDate: "", confirmDate: "" },
  { id: "6", name: "2024年企业上市奖励", status: "申报已截止,已拨付", type: "免申即享", policy: "（失效）北京经济技...", department: "商务金融局", startDate: "2024-03-18...", endDate: "2024-03-22...", redeemDate: "", confirmDate: "" },
  { id: "7", name: "节能减碳技改项目", status: "申报已截止,已拨付", type: "免申即享", policy: "（失效）北京经济技...", department: "经济发展局", startDate: "2024-04-16...", endDate: "2024-04-22...", redeemDate: "", confirmDate: "" },
  { id: "8", name: "重点用能单位节能指...", status: "申报已截止,已拨付", type: "免申即享", policy: "（失效）北京经济技...", department: "经济发展局", startDate: "2024-04-16...", endDate: "2024-04-22...", redeemDate: "", confirmDate: "" },
  { id: "9", name: "空气重污染应急减排...", status: "申报已截止,已拨付", type: "免申即享", policy: "（失效）北京经济技...", department: "生态环境建设局", startDate: "2024-04-15...", endDate: "2024-04-19...", redeemDate: "", confirmDate: "" },
  { id: "10", name: "绿色制造体系称号类...", status: "申报已截止,已拨付", type: "免申即享", policy: "（失效）北京经济技...", department: "生态环境建设局", startDate: "2024-04-15...", endDate: "2024-04-19...", redeemDate: "", confirmDate: "" },
];

const departments = [
  "科技和产业促进局", "工委组织人事部", "商务金融局", "人力资源和社会保障服务中心",
  "工委宣传文化部", "经济发展局", "生态环境建设局", "财政国资局", "社会事业局", "开发建设局",
  "生物技术和大健康产业局", "北京市集成电路重大项目办公室", "信息技术产业局",
  "高端汽车和新能源产业局", "机器人和智能制造产业局", "北京市高级别自动驾驶示范区工作办公室",
  "城市运行局", "总工会",
];

const PolicyReportCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>(mockItems.map(i => i.id));
  const [selectAll, setSelectAll] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 32;
  const pageSize = 10;

  // Filter states
  const [applyStatus, setApplyStatus] = useState("不限");
  const [redeemStatus, setRedeemStatus] = useState("不限");
  const [itemType, setItemType] = useState("不限");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [isUniversal, setIsUniversal] = useState("不限");

  // Analysis dimensions
  const [itemAnalysis, setItemAnalysis] = useState(["全选", "兑现类型分布", "年份分布", "月份分布", "扶持方式分布", "主管部门分布", "支持领域分布"]);
  const [fundAnalysis, setFundAnalysis] = useState(["全选", "兑现类型分布", "年份分布", "月份分布", "主管部门分布", "支持领域分布", "行业分布"]);
  const [enterpriseAnalysis, setEnterpriseAnalysis] = useState(["全选", "兑现类型分布", "性质分布", "扶持方式分布", "主管部门分布", "支持领域分布", "行业分布", "空间分布", "注册资本分布", "企业规模分布"]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mockItems.map(i => i.id));
    }
    setSelectAll(!selectAll);
  };

  const RadioGroup = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="text-sm text-muted-foreground whitespace-nowrap">{label}：</span>
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-sm">
          <Checkbox
            checked={value === opt}
            onCheckedChange={() => onChange(opt)}
            className="rounded-full w-4 h-4"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );

  const CheckboxTagGroup = ({ label, items, selected }: { label: string; items: string[]; selected: string[] }) => (
    <div className="flex items-start gap-4">
      <span className="text-sm text-muted-foreground whitespace-nowrap mt-0.5">{label}：</span>
      <div className="flex items-center gap-3 flex-wrap">
        {items.map(item => (
          <label key={item} className="flex items-center gap-1.5 cursor-pointer text-sm">
            <Checkbox
              checked={selected.includes(item)}
              className="w-4 h-4"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Title Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-primary rounded-sm" />
          <h2 className="text-base font-semibold text-foreground">标题</h2>
        </div>
        <Input
          placeholder="请输入报告标题，需不低于5个字符，不多于80个字符"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="max-w-xl"
        />
      </div>

      {/* Analysis Dimensions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-sm" />
          <h2 className="text-base font-semibold text-foreground">分析维度</h2>
        </div>
        <div className="space-y-3">
          <CheckboxTagGroup
            label="已发布事项分析"
            items={itemAnalysis}
            selected={itemAnalysis}
          />
          <CheckboxTagGroup
            label="已拨付资金分析"
            items={fundAnalysis}
            selected={fundAnalysis}
          />
          <CheckboxTagGroup
            label="已申报企业分析"
            items={enterpriseAnalysis}
            selected={enterpriseAnalysis}
          />
        </div>
      </div>

      {/* Item Selection Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-sm" />
          <h2 className="text-base font-semibold text-foreground">事项选择</h2>
        </div>

        {/* Date Filters & Quick Generate */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">时间：</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">快速生成：</span>
              {["本 月", "上 月", "近一月", "本 年", "去 年"].map(q => (
                <Button key={q} variant="outline" size="sm" className="h-8 px-4 text-sm">
                  {q}
                </Button>
              ))}
              <Button
                variant="default"
                size="sm"
                className="h-8 px-4 text-sm gap-1"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                高级筛选
              </Button>
            </div>
          </div>

          {/* Date Range Rows */}
          {[
            { label: "开始申报日期：", condition: true },
            { label: "申报截止日期：", condition: true },
            { label: "确定扶持结算日期：", condition: true },
            { label: "兑现日期：", condition: true },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3 pl-16">
              {i > 0 && (
                <div className="flex items-center border rounded px-2 py-1 text-sm text-muted-foreground">
                  OR <ChevronDown className="w-3 h-3 ml-1" />
                </div>
              )}
              <span className="text-sm text-muted-foreground whitespace-nowrap">{row.label}</span>
              <Input placeholder="开始时间" className="w-36 h-8 text-sm" />
              <span className="text-muted-foreground">→</span>
              <Input placeholder="结束时间" className="w-36 h-8 text-sm" />
              {i > 0 && (
                <button className="text-muted-foreground hover:text-foreground text-lg leading-none">—</button>
              )}
            </div>
          ))}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-3 mb-4 border-t pt-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-foreground">事项状态：</span>
              <RadioGroup label="申报状态" options={["不限", "申报中", "申报已截止", "未开始"]} value={applyStatus} onChange={setApplyStatus} />
            </div>
            <div className="flex items-center gap-4 flex-wrap pl-[4.5rem]">
              <RadioGroup label="兑现状态" options={["不限", "已确定扶持结果", "已拨付", "兑现流程中", "未开始", "零拨付"]} value={redeemStatus} onChange={setRedeemStatus} />
            </div>
            <RadioGroup label="事项类型" options={["不限", "标准兑现", "即申即享", "免申即享", "预兑现"]} value={itemType} onChange={setItemType} />
            <div className="flex items-start gap-4">
              <span className="text-sm text-muted-foreground whitespace-nowrap mt-0.5">主管部门：</span>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <Checkbox checked={selectedDepts.length === 0} className="w-4 h-4 rounded-full" />
                  <span className="text-primary font-medium">不限</span>
                </label>
                {departments.map(d => (
                  <label key={d} className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <Checkbox checked={selectedDepts.includes(d)} className="w-4 h-4" />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">是否普惠：</span>
              {["不限", "普惠", "非普惠"].map(opt => (
                <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input type="radio" name="universal" checked={isUniversal === opt} onChange={() => setIsUniversal(opt)} className="accent-primary" />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Items Table */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <span className="text-sm text-foreground">已选事项<span className="text-primary font-bold mx-1">{selectedItems.length > 0 ? 316 : 0}</span>项</span>
        </div>
        <div className="p-4 pb-2">
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="请输入事项名/政策名称搜索" className="pl-9 h-9" />
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead className="w-10">
                  <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} className="border-primary data-[state=checked]:bg-primary" />
                </TableHead>
                <TableHead>事项名称</TableHead>
                <TableHead>事项状态</TableHead>
                <TableHead>事项类型</TableHead>
                <TableHead>关联政策</TableHead>
                <TableHead>主管部门</TableHead>
                <TableHead>开始申报日期</TableHead>
                <TableHead>申报截止日期</TableHead>
                <TableHead>兑现日期</TableHead>
                <TableHead>确认扶持结果日期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockItems.map((item, idx) => (
                <TableRow
                  key={item.id}
                  className={selectedItems.includes(item.id) ? "bg-primary/5" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="border-primary data-[state=checked]:bg-primary"
                    />
                  </TableCell>
                  <TableCell className="text-sm">{item.name}</TableCell>
                  <TableCell className="text-sm">{item.status}</TableCell>
                  <TableCell className="text-sm">{item.type}</TableCell>
                  <TableCell className="text-sm max-w-[140px] truncate">{item.policy}</TableCell>
                  <TableCell className="text-sm">{item.department}</TableCell>
                  <TableCell className="text-sm">{item.startDate}</TableCell>
                  <TableCell className="text-sm">{item.endDate}</TableCell>
                  <TableCell className="text-sm">{item.redeemDate || "-"}</TableCell>
                  <TableCell className="text-sm">{item.confirmDate || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 mt-4 pb-2">
            <Button variant="outline" size="sm" disabled className="h-8">
              &lt;
            </Button>
            {[1, 2, 3, 4, 5].map(p => (
              <Button
                key={p}
                variant={currentPage === p ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </Button>
            ))}
            <span className="text-sm text-muted-foreground">...</span>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(32)}>
              32
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              &gt;
            </Button>
            <div className="flex items-center border rounded px-2 py-1 text-sm text-muted-foreground ml-2">
              10 条/页 <ChevronDown className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <Button className="px-8" onClick={() => navigate("/policy-report/1")}>
          生成报告
        </Button>
      </div>
    </div>
  );
};

export default PolicyReportCreate;
