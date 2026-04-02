export interface PolicyItem {
  id: string;
  title: string;
  department: string;
  publishDate: string;
  startDate: string;
  endDate: string;
  type: "补贴" | "奖励" | "减免" | "服务" | "融资";
  totalPushed: number;
  summary: string;
}

export interface PushedCompany {
  id: string;
  policyId: string;
  name: string;
  registrationNo: string;
  industry: string;
  size: "大型" | "中型" | "小型" | "微型";
  establishedYear: number;
  contact: string;
  matchPoints: string[];
  pushReason: string;
  pushTime: string;
  status: "已触达" | "已申报" | "未响应";
}

export const DEPARTMENTS = [
  "发展和改革委员会",
  "科学技术局",
  "工业和信息化局",
  "财政局",
  "人力资源和社会保障局",
  "商务局",
  "市场监督管理局",
  "生态环境局",
];

export const POLICY_ITEMS: PolicyItem[] = [
  {
    id: "pi001",
    title: "2024年度高新技术企业认定奖励申报",
    department: "科学技术局",
    publishDate: "2024-11-15",
    startDate: "2024-12-01",
    endDate: "2025-01-31",
    type: "奖励",
    totalPushed: 142,
    summary: "对当年新认定的高新技术企业给予一次性奖励20万元，连续认定的给予10万元奖励",
  },
  {
    id: "pi002",
    title: "企业研发费用补贴（第三批）",
    department: "发展和改革委员会",
    publishDate: "2024-11-08",
    startDate: "2024-11-20",
    endDate: "2025-02-28",
    type: "补贴",
    totalPushed: 89,
    summary: "对年度研发投入超过上年50%的企业，按超出部分的20%给予补贴，最高200万元",
  },
  {
    id: "pi003",
    title: "绿色低碳转型企业专项资金申报",
    department: "生态环境局",
    publishDate: "2024-10-28",
    startDate: "2024-11-10",
    endDate: "2025-01-15",
    type: "补贴",
    totalPushed: 63,
    summary: "支持企业开展清洁生产和碳排放减少项目，对通过验收的项目按投资额的15%给予补贴",
  },
  {
    id: "pi004",
    title: "人才引进安家补贴（第四季度）",
    department: "人力资源和社会保障局",
    publishDate: "2024-10-15",
    startDate: "2024-10-25",
    endDate: "2025-03-31",
    type: "补贴",
    totalPushed: 217,
    summary: "对新引进的博士及以上学历人才给予每月3000元生活补贴，硕士给予每月1500元，期限3年",
  },
  {
    id: "pi005",
    title: "小微企业增值税减免优惠申请",
    department: "财政局",
    publishDate: "2024-10-01",
    startDate: "2024-10-01",
    endDate: "2025-09-30",
    type: "减免",
    totalPushed: 534,
    summary: "月销售额10万元以下的小微企业可享受增值税减免，符合条件的企业无需申报自动享受",
  },
  {
    id: "pi006",
    title: "数字化转型专项奖励",
    department: "工业和信息化局",
    publishDate: "2024-09-20",
    startDate: "2024-10-08",
    endDate: "2025-01-31",
    type: "奖励",
    totalPushed: 78,
    summary: "对完成数字化转型改造并通过专家评审的企业，按改造投入的20%给予奖励，最高100万元",
  },
];

const matchPointsPool: Record<string, string[][]> = {
  pi001: [
    ["已于2024年9月通过高新技术企业认定", "主营业务为人工智能软件开发，符合支持领域", "近三年研发投入占比达12.3%"],
    ["2024年10月完成高新技术企业首次认定", "拥有发明专利8项、实用新型专利15项", "科技人员占比超过35%"],
  ],
  pi002: [
    ["2024年研发投入较上年增长68%，超过50%门槛", "研发费用凭证齐全，可加计扣除", "在区内纳税正常，信用良好"],
    ["研发支出同比增长82%", "已建立独立核算的研发账目", "与3所高校开展产学研合作"],
  ],
  pi003: [
    ["已完成清洁生产审核并取得证书", "碳排放强度较上年降低18%", "完成节能改造投资320万元"],
  ],
  pi004: [
    ["2024年Q3新引进博士2人、硕士5人", "引进人才均在区内实际就业", "人才落户已在区内完成"],
  ],
};

const pushReasons: Record<string, string[]> = {
  pi001: [
    "企业已完成高新技术企业认定流程，认定证书在有效期内，符合本事项奖励申报资格",
    "系统检测到该企业于本年度完成高新技术企业首次认定，自动触发推送",
  ],
  pi002: [
    "企业申报的研发费用加计扣除数据显示，本年度研发投入增幅超过50%触发阈值",
    "财务数据比对显示研发支出大幅增长，系统自动识别为潜在受益企业",
  ],
  pi003: [
    "企业已完成清洁生产改造项目验收，节能量和减排量均达到补贴申报标准",
  ],
  pi004: [
    "社保数据显示企业本季度新增博士及硕士学历员工，符合人才引进补贴申报标准",
  ],
};

function genCompanies(policyId: string, count: number): PushedCompany[] {
  const pools = {
    names: [
      "北京智芯科技有限公司",
      "海淀区星辰人工智能有限公司",
      "北京绿能新材料股份有限公司",
      "宏远数字科技（北京）有限公司",
      "北京鑫桥精密仪器有限公司",
      "天工云计算北京有限公司",
      "北京远景生物医药技术有限公司",
      "创新合众半导体（北京）有限公司",
    ],
    industries: ["人工智能", "新能源", "生物医药", "半导体", "智能制造", "数字经济", "绿色低碳", "新材料"],
    sizes: ["大型", "中型", "小型", "微型"] as const,
    statuses: ["已触达", "已申报", "未响应"] as const,
  };

  const points = matchPointsPool[policyId] || [["在区内注册并正常经营满一年", "企业信用状况良好，无重大违规记录", "符合本事项申报行业范围"]];
  const reasons = pushReasons[policyId] || ["企业经营数据匹配本事项申报条件，系统自动识别并推送"];

  return Array.from({ length: count }, (_, index) => ({
    id: `${policyId}-c${index + 1}`,
    policyId,
    name: pools.names[index % pools.names.length],
    registrationNo: `91110${100000 + index * 37}X`,
    industry: pools.industries[index % pools.industries.length],
    size: pools.sizes[index % pools.sizes.length],
    establishedYear: 2008 + (index % 14),
    contact: `张${["伟", "芳", "敏", "超", "磊"][index % 5]}`,
    matchPoints: points[index % points.length],
    pushReason: reasons[index % reasons.length],
    pushTime: `2024-${String(10 + (index % 3)).padStart(2, "0")}-${String(1 + (index * 7) % 28).padStart(2, "0")} ${String(8 + (index % 10)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}`,
    status: pools.statuses[index % pools.statuses.length],
  }));
}

export const PUSHED_COMPANIES: PushedCompany[] = [
  ...genCompanies("pi001", 12),
  ...genCompanies("pi002", 8),
  ...genCompanies("pi003", 7),
  ...genCompanies("pi004", 10),
  ...genCompanies("pi005", 14),
  ...genCompanies("pi006", 9),
];
