// src/app/pedidos/page.tsx

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { PackageSearch } from "lucide-react";
import { UserOrdersClient } from "./components/UserOrdersClient";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const orders = await db.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
          Size: true, // Incluído para exibir o tamanho do item
          orderExtras: {
            include: {
              extra: true,
            },
          },
          HalfHalf: {
            // Incluído para exibir detalhes de pizza meio a meio
            include: {
              firstHalf: true,
              secondHalf: true,
            },
          },
        },
      },
      address: {
        // Incluído para exibir o endereço de entrega
        include: {
          locality: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Pedidos mais recentes primeiro
    },
  });

  if (orders.length === 0) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
        <PackageSearch
          className="h-16 w-16 text-muted-foreground"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-semibold">Nenhum pedido encontrado</h1>
        <p className="text-muted-foreground">
          Parece que você ainda não fez nenhum pedido conosco.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Meus Pedidos</h1>
        <span className="flex h-7 items-center justify-center rounded-full bg-primary px-3 text-sm font-bold text-primary-foreground">
          {orders.length}
        </span>
      </div>
      <UserOrdersClient orders={orders} />
    </div>
  );
}
