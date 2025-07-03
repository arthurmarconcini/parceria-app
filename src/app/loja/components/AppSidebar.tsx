import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Monitor, Barcode, List, Clock } from "lucide-react";

const itens = [
  {
    title: "Gestor de pedidos",
    url: "/loja/gestor",
    icon: Monitor,
  },
  {
    title: "Produtos",
    url: "/loja/adicionar-produtos",
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
];

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="bg-secondary">
        <h1>Bem vindo ao gestor do parcerias</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pedidos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itens.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={`http://localhost:3000${item.url}`}>
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
