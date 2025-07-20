"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Monitor, Barcode, List, Clock, ClipboardMinus } from "lucide-react";

// Definição dos itens do menu para facilitar a manutenção
const menuItems = [
  {
    title: "Gestor de Pedidos",
    url: "/loja/gestor",
    icon: Monitor,
  },
  {
    title: "Produtos",
    url: "/loja/produtos",
    icon: Barcode,
  },
  {
    title: "Categorias",
    url: "/loja/categorias",
    icon: List,
  },
  {
    title: "Horários",
    url: "/loja/horarios",
    icon: Clock,
  },
  {
    title: "Relatórios",
    url: "/loja/relatorios",
    icon: ClipboardMinus,
  },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { state } = useSidebar();

  const getAvatarFallback = (name?: string | null) => {
    if (!name) return "AD";
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar collapsible="icon">
      {/* O cabeçalho agora centraliza os itens quando está colapsado */}
      <SidebarHeader
        className={`flex items-center p-2 transition-all duration-300 ${
          state === "collapsed"
            ? "justify-center h-[58px]"
            : "justify-start h-auto"
        }`}
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatar.png" alt="Avatar do usuário" />
          <AvatarFallback>
            {getAvatarFallback(session?.user?.name)}
          </AvatarFallback>
        </Avatar>
        {/* Contêiner para o nome e cargo que some suavemente */}
        <div
          className={`ml-2 flex flex-col transition-opacity duration-200 ${
            state === "collapsed" ? "opacity-0 h-0 w-0" : "opacity-100"
          }`}
        >
          <span className="text-sm font-semibold text-sidebar-foreground truncate">
            {session?.user?.name || "Admin"}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {session?.user?.role?.toLowerCase() || ""}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={{
                  children: item.title,
                  side: "right",
                  align: "center",
                }}
              >
                <a href={item.url}>
                  <item.icon size={20} />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <p
          className={`text-xs text-muted-foreground transition-opacity duration-200 ${
            state === "collapsed" ? "opacity-0" : "opacity-100"
          }`}
        >
          © {new Date().getFullYear()} Parceria App
        </p>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
