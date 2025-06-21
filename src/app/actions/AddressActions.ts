"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export const createAddressAction = async (data: CreateAddressArgs) => {
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

  let newAddress;
  await db.$transaction(async (prisma) => {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
    newAddress = await prisma.address.create({
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
      include: {
        locality: true,
      },
    });
  });

  revalidatePath("/checkout");
  revalidatePath("/perfil");

  return { success: true, newAddress };
};
