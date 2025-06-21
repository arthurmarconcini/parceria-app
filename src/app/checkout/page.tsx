import CheckoutClient from "./components/CheckoutClient";
import { db } from "../../lib/prisma";
import { auth } from "@/auth";

export default async function CheckoutPage() {
  const session = await auth();

  const addresses = session?.user?.id
    ? await db.address.findMany({
        where: {
          userId: session.user.id,
          isActive: true,
        },
        include: {
          locality: true,
        },
        orderBy: {
          isDefault: "desc",
        },
      })
    : [];

  const restaurantCity = await db.restaurantCity.findFirst();

  if (!restaurantCity) {
    // Tratar o caso de cidade não configurada
    return (
      <div>Erro: A cidade do restaurante não está configurada no sistema.</div>
    );
  }

  // Lógica para definir o estado, similar à sua implementação original
  const restaurantState = restaurantCity.name === "São Paulo" ? "SP" : "ES";

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>

      <CheckoutClient
        addresses={addresses}
        user={session?.user}
        restaurantCity={restaurantCity}
        restaurantState={restaurantState}
      />
    </div>
  );
}
