import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AddressForm from "./_components/AddressForm";

const isValidBrazilianZipCode = (zipCode: string): boolean => {
  const cleanedZipCode = zipCode.replace(/\D/g, "");
  const zipCodeRegex = /^[0-9]{8}$/;
  return zipCodeRegex.test(cleanedZipCode);
};

export default async function AddAddressPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Carrega a cidade do restaurante
  const city = await db.restaurantCity.findFirst();
  const restaurantCity = city ? { id: city.id, name: city.name } : null;

  // Carrega as localidades disponíveis para a cidade do restaurante
  const localities = await db.locality.findMany({
    where: { cityId: city?.id },
    orderBy: { name: "asc" },
  });

  if (!restaurantCity) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Erro</h1>
        <p>Cidade do restaurante não configurada. Contate o suporte.</p>
      </div>
    );
  }

  // Server Action para processar o formulário
  async function createAddress(formData: FormData) {
    "use server";

    const street = formData.get("street") as string;
    const number = formData.get("number") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const localityId = formData.get("localityId") as string;

    // Valida o CEP
    if (!isValidBrazilianZipCode(zipCode)) {
      throw new Error("CEP inválido. Deve conter 8 dígitos (ex.: 12345-678).");
    }

    // Valida a localidade
    if (!localityId) {
      throw new Error("Selecione uma localidade.");
    }

    const normalizedZipCode = zipCode.replace(/\D/g, "");

    if (!session?.user?.id) {
      throw new Error("Usuário não autenticado");
    }

    // Verifica a cidade do restaurante
    const restaurantCity = await db.restaurantCity.findFirst();
    if (!restaurantCity || city !== restaurantCity.name) {
      throw new Error(
        `Entregas são permitidas apenas em ${restaurantCity?.name}.`
      );
    }

    // Verifica se a localidade pertence à cidade do restaurante
    const locality = await db.locality.findUnique({
      where: { id: localityId },
      include: { city: true },
    });

    if (!locality || locality.cityId !== restaurantCity.id) {
      throw new Error("Localidade inválida para a cidade do restaurante.");
    }

    await db.$transaction([
      // Remove o status de padrão de todos os endereços existentes
      db.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      // Cria o novo endereço como padrão
      db.address.create({
        data: {
          street,
          number,
          city: restaurantCity.name,
          state: state || undefined,
          zipCode: normalizedZipCode,
          localityId,
          userId: session.user.id,
          isDefault: true,
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
        localities={localities}
        createAddress={createAddress}
      />
    </div>
  );
}
