import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"; //
import AppSidebar from "./components/AppSidebar"; //

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />

      <div className="flex-1 flex flex-col md:pl-0">
        {" "}
        {/* Em telas maiores, o AppSidebar (offcanvas) não empurra o conteúdo por padrão */}
        <header className="sticky top-0 bg-background/90 backdrop-blur-sm border-b border-border p-2 md:px-4 flex items-center z-30 h-14 shadow-sm">
          <SidebarTrigger className="text-foreground hover:bg-accent focus-visible:ring-primary focus-visible:ring-offset-0" />
          <h1 className="ml-3 text-lg font-semibold text-foreground">
            Painel da Loja
          </h1>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
