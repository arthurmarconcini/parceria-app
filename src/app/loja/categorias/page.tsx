import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import CategoryClient from "./components/CategoryCliente";

export default async function CategoriesPage() {
  const session = await auth();

  // Acesso restrito apenas para administradores
  if (session?.user?.role !== "ADMIN") {
    redirect("/loja");
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
          <p className="text-muted-foreground text-sm">
            Adicione, edite ou remova as categorias de produtos.
          </p>
        </div>
        <Badge variant="outline">{categories.length} categorias</Badge>
      </div>

      <CategoryClient categories={categories} />
    </div>
  );
}
