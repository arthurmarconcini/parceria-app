import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "./components/ProfileClient";
import { User } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const addresses = await db.address.findMany({
    where: {
      userId: session.user.id,
      isActive: true, // <<< Adicionar este filtro
    },
    include: {
      locality: true,
    },
    orderBy: {
      isDefault: "desc",
    },
  });

  const restaurantCity = await db.restaurantCity.findFirst();
  const restaurantState = restaurantCity?.name === "Guarapari" ? "ES" : "ES";

  const localities = restaurantCity
    ? await db.locality.findMany({
        where: { cityId: restaurantCity.id },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <User className="h-8 w-8" />
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
      </div>

      <ProfileClient
        user={user}
        addresses={addresses}
        localities={localities}
        restaurantCity={restaurantCity}
        restaurantState={restaurantState}
      />
    </div>
  );
}
