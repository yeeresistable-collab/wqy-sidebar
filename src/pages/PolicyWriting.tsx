import { Sparkles, FileText, Activity, Clock, ChevronRight, ChevronsRight, PenTool, Shield, Users, Search, BarChart3, FilePen, ClipboardCheck, Wrench, Calculator, Database, BookOpen, Zap, Eye, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PageHero } from "@/components/PageHero";

const stats = [
  { icon: FileText, label: "政策知识库", value: "30万+", desc: "国家到区级政策资金全覆盖", color: "bg-rose-100 text-rose-600", cardBg: "bg-rose-100/80", action: "去检索", link: "/policy-writing/search" },
  { icon: BarChart3, label: "政策对比分析", value: "231", desc: "多地政策对比分析，提升政策设计竞争力", color: "bg-sky-100 text-sky-600", cardBg: "bg-sky-100/80", action: "去分析", link: "/policy-writing/analysis" },
  { icon: Activity, label: "政策草稿", value: "486", desc: "自动生成核心要点、大纲与正文，支持章节级AI协同。", color: "bg-orange-100 text-orange-600", cardBg: "bg-orange-100/80", action: "去起草", link: "/policy-writing/drafting" },
  { icon: Clock, label: "政策前评估", value: "120", desc: "从合规性、一致性和落地性三方面发现风险并给出修改建议。", color: "bg-emerald-100 text-emerald-600", cardBg: "bg-emerald-100/80", action: "去评估", link: "/policy-writing/pre-evaluation" },
];

const flowSteps = [
  { icon: Search, title: "政策检索", tag: "找参考", link: "/policy-writing/search" },
  { icon: BarChart3, title: "政策对比分析", tag: "做判断", link: "/policy-writing/analysis" },
  { icon: FilePen, title: "政策起草", tag: "写内容", link: "/policy-writing/drafting" },
  { icon: ClipboardCheck, title: "政策前评估", tag: "做校验", link: "/policy-writing/pre-evaluation" },
];

const topics = [
  {
    icon: Shield,
    iconColor: "bg-primary/10 text-primary",
    title: "加快推进数据产业高质量发展",
    desc: "围绕数据要素流通、数据基础设施建设和场景应用培育，推动数据产业集聚发展。",
  },
  {
    icon: Activity,
    iconColor: "bg-violet-500/10 text-violet-500",
    title: "加快推动产业金融高质量发展",
    desc: "聚焦基金引导、信贷支持和融资服务创新，提升金融服务实体产业发展的能力。",
  },
  {
    icon: Users,
    iconColor: "bg-emerald-500/10 text-emerald-500",
    title: "优化营商环境十大行动方案",
    desc: "从审批提速、服务优化和要素保障等方面推出举措，持续提升企业获得感与便利度。",
  },
];

const recentDraftTasks = [
  {
    title: "北京经开区产业发展促进办法",
    label: "已完成",
    time: "2024-03-20",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
  {
    title: "科技创新企业扶持专项",
    label: "进行中",
    time: "2024-03-19",
    color: "text-orange-500",
    bgColor: "bg-orange-50 border-orange-200",
    icon: Clock,
  },
  {
    title: "中小企业融资支持政策",
    label: "编辑中",
    time: "2024-03-18",
    color: "text-orange-500",
    bgColor: "bg-orange-50 border-orange-200",
    icon: Clock,
  },
];

export default function PolicyWriting() {
  const navigate = useNavigate();
  const location = useLocation();

  // 从首页携带的问题，到达后自动打开全屏助手并发送
  useEffect(() => {
    const state = location.state as { assistantQuestion?: string } | undefined;
    if (!state?.assistantQuestion) return;
    // 清除 state 避免刷新时重复触发
    window.history.replaceState({}, "");
    // 稍作延迟等助手组件挂载就绪
    const timer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("policy-assistant:ask", {
          detail: { question: state.assistantQuestion },
        })
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [location.state]);

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <PageHero
          title="政策制定"
          description="面向政策制定人员，提供从检索分析到自动生成与校验的智能写作工具。"
          action={
            <Button
              className="shrink-0 gap-2 rounded-full bg-white px-6 text-primary shadow-sm hover:bg-white/90"
              onClick={() => navigate("/policy-writing/drafting")}
            >
              <Sparkles className="w-4 h-4" />
              开始新写作
            </Button>
          }
        />

        {/* Flow Navigation - Icon Pipeline */}
        <Card className="px-5 py-3 border border-border">
          <h2 className="text-[15px] font-bold text-foreground mb-3">政策制定流程</h2>
          <div className="flex items-center justify-between">
            {flowSteps.map((step, i) => (
              <div key={step.title} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 cursor-pointer group flex-1 py-1" onClick={() => navigate(step.link)}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-md group-hover:scale-110 transition-transform">
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-semibold whitespace-nowrap text-foreground">{step.title}</span>
                  <span className="text-[11px] text-muted-foreground">{step.tag}</span>
                </div>
                {i < flowSteps.length - 1 && (
                  <ChevronsRight className="w-5 h-5 text-primary/30 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className={`rounded-[26px] border border-border p-5 ${s.cardBg} flex min-h-[256px] flex-col`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ${s.color}`}>
                  <s.icon className="h-7 w-7" />
                </div>
                <p className="text-[17px] font-bold text-foreground leading-snug">{s.label}</p>
              </div>

              <div className="mt-5">
                <p className="text-[34px] font-extrabold leading-none text-foreground">{s.value}</p>
                <p className="mt-4 text-[15px] leading-7 text-muted-foreground">{s.desc}</p>
              </div>

              <Button
                className="mt-auto h-11 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                onClick={() => navigate(s.link)}
              >
                {s.action}
              </Button>
            </Card>
          ))}
        </div>

        {/* Topic Sketches + Quick Entry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 政策主题速写 - 2/3 */}
          <Card className="p-6 border border-border md:col-span-2">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PenTool className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">政策主题速写</h2>
                  <p className="text-sm text-muted-foreground">更多主题 (8)</p>
                </div>
              </div>
              <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {topics.map((topic, i) => (
                <Card key={i} className="p-4 border border-border hover:shadow-md transition-shadow cursor-pointer flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${topic.iconColor}`}>
                    <topic.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-foreground">{topic.title}</p>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs shrink-0">新推荐</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{topic.desc}</p>
                  </div>
                  <button
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1 shrink-0 mt-1"
                    onClick={() =>
                      navigate("/policy-writing/drafting", {
                        state: {
                          initialTitle: topic.title,
                          autoGenerateCoreElements: true,
                        },
                      })
                    }
                  >
                    开始写作 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </Card>
              ))}
            </div>
          </Card>

          {/* 常用功能 - 1/3 */}
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">常用功能</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: Wrench, title: "政策工具箱", desc: "常用政策编写工具集合" },
                { icon: Calculator, title: "政策测算", desc: "资金与效果预测模型" },
                { icon: Database, title: "政策储备库", desc: "历史政策文档归档管理" },
                { icon: BookOpen, title: "条款储备库", desc: "可复用条款模板库" },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6 border border-border">
          <h2 className="text-base font-bold text-foreground mb-4">最近起草任务</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDraftTasks.map((task) => (
              <div
                key={task.title}
                className="rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <p className="text-base font-semibold text-foreground mb-5">{task.title}</p>
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${task.bgColor} ${task.color}`}>
                    <task.icon className="w-3.5 h-3.5" />
                    {task.label}
                  </div>
                  <span className="text-sm text-muted-foreground">{task.time}</span>
                </div>
                <button className="mx-auto flex items-center gap-1.5 text-primary text-sm font-medium hover:underline">
                  <Eye className="w-4 h-4" />
                  查看详情
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
