"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Definindo o tipo exato do endereço que será retornado
type NewAddressPayload = Prisma.AddressGetPayload<{
  include: {
    locality: true;
  };
}>;

// Definindo o tipo de retorno da action como uma união discriminada
type CreateAddressResult =
  | { success: true; newAddress: NewAddressPayload }
  | { success: false; error: string };

interface CreateAddressArgs {
  street: string;
  number: string;
  zipCode: string | null;
  localityId: string;
  reference: string | null;
  observation: string | null;
  city: string;
  state: string;
}

// Adicionando o tipo de retorno à função
export const createAddressAction = async (
  data: CreateAddressArgs
): Promise<CreateAddressResult> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Usuário não autenticado" };
  }

  try {
    let newAddress: NewAddressPayload | undefined;

    // O uso de transação garante que ambas as operações ocorram com sucesso
    await db.$transaction(async (prisma) => {
      // Primeiro, remove o 'isDefault' de outros endereços
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });

      // Depois, cria o novo endereço como padrão
      newAddress = await prisma.address.create({
        data: {
          ...data,
          zipCode: data.zipCode?.replace(/\D/g, "") || null,
          userId: session.user.id,
          isDefault: true,
        },
        include: {
          locality: true,
        },
      });
    });

    if (!newAddress) {
      return { success: false, error: "Não foi possível criar o endereço." };
    }

    revalidatePath("/checkout");
    revalidatePath("/perfil");

    return { success: true, newAddress };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return { success: false, error: errorMessage };
  }
};
