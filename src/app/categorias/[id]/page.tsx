import { db as prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PizzaIcon, PlusIcon } from "lucide-react";

export default async function CategoriaPage({
  params,
}: {
  params: { id: string };
}) {
  const categoria = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      products: {
        include: {
          Size: true,
          Extras: true,
        },
      },
    },
  });

  if (!categoria) return <div>Categoria não encontrada</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <PizzaIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">{categoria.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:gap-8">
        {categoria.products.map((produto) => (
          <div
            key={produto.id}
            className="flex gap-6 rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={produto.imageUrl || "/placeholder-pizza.png"}
                alt={produto.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{produto.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {produto.description}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">
                  R$ {produto.price}
                </span>
              </div>

              {produto.Size.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {produto.Size.map((tamanho) => (
                    <span
                      key={tamanho.id}
                      className="rounded-full bg-accent px-3 py-1 text-sm font-medium"
                    >
                      {tamanho.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/produto/${produto.id}`}>Detalhes</Link>
                  </Button>
                </div>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
