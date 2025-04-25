import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AddressForm from "./_components/AddressForm";

export default async function AddAddressPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Carrega a cidade do restaurante (assumindo que há apenas uma)
  const city = await db.restaurantCity.findFirst();
  if (!city) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Erro</h1>
        <p>Cidade do restaurante não configurada. Contate o suporte.</p>
      </div>
    );
  }

  // Define o estado fixo com base na cidade (exemplo: "SP" para São Paulo)
  const restaurantCity = { id: city.id, name: city.name };
  const restaurantState = city.name === "São Paulo" ? "SP" : "Outro"; // Ajuste conforme a lógica real

  // Carrega as localidades disponíveis para a cidade do restaurante
  const localities = await db.locality.findMany({
    where: { cityId: city.id },
    orderBy: { name: "asc" },
  });

  // Server Action para processar o formulário
  async function createAddress(formData: FormData) {
    "use server";

    const street = formData.get("street") as string;
    const number = formData.get("number") as string;
    const zipCode = formData.get("zipCode") as string | null;
    const localityId = formData.get("localityId") as string;
    const reference = formData.get("reference") as string | null;
    const observation = formData.get("observation") as string | null;

    if (!localityId) {
      throw new Error("Selecione uma localidade.");
    }

    const normalizedZipCode = zipCode?.replace(/\D/g, "") || null;

    if (!session?.user?.id) {
      throw new Error("Usuário não autenticado");
    }

    // Verifica se já existe um endereço idêntico para evitar duplicatas
    const existingAddress = await db.address.findFirst({
      where: {
        userId: session.user.id,
        street,
        number,
        localityId,
      },
    });

    if (existingAddress) {
      throw new Error("Este endereço já está cadastrado.");
    }

    // Verifica a cidade e localidade
    const locality = await db.locality.findUnique({
      where: { id: localityId },
      include: { city: true },
    });

    if (!locality || locality.cityId !== restaurantCity.id) {
      throw new Error("Localidade inválida para a cidade do restaurante.");
    }

    await db.$transaction([
      // Remove o status de padrão de outros endereços
      db.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      }),
      // Cria o novo endereço como padrão
      db.address.create({
        data: {
          street,
          number,
          city: restaurantCity.name,
          state: restaurantState, // Estado fixo
          zipCode: normalizedZipCode,
          localityId,
          userId: session.user.id,
          isDefault: true,
          reference,
          observation,
        },
      }),
    ]);

    redirect("/checkout");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Adicionar Endereço</h1>
      <AddressForm
        restaurantCity={restaurantCity}
        restaurantState={restaurantState} // Passa o estado fixo
        localities={localities}
        createAddress={createAddress}
      />
    </div>
  );
}
