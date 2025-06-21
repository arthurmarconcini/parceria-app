"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export const createAddressAction = async (
  data: CreateAddressArgs,
  redirectPath?: string
) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  const {
    street,
    number,
    zipCode,
    localityId,
    reference,
    observation,
    city,
    state,
  } = data;

  if (!localityId) {
    throw new Error("Selecione uma localidade.");
  }

  // Lógica de validação e criação que você já tem...
  await db.$transaction([
    db.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    }),
    db.address.create({
      data: {
        street,
        number,
        city,
        state,
        zipCode: zipCode?.replace(/\D/g, "") || null,
        localityId,
        userId: session.user.id,
        isDefault: true,
        reference,
        observation,
      },
    }),
  ]);

  // Revalida os paths onde os endereços são exibidos
  revalidatePath("/checkout");
  revalidatePath("/perfil");

  // Redireciona se um caminho for fornecido
  if (redirectPath) {
    redirect(redirectPath);
  }

  return { success: true };
};

// Você pode adicionar outras ações aqui (update, delete)
