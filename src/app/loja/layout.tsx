import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"; //
import AppSidebar from "./components/AppSidebar"; //

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}> {/* Sidebar fechado por padrão */}
      <AppSidebar /> {/* Este é o painel/gaveta do sidebar */}
      
      {/* Área de conteúdo principal, renderizada ao lado ou sobreposta pelo AppSidebar */}
      <div className="flex-1 flex flex-col md:pl-0"> {/* Em telas maiores, o AppSidebar (offcanvas) não empurra o conteúdo por padrão */}
        
        {/* Cabeçalho Sticky para a seção /loja, contendo o SidebarTrigger */}
        <header className="sticky top-0 bg-background/90 backdrop-blur-sm border-b border-border p-2 md:px-4 flex items-center z-30 h-14 shadow-sm">
          {/* SidebarTrigger já é um Button com ícone. Aplicamos classes para melhor visualização. */}
          <SidebarTrigger className="text-foreground hover:bg-accent focus-visible:ring-primary focus-visible:ring-offset-0" />
          <h1 className="ml-3 text-lg font-semibold text-foreground">
            Painel da Loja {/* Você pode tornar este título dinâmico se necessário */}
          </h1>
        </header>

        {/* Conteúdo principal da página da loja, com rolagem independente */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}