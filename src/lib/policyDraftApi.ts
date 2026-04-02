import type { PolicyItem } from "@/components/policy-drafting/drafting/PolicySearchStep";
import type { ClauseComparison } from "@/components/policy-drafting/drafting/PolicyAnalysisStep";
import type { OutlineSection, OutlineSubSection } from "@/components/policy-drafting/drafting/OutlineGenerationStep";

export type { OutlineSubSection };

export interface Citation {
  index: number;
  title: string;
  url: string;
  source?: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const levelSources: Record<PolicyItem["level"], string> = {
  national: "国家发展改革委",
  beijing: "北京市人民政府",
  other: "先进地区参考",
};

function slug(input: string) {
  return input
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export async function searchPolicies(policyTitle: string, coreElements?: string): Promise<{ policies: PolicyItem[]; total: number }> {
  await delay(900);
  const keyword = policyTitle.replace(/^关于|若干政策措施$|政策措施$/g, "").slice(0, 12) || "产业发展";
  const policies: PolicyItem[] = [
    {
      id: "national-1",
      title: `国家层面关于支持${keyword}高质量发展的指导意见`,
      url: `https://example.com/policies/${slug(keyword)}-national-1`,
      selected: true,
      level: "national",
      source: levelSources.national,
    },
    {
      id: "national-2",
      title: `关于促进${keyword}技术创新与成果转化的实施方案`,
      url: `https://example.com/policies/${slug(keyword)}-national-2`,
      selected: true,
      level: "national",
      source: "工业和信息化部",
    },
    {
      id: "beijing-1",
      title: `北京市关于加快${keyword}产业布局的若干措施`,
      url: `https://example.com/policies/${slug(keyword)}-beijing-1`,
      selected: true,
      level: "beijing",
      source: levelSources.beijing,
    },
    {
      id: "beijing-2",
      title: `北京市支持${keyword}企业创新发展的专项政策`,
      url: `https://example.com/policies/${slug(keyword)}-beijing-2`,
      selected: true,
      level: "beijing",
      source: "北京市经济和信息化局",
    },
    {
      id: "other-1",
      title: `先进地区${keyword}产业扶持政策对比样本`,
      url: `https://example.com/policies/${slug(keyword)}-other-1`,
      selected: true,
      level: "other",
      source: levelSources.other,
    },
    {
      id: "other-2",
      title: `${keyword}重点企业培育与招商支持政策`,
      url: `https://example.com/policies/${slug(keyword)}-other-2`,
      selected: true,
      level: "other",
      source: "示范园区政策库",
    },
  ];

  if (coreElements?.trim()) {
    policies.push({
      id: "beijing-3",
      title: `北京市围绕核心要素完善${keyword}政策体系的实施意见`,
      url: `https://example.com/policies/${slug(keyword)}-beijing-3`,
      selected: true,
      level: "beijing",
      source: "北京市政策研究室",
    });
  }

  return { policies, total: policies.length };
}

export async function analyzePolicies(selectedPolicies: PolicyItem[]): Promise<{ analysis: ClauseComparison[]; summary: string[] }> {
  await delay(1100);
  const activePolicies = selectedPolicies.filter((policy) => policy.selected);
  const analysis: ClauseComparison[] = activePolicies.map((policy, index) => ({
    id: policy.id,
    policyTitle: policy.title,
    source: policy.source || levelSources[policy.level],
    targetAudience: index % 2 === 0 ? "高新技术企业、专精特新企业" : "重点产业链企业、创新平台主体",
    supportMethod: index % 3 === 0 ? "项目补贴 + 研发奖励" : index % 3 === 1 ? "贷款贴息 + 场景开放" : "人才奖励 + 平台建设支持",
    supportLevel: index % 2 === 0 ? "最高500万元，按项目分档支持" : "按认定等级分层奖励，最高1000万元",
    highlights: [
      { field: index % 2 === 0 ? "supportLevel" : "supportMethod", type: "high" },
      { field: "targetAudience", type: index % 2 === 0 ? "medium" : "unique" },
    ],
  }));

  const summary = [
    "参考政策普遍聚焦高新技术企业、专精特新企业和重点产业链主体。",
    "资金补贴、研发奖励与平台建设支持是最常见的扶持方式。",
    "先进地区在场景开放、贷款贴息和人才配套方面形成了差异化做法。",
    "建议在本地政策中强化分层支持标准，并补充实施细则与兑现路径。",
  ];

  return { analysis, summary };
}

function buildSubSections(policyTitle: string, coreElements: string, selectedPolicies: PolicyItem[]): OutlineSubSection[] {
  const lines = coreElements
    .split(/\n+/)
    .map((line) => line.replace(/^\d+[.、]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 5);

  const refs = selectedPolicies.filter((policy) => policy.selected).slice(0, 3);
  const fallback = ["适用对象", "支持方式", "申报机制", "保障措施", "监督评估"];
  const items = (lines.length > 0 ? lines : fallback).map((item, index) => ({
    id: `sub-${index + 1}`,
    title: `第${index + 1}条 ${item}`,
    keyPoints: [
      `围绕${item}明确政策适用边界和执行主体。`,
      `结合${policyTitle}设置分档扶持标准和兑现条件。`,
      `同步完善申报流程、监督管理和绩效反馈要求。`,
    ],
    referencePolicies: refs.map((policy, refIndex) => ({
      title: policy.title,
      clause: `参考第${refIndex + 1}条与${item}相关表述`,
    })),
  }));

  return items;
}

export async function generateOutline(params: {
  policyTitle: string;
  coreElements: string;
  selectedPolicies: PolicyItem[];
  analysisResult?: ClauseComparison[];
}): Promise<{ outline: OutlineSection[] }> {
  await delay(1200);
  const subSections = buildSubSections(params.policyTitle, params.coreElements, params.selectedPolicies);
  const outline: OutlineSection[] = [
    {
      id: "chapter-1",
      title: "第一章 总体要求",
      subSections: subSections.slice(0, 2),
    },
    {
      id: "chapter-2",
      title: "第二章 支持内容",
      subSections: subSections.slice(2, 4),
    },
    {
      id: "chapter-3",
      title: "第三章 组织实施与监督管理",
      subSections: subSections.slice(4),
    },
  ].filter((section) => section.subSections.length > 0);

  return { outline };
}

export async function generateContent(params: {
  policyTitle: string;
  coreElements: string;
  selectedPolicies: PolicyItem[];
  outline: OutlineSection[];
}): Promise<{ content: string; citations: Citation[] }> {
  await delay(1500);
  const references = params.selectedPolicies.filter((policy) => policy.selected).slice(0, 4);
  const citations: Citation[] = references.map((policy, index) => ({
    index: index + 1,
    title: policy.title,
    url: policy.url,
    source: policy.source,
  }));

  const sections = params.outline.flatMap((section) => {
    const header = `${section.title}`;
    const body = section.subSections.flatMap((subSection, index) => {
      const citation = citations[index % Math.max(citations.length, 1)];
      const citeTag = citation ? `[ref:${citation.index}]` : "";
      return [
        `${subSection.title}`,
        `${subSection.keyPoints[0]} 各责任部门应尽快细化执行口径，原则上形成年度任务清单。${citeTag}`,
        `${subSection.keyPoints[1]} 对符合条件的企业一律纳入政策服务台账，按程序组织申报与评审。${citeTag}`,
        `${subSection.keyPoints[2]} 有关部门应根据情况建立动态跟踪和绩效反馈机制。${citeTag}`,
      ];
    });
    return [header, ...body, ""];
  });

  const content = [
    params.policyTitle,
    "",
    "为深入贯彻区域高质量发展要求，进一步优化政策供给体系，结合本区实际，制定本政策。",
    "",
    ...sections,
    "第四章 附则",
    "本政策由区级主管部门负责解释，自发布之日起施行。",
  ].join("\n");

  return { content, citations };
}

export async function generateCoreElements(policyTitle: string): Promise<{ coreElements: string }> {
  await delay(700);
  return {
    coreElements: [
      `1. 围绕《${policyTitle}》明确适用对象和支持范围`,
      "2. 设定资金奖励、场景开放和平台建设等扶持方式",
      "3. 细化企业申报条件、审核机制与兑现路径",
      "4. 建立部门协同推进与年度绩效跟踪机制",
      "5. 强化监督管理、资金使用规范与动态优化调整",
    ].join("\n"),
  };
}
