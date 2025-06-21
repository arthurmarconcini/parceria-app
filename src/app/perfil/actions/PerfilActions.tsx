"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface UpdateUserArgs {
  name: string;
  phone: string;
}

// Retorna o usuário atualizado para o cliente
export const updateUserProfile = async (data: UpdateUserArgs) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autorizado" };
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone,
      },
    });

    revalidatePath("/perfil");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Erro ao atualizar o perfil:", error);
    return { success: false, error: "Falha ao atualizar o perfil." };
  }
};

// Retorna os endereços atualizados para o cliente
export const setDefaultAddressAction = async (addressId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autorizado" };
  }

  try {
    await db.$transaction([
      db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      }),
      db.address.update({
        where: { id: addressId, userId: session.user.id },
        data: { isDefault: true },
      }),
    ]);

    const updatedAddresses = await db.address.findMany({
      where: { userId: session.user.id },
      include: { locality: true },
      orderBy: { isDefault: "desc" },
    });

    revalidatePath("/perfil");
    revalidatePath("/checkout");
    return { success: true, addresses: updatedAddresses };
  } catch (error) {
    console.error("Erro ao atualizar o endereço padrão:", error);
    return {
      success: false,
      error: "Falha ao atualizar o endereço padrão.",
    };
  }
};

// Retorna o ID do endereço excluído
export const archiveAddressAction = async (addressId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autorizado" };
  }

  try {
    const addressToArchive = await db.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });

    if (!addressToArchive) {
      return {
        success: false,
        error: "Endereço não encontrado ou não pertence a você.",
      };
    }

    // Se o endereço for o padrão, não permita arquivar
    if (addressToArchive.isDefault) {
      return {
        success: false,
        error:
          "Você não pode arquivar seu endereço padrão. Defina outro como padrão primeiro.",
      };
    }

    // Em vez de deletar, atualizamos o endereço para inativo
    await db.address.update({
      where: {
        id: addressId,
      },
      data: {
        isActive: false,
      },
    });

    revalidatePath("/perfil");
    revalidatePath("/checkout");

    return { success: true, archivedAddressId: addressId };
  } catch (error) {
    console.error("Erro ao arquivar o endereço:", error);
    return { success: false, error: "Falha ao arquivar o endereço." };
  }
};
