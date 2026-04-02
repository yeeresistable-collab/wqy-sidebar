import { POLICY_ITEMS, PUSHED_COMPANIES } from "@/data/policyReachData";
import { policyReports } from "@/data/mockData";

export type AssistantSceneKey = "writing" | "reach" | "redeem" | "evaluation";

export type AssistantScene = {
  key: AssistantSceneKey;
  label: string;
  prompt: string;
  placeholder: string;
  suggestions: { title: string; desc: string }[];
};

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantPlan = {
  reply: string;
  action?:
    | { kind: "navigate"; path: string; search?: Record<string, string>; state?: Record<string, unknown> }
    | { kind: "none" };
  source: "model" | "fallback";
};

export const fallbackCoreElements =
  "1. 政策适用范围与对象\n2. 扶持标准与补贴金额\n3. 申报条件与流程\n4. 资金来源与保障措施\n5. 监督管理与绩效评估";

const evaluationPolicies = [
  "北京经开区产业发展促进办法",
  "科技创新企业扶持专项",
  "中小企业融资支持政策",
];

export const sceneConfigs: Record<AssistantSceneKey, AssistantScene> = {
  writing: {
    key: "writing",
    label: "政策制定",
    prompt: "当前在政策制定页面。需要我帮您起草、检索政策，也可以直接问我触达、兑现或评价相关问题。",
    placeholder: "请输入任意政策问题，如起草、检索、触达、兑现或评价需求",
    suggestions: [
      { title: "起草数据产业政策", desc: "自动带入标题并生成核心要素" },
      { title: "检索人工智能政策", desc: "联动打开政策检索结果" },
      { title: "查询营商环境政策", desc: "优先查找可参考的相关政策" },
    ],
  },
  reach: {
    key: "reach",
    label: "政策触达",
    prompt: "当前在政策触达页面。需要推送什么政策，或也可以直接问我制定、兑现、评价相关问题。",
    placeholder: "请输入任意政策问题，如推送目标、企业画像、兑现或评价需求",
    suggestions: [
      { title: "推送高新技术企业认定奖励", desc: "自动定位对应事项" },
      { title: "查看北京智芯科技有限公司", desc: "自动展开企业触达详情" },
      { title: "筛选绿色低碳政策", desc: "联动事项列表搜索" },
    ],
  },
  redeem: {
    key: "redeem",
    label: "政策兑现",
    prompt: "当前在政策兑现页面。需要查看哪些兑现指标或数据维度，也可以直接问我其他政策问题。",
    placeholder: "请输入任意政策问题，如兑现指标、专报、起草或评价需求",
    suggestions: [
      { title: "查看资金兑现情况", desc: "切换到兑现资金视图" },
      { title: "看扶持企业分布", desc: "定位扶持企业相关指标" },
      { title: "查看第四季度政策兑现专报", desc: "直接打开对应专报" },
    ],
  },
  evaluation: {
    key: "evaluation",
    label: "政策评价",
    prompt: "当前在政策评价页面。需要评估哪项政策，或也可以直接问我制定、触达、兑现相关问题。",
    placeholder: "请输入任意政策问题，如评估对象、报告、起草或触达需求",
    suggestions: [
      { title: "评估北京经开区产业发展促进办法", desc: "直接生成对应评价分析" },
      { title: "查看科技创新企业扶持专项报告", desc: "快速调取评价结果" },
      { title: "生成中小企业融资支持政策评价报告", desc: "进入报告生成流程" },
    ],
  },
};

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, "").trim();

const trimIntentPrefix = (text: string, patterns: RegExp[]) => {
  let result = text.trim();
  patterns.forEach((pattern) => {
    result = result.replace(pattern, "");
  });
  return result.trim();
};

const findPolicyItem = (text: string) => {
  const n = normalize(text);
  return POLICY_ITEMS.find((item) => normalize(item.title).includes(n) || n.includes(normalize(item.title)));
};

const findCompany = (text: string) => {
  const n = normalize(text);
  return PUSHED_COMPANIES.find((item) => normalize(item.name).includes(n) || n.includes(normalize(item.name)));
};

const findReport = (text: string) => {
  const n = normalize(text);
  return policyReports.find((item) => normalize(item.title).includes(n) || n.includes(normalize(item.title)));
};

const findEvaluationPolicy = (text: string) => {
  const n = normalize(text);
  return evaluationPolicies.find((item) => normalize(item).includes(n) || n.includes(normalize(item)));
};

const searchContext = {
  writingPolicies: [
    "人工智能政策",
    "数据产业政策",
    "营商环境政策",
    "绿色低碳政策",
    "人才政策",
  ],
  reachItems: POLICY_ITEMS.map((item) => ({ id: item.id, title: item.title })),
  reachCompanies: PUSHED_COMPANIES.slice(0, 20).map((item) => ({ id: item.id, policyId: item.policyId, name: item.name })),
  reports: policyReports.map((item) => ({ id: item.id, title: item.title })),
  evaluationPolicies,
};

type IntentModule = "writing_search" | "writing_draft" | "reach" | "redeem" | "evaluation";

function detectIntentModule(text: string, scene: AssistantScene): IntentModule {
  const normalized = text.trim();
  const hasCompany = Boolean(findCompany(normalized));
  const hasReachItem = Boolean(findPolicyItem(normalized));
  const hasReport = Boolean(findReport(normalized));
  const hasEvaluationPolicy = Boolean(findEvaluationPolicy(normalized));

  if (hasCompany || hasReachItem || /推送|触达|匹配|画像|目标企业|申报企业|触达对象/.test(normalized)) {
    return "reach";
  }

  if (hasReport || /专报|兑现|拨付|资金|指标|维度|扶持企业|效果检测|评优/.test(normalized)) {
    return "redeem";
  }

  if (hasEvaluationPolicy || /评估|评价|合规|落地性|一致性|优化建议/.test(normalized)) {
    return "evaluation";
  }

  if (/起草|撰写|草拟|制定|大纲|正文|章节|核心要点|核心要素/.test(normalized)) {
    return "writing_draft";
  }

  if (/检索|查询|搜索|查找|参考|政策库/.test(normalized)) {
    return "writing_search";
  }

  if (scene.key === "reach") return "reach";
  if (scene.key === "redeem") return "redeem";
  if (scene.key === "evaluation") return "evaluation";
  return "writing_draft";
}

function buildFallbackPlan(scene: AssistantScene, rawText: string): AssistantPlan {
  const text = rawText.replace(/[？?]/g, "").replace(/请问|帮我|麻烦|想要|需要|我想|我需要|我想要/g, "").trim();
  if (!text) {
    return { reply: scene.prompt, action: { kind: "none" }, source: "fallback" };
  }

  const intentModule = detectIntentModule(text, scene);

  if (intentModule === "writing_search") {
    const keyword =
      trimIntentPrefix(text, [/^(检索|查询|搜索|查找|找一下|找找|看看)/, /相关政策$/, /政策$/]) || text;
    return {
      reply: `已为您检索“${keyword}”相关政策，左侧页面已联动展示检索结果。`,
      action: { kind: "navigate", path: "/policy-writing/search", search: { q: keyword, target: "title" } },
      source: "fallback",
    };
  }

  if (intentModule === "writing_draft") {
    const title = trimIntentPrefix(text, [/^(起草|撰写|草拟|制定|写一份|写)/, /政策文件$/, /文件$/]) || text;
    return {
      reply: `已根据“${title}”创建起草任务，并自动带入政策标题和核心要素。`,
      action: {
        kind: "navigate",
        path: "/policy-writing/drafting",
        state: {
          initialTitle: title,
          initialCoreElements: fallbackCoreElements,
          autoGenerateCoreElements: true,
        },
      },
      source: "fallback",
    };
  }

  if (intentModule === "reach") {
    const company = findCompany(text);
    if (company) {
      return {
        reply: `已为您定位企业“${company.name}”，左侧页面已自动展开对应触达详情。`,
        action: {
          kind: "navigate",
          path: "/policy-reach",
          search: { itemId: company.policyId, companyId: company.id, q: company.name },
        },
        source: "fallback",
      };
    }

    const item = findPolicyItem(text);
    if (item) {
      return {
        reply: `已为您打开“${item.title}”的触达详情，左侧页面可继续查看匹配企业。`,
        action: {
          kind: "navigate",
          path: "/policy-reach",
          search: { itemId: item.id, q: item.title },
        },
        source: "fallback",
      };
    }

    const keyword = trimIntentPrefix(text, [/^(推送|触达|查找|筛选|查看)/, /相关企业$/, /相关政策$/]) || text;
    return {
      reply: `已按“${keyword}”筛选触达事项，左侧列表已同步更新。`,
      action: { kind: "navigate", path: "/policy-reach", search: { q: keyword } },
      source: "fallback",
    };
  }

  if (intentModule === "redeem") {
    const report = findReport(text);
    if (report) {
      return {
        reply: `已为您打开“${report.title}”，左侧页面正在展示对应专报。`,
        action: { kind: "navigate", path: `/policy-report/${report.id}` },
        source: "fallback",
      };
    }

    if (/专报|报告/.test(text)) {
      return {
        reply: "已为您打开兑现专报页面，左侧可继续查看和生成专报。",
        action: { kind: "navigate", path: "/policy-report" },
        source: "fallback",
      };
    }

    if (/评优|企业名单|企业排序/.test(text)) {
      return {
        reply: "已为您打开企业智能评优页面，左侧可查看企业评优结果。",
        action: { kind: "navigate", path: "/enterprise-evaluation" },
        source: "fallback",
      };
    }

    const focus = /发布/.test(text)
      ? "publish"
      : /资金|金额|拨付|补贴/.test(text)
      ? "funds"
      : /企业|主体|覆盖/.test(text)
      ? "enterprise"
      : "items";

    const focusLabel =
      focus === "publish" ? "政策发布情况" : focus === "funds" ? "资金兑现指标" : focus === "enterprise" ? "扶持企业维度" : "兑现事项维度";

    return {
      reply: `已为您切换到“${focusLabel}”视图，左侧页面正在联动展示相关数据。`,
      action: { kind: "navigate", path: "/effect-dashboard", search: { focus } },
      source: "fallback",
    };
  }

  if (intentModule === "evaluation") {
    const policy = findEvaluationPolicy(text) || trimIntentPrefix(text, [/^(评估|查看|生成|调取)/, /评价报告$/, /报告$/, /政策$/]) || text;
    return {
      reply: `已为您调取“${policy}”的评价分析结果，左侧页面正在生成或展示对应报告。`,
      action: { kind: "navigate", path: "/policy-analysis", search: { policy } },
      source: "fallback",
    };
  }

  if (scene.key === "writing") {
    const wantsSearch = /检索|查询|搜索|查找|参考|看看|找/.test(text);
    if (wantsSearch) {
      const keyword =
        trimIntentPrefix(text, [/^(检索|查询|搜索|查找|找一下|找找|看看)/, /相关政策$/, /政策$/]) || text;
      return {
        reply: `已为您检索“${keyword}”相关政策，左侧页面已联动展示检索结果。`,
        action: { kind: "navigate", path: "/policy-writing/search", search: { q: keyword, target: "title" } },
        source: "fallback",
      };
    }

    const title = trimIntentPrefix(text, [/^(起草|撰写|草拟|制定|写一份|写)/, /政策文件$/, /文件$/]) || text;
    return {
      reply: `已根据“${title}”创建起草任务，并自动带入政策标题和核心要素。`,
      action: {
        kind: "navigate",
        path: "/policy-writing/drafting",
        state: {
          initialTitle: title,
          initialCoreElements: fallbackCoreElements,
          autoGenerateCoreElements: true,
        },
      },
      source: "fallback",
    };
  }

  return { reply: scene.prompt, action: { kind: "none" }, source: "fallback" };
}

async function callConfiguredAssistantApi(scene: AssistantScene, input: string, history: AssistantMessage[]): Promise<AssistantPlan | null> {
  const apiUrl = import.meta.env.VITE_ASSISTANT_API_URL as string | undefined;
  if (!apiUrl) return null;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scene, input, history, context: searchContext }),
  });

  if (!response.ok) throw new Error("assistant_api_failed");
  const result = (await response.json()) as AssistantPlan;
  if (!result?.reply) throw new Error("assistant_api_invalid");
  return { ...result, source: "model" };
}

async function callOpenAI(scene: AssistantScene, input: string, history: AssistantMessage[]): Promise<AssistantPlan | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) return null;

  const model = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) || "gpt-4.1-mini";
  const systemPrompt = [
    "你是惠企政策大脑中的全局智能助手。",
    "用户在任意页面都可以询问政策制定、政策触达、政策兑现、政策评价四个模块中的任何问题。",
    "你的任务是理解用户意图，并返回结构化 JSON，用于驱动页面联动。",
    "你必须同时给出自然中文回复 reply，以及可执行 action。",
    "action 只允许 kind 为 navigate 或 none。",
    "如果是 navigate，返回 path，并可选 search 和 state。",
    "不要返回 markdown，不要解释 JSON 之外的内容。",
    `当前页面上下文：${scene.label}`,
    `当前页面主动提示：${scene.prompt}`,
    `可联动的上下文数据：${JSON.stringify(searchContext)}`,
    "JSON schema: {\"reply\": string, \"action\": {\"kind\": \"navigate\"|\"none\", \"path\"?: string, \"search\"?: object, \"state\"?: object }}",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        ...history.slice(-6).map((message) => ({ role: message.role, content: message.content })),
        { role: "user", content: input },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("openai_request_failed");
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("openai_empty_response");
  const parsed = JSON.parse(content) as Omit<AssistantPlan, "source">;
  if (!parsed?.reply) throw new Error("openai_invalid_response");
  return { ...parsed, source: "model" };
}

export async function getAssistantPlan(scene: AssistantScene, input: string, history: AssistantMessage[]): Promise<AssistantPlan> {
  try {
    const apiPlan = await callConfiguredAssistantApi(scene, input, history);
    if (apiPlan) return apiPlan;
  } catch {
    // fallback to next provider
  }

  try {
    const openAiPlan = await callOpenAI(scene, input, history);
    if (openAiPlan) return openAiPlan;
  } catch {
    // fallback to local rules
  }

  return buildFallbackPlan(scene, input);
}
