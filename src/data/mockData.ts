// 模拟数据

export const overviewStats = {
  totalPolicies: 128,
  totalFunds: 25.6, // 亿元
  totalEnterprises: 3842,
  totalItems: 567,
};

export const policyReports = [
  { id: "1", title: "2024年第四季度政策兑现专报", createdAt: "2024-12-15", status: "已完成", chartType: "bar" as const },
  { id: "2", title: "2024年第三季度政策兑现专报", createdAt: "2024-09-20", status: "已完成", chartType: "pie" as const },
  { id: "3", title: "2024年上半年度政策兑现专报", createdAt: "2024-07-10", status: "已完成", chartType: "line" as const },
  { id: "4", title: "2024年科技创新政策专项报告", createdAt: "2024-06-05", status: "已完成", chartType: "bar" as const },
  { id: "5", title: "2024年中小企业扶持政策专报", createdAt: "2024-05-18", status: "生成中", chartType: "pie" as const },
  { id: "6", title: "2024年产业升级政策兑现报告", createdAt: "2024-04-22", status: "已完成", chartType: "line" as const },
];

export const reportDetail = {
  id: "1",
  title: "2024年第四季度政策兑现专报",
  summary: "本季度共涉及政策兑现事项156项，兑现资金总额达8.2亿元，惠及企业1,256家。整体兑现率为89.7%，较上季度提升3.2个百分点。科技创新类政策兑现率最高，达95.3%；产业升级类次之，为91.2%。",
  overallAssessment: "本季度政策兑现工作整体推进顺利，兑现效率持续提升。重点领域政策覆盖面广，资金使用效率较高。建议进一步优化审批流程，缩短兑现周期。",
  dimensions: {
    situation: { score: 89.7, trend: "up" as const, description: "整体兑现态势良好，兑现率持续攀升" },
    items: [
      { category: "科技创新", count: 45, percentage: 28.8 },
      { category: "产业升级", count: 38, percentage: 24.4 },
      { category: "人才引进", count: 28, percentage: 17.9 },
      { category: "绿色发展", count: 22, percentage: 14.1 },
      { category: "数字经济", count: 15, percentage: 9.6 },
      { category: "其他", count: 8, percentage: 5.1 },
    ],
    funds: [
      { category: "科技创新", amount: 2.8, percentage: 34.1 },
      { category: "产业升级", amount: 2.1, percentage: 25.6 },
      { category: "人才引进", amount: 1.5, percentage: 18.3 },
      { category: "绿色发展", amount: 1.0, percentage: 12.2 },
      { category: "数字经济", amount: 0.8, percentage: 9.8 },
    ],
    enterprises: [
      { type: "大型企业", count: 156, percentage: 12.4 },
      { type: "中型企业", count: 389, percentage: 31.0 },
      { type: "小型企业", count: 512, percentage: 40.8 },
      { type: "微型企业", count: 199, percentage: 15.8 },
    ],
  },
};

export const dashboardData = {
  // 政策发布情况 tab
  departmentStats: [
    { name: "商务金融局", published: 62, items: 7 },
    { name: "北京经济技术开...", published: 16, items: 5 },
    { name: "北京市高级别自...", published: 0, items: 5 },
    { name: "北京市集成电路...", published: 8, items: 0 },
    { name: "信息技术产业局", published: 12, items: 8 },
    { name: "人力资源和社会...", published: 31, items: 8 },
    { name: "城市运行局", published: 1, items: 0 },
    { name: "工委宣传文化部", published: 12, items: 3 },
    { name: "工委组织人事部", published: 24, items: 2 },
    { name: "开发建设局", published: 2, items: 6 },
    { name: "机器人和智能制...", published: 7, items: 2 },
    { name: "生态环境建设局", published: 3, items: 24 },
    { name: "生物技术和大健...", published: 21, items: 4 },
    { name: "社会事业局", published: 11, items: 4 },
    { name: "科技和产业促进...", published: 53, items: 11 },
    { name: "经济发展局", published: 28, items: 13 },
    { name: "营商环境建设局", published: 14, items: 3 },
    { name: "财政国资局", published: 14, items: 3 },
    { name: "高端汽车和新能...", published: 14, items: 3 },
  ],
  policyPublished: 278,
  policyInterpreted: 188,
  itemsPublished: 316,
  policyByLevel: [
    { level: "国家", count: 67 },
    { level: "北京市", count: 127 },
    { level: "经开区", count: 84 },
  ],
  itemFlow: {
    applying: 0,
    expired: 316,
    confirmed: 5,
    redeemed: 188,
  },

  // 政策兑现情况 tab
  redeemedItems: {
    total: 567,
    byType: [
      { name: "资金类", value: 45 },
      { name: "非资金类", value: 30 },
      { name: "预兑现", value: 15 },
      { name: "未知", value: 10 },
    ],
    byStatus: [
      { name: "标准兑现", value: 62 },
      { name: "预兑现", value: 18 },
      { name: "免申即享", value: 20 },
    ],
    yearlyTrend: [
      { year: "2021", value: 5 },
      { year: "2022", value: 8 },
      { year: "2023", value: 25 },
      { year: "2024", value: 135 },
      { year: "2025", value: 12 },
      { year: "2026", value: 0 },
    ],
    byField: [
      { name: "科技创新", value: 35 },
      { name: "产业升级", value: 28 },
      { name: "人才引进", value: 18 },
      { name: "绿色发展", value: 12 },
      { name: "数字经济", value: 7 },
    ],
  },
  redeemedFunds: {
    totalMonthly: 853494.22,
    byDepartment: [
      { name: "工委宣传文化部", amount: 10819.81 },
      { name: "商务金融局", amount: 232967.63 },
      { name: "北京市高级别自...", amount: 6782.28 },
      { name: "北京市集成电路...", amount: 81159.55 },
      { name: "信息技术产业局", amount: 10562.19 },
      { name: "人力资源和社会...", amount: 3014.48 },
      { name: "None", amount: 3966.89 },
    ],
    byStatus: [
      { name: "标准兑现", value: 55 },
      { name: "预兑现", value: 25 },
      { name: "未知", value: 20 },
    ],
    yearlyTrend: [
      { year: "2021", value: 0 },
      { year: "2022", value: 0 },
      { year: "2023", value: 50000 },
      { year: "2024", value: 720000 },
      { year: "2025", value: 10000 },
      { year: "2026", value: 0 },
    ],
    byField: [
      { name: "科技创新", value: 40 },
      { name: "产业升级", value: 25 },
      { name: "人才引进", value: 15 },
      { name: "绿色发展", value: 12 },
      { name: "数字经济", value: 8 },
    ],
  },
  supportedEnterprises: {
    total: 3299,
    byScale: [
      { name: "5-大企业", value: 15 },
      { name: "1-个体工户", value: 8 },
      { name: "3-小型企业", value: 35 },
      { name: "6-其他", value: 12 },
    ],
    byIndustry: [
      { name: "生物医药和大健康领域", value: 22 },
      { name: "新一代信息技术领域", value: 28 },
      { name: "其他", value: 50 },
    ],
    yearlyTrend: [
      { year: "2021", value: 50 },
      { year: "2022", value: 80 },
      { year: "2023", value: 350 },
      { year: "2024", value: 3200 },
      { year: "2025", value: 120 },
      { year: "2026", value: 0 },
    ],
    yearlyCount: [
      { year: "2021", value: 50 },
      { year: "2022", value: 80 },
      { year: "2023", value: 350 },
      { year: "2024", value: 3200 },
      { year: "2025", value: 120 },
      { year: "2026", value: 0 },
    ],
    capitalDistribution: [
      { name: "注册资本<100万", value: 15 },
      { name: "100万-500万", value: 30 },
      { name: "500万-1000万", value: 25 },
      { name: ">1000万", value: 30 },
    ],
  },
};

export const evaluationItems = [
  { id: "1", name: "高新技术企业培育奖励", department: "科技局", enterpriseCount: 86, deadline: "2024-12-31", status: "评优中" },
  { id: "2", name: "技术改造投资补贴", department: "经信局", enterpriseCount: 124, deadline: "2024-12-25", status: "待评优" },
  { id: "3", name: "研发投入奖励", department: "科技局", enterpriseCount: 67, deadline: "2024-12-20", status: "已完成" },
  { id: "4", name: "数字化转型示范企业", department: "经信局", enterpriseCount: 45, deadline: "2024-12-15", status: "已完成" },
  { id: "5", name: "绿色工厂认定奖励", department: "发改委", enterpriseCount: 32, deadline: "2025-01-15", status: "待评优" },
  { id: "6", name: "创新创业大赛获奖企业扶持", department: "科技局", enterpriseCount: 28, deadline: "2025-01-10", status: "待评优" },
];

export const evaluationDetail = {
  id: "1",
  name: "高新技术企业培育奖励",
  department: "科技局",
  conditions: [
    "企业注册地在北京经济技术开发区",
    "已获得高新技术企业认定",
    "上年度研发投入占营收比例不低于5%",
    "近三年无重大违法违规记录",
  ],
  scoringCriteria: [
    { label: "研发投入占比", weight: 30, description: "企业研发投入占营业收入比例" },
    { label: "知识产权数量", weight: 25, description: "发明专利、实用新型专利等" },
    { label: "营收增长率", weight: 20, description: "近两年营业收入平均增长率" },
    { label: "人才结构", weight: 15, description: "研发人员占比及学历结构" },
    { label: "社会贡献", weight: 10, description: "纳税额、就业人数等" },
  ],
  enterprises: [
    { id: "e1", name: "北京智创科技有限公司", score: 92.5, rdRatio: 12.3, patents: 45, revenueGrowth: 35.2, status: "推荐" },
    { id: "e2", name: "中科云数据技术公司", score: 88.7, rdRatio: 10.8, patents: 38, revenueGrowth: 28.5, status: "推荐" },
    { id: "e3", name: "京东方创新研究院", score: 85.3, rdRatio: 15.2, patents: 62, revenueGrowth: 18.7, status: "推荐" },
    { id: "e4", name: "华信智能制造有限公司", score: 82.1, rdRatio: 8.5, patents: 28, revenueGrowth: 22.3, status: "待定" },
    { id: "e5", name: "博瑞生物医药股份公司", score: 79.6, rdRatio: 18.5, patents: 55, revenueGrowth: 12.8, status: "待定" },
    { id: "e6", name: "天宇新能源科技公司", score: 76.4, rdRatio: 7.2, patents: 22, revenueGrowth: 30.1, status: "待定" },
    { id: "e7", name: "腾飞航空零部件公司", score: 73.8, rdRatio: 6.8, patents: 18, revenueGrowth: 15.6, status: "不推荐" },
    { id: "e8", name: "绿源环保材料有限公司", score: 70.2, rdRatio: 5.5, patents: 12, revenueGrowth: 8.9, status: "不推荐" },
  ],
};
