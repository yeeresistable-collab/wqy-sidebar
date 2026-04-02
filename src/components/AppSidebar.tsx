import { Home, ClipboardCheck, PenTool, Send } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "政策制定", url: "/policy-writing", icon: PenTool },
  { title: "政策触达", url: "/policy-reach", icon: Send },
  { title: "政策兑现", url: "/", icon: Home },
  { title: "政策评价", url: "/policy-evaluation", icon: ClipboardCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <img src={logoImg} alt="惠企政策大脑" className="w-8 h-8 rounded-lg object-contain" />
        {!collapsed && (
          <span className="text-sm font-bold text-foreground tracking-wide">惠企政策大脑</span>
        )}
      </div>
      <SidebarContent className="pt-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md"
                  activeClassName="text-primary font-semibold bg-accent"
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
