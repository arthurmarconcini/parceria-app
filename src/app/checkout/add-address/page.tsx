import { db } from "@/lib/prisma";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AddressFormModal } from "@/components/AddressFormModal";

export default async function AddAddressPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const city = await db.restaurantCity.findFirst();
  if (!city) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Erro</h1>
        <p>Cidade do restaurante não configurada. Contate o suporte.</p>
      </div>
    );
  }

  const restaurantCity = { id: city.id, name: city.name };
  const restaurantState = city.name === "Guarapari" ? "ES" : "Outro";

  const localities = await db.locality.findMany({
    where: { cityId: city.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Adicionar Endereço</h1>
      <AddressFormModal
        localities={localities}
        restaurantCity={restaurantCity}
        restaurantState={restaurantState}
      />
    </div>
  );
}
