import { Bot, ClipboardCheck, Database, FolderOpen, Home, PenTool, Send } from "lucide-react";
import { Outlet } from "react-router-dom";
import { AiAssistant } from "@/components/AiAssistant";
import { NavLink } from "@/components/NavLink";

const sideNavItems = [
  { title: "政策制定", url: "/policy-writing", icon: PenTool },
  { title: "政策触达", url: "/policy-reach", icon: Send },
  { title: "政策兑现", url: "/", icon: Home },
  { title: "政策评价", url: "/policy-evaluation", icon: ClipboardCheck },
];

const documentNavItems = [
  { title: "我的文档", url: "/my-documents", icon: FolderOpen },
  { title: "储备库", url: "/reserve-library", icon: Database },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7f4f4] text-foreground">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 flex w-[244px] flex-col overflow-hidden bg-gradient-to-b from-[#d21639] via-[#c61033] to-[#b80f2f] text-white shadow-[18px_0_40px_rgba(157,12,38,0.22)]">
          <div className="border-b border-white/12 px-6 py-12">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/14 ring-1 ring-white/12 backdrop-blur">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[18px] font-bold tracking-[0.02em]">惠企政策大脑</p>
                <p className="mt-1 text-sm text-white/80">政策管理平台</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-5 py-7">
            <div className="space-y-2">
              {sideNavItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4 text-[17px] font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white"
                  activeClassName="bg-[#a90e2c] text-white shadow-[0_10px_22px_rgba(110,0,23,0.25)]"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </div>

            <div className="mt-8 border-t border-white/16 pt-8">
              <p className="px-5 text-[15px] font-semibold text-white/80">文档管理</p>
              <div className="mt-4 space-y-2">
                {documentNavItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className="flex items-center gap-4 rounded-2xl px-5 py-4 text-[17px] font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white"
                    activeClassName="bg-[#a90e2c] text-white shadow-[0_10px_22px_rgba(110,0,23,0.25)]"
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        <div className="ml-[244px] flex min-h-screen flex-1 flex-col">
          <main className="flex-1 overflow-auto pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      <AiAssistant />
    </div>
  );
}
