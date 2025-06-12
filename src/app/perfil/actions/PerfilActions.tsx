"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface UpdateUserArgs {
  name: string;
  phone: string;
}

export const updateUserProfile = async (data: UpdateUserArgs) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone,
      },
    });

    revalidatePath("/perfil");
    return { success: "Perfil atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar o perfil:", error);
    return { error: "Falha ao atualizar o perfil." };
  }
};
