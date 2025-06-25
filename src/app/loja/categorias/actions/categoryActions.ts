"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { Prisma, Category } from "@prisma/client";
import { revalidatePath } from "next/cache";

type ActionResponse = {
  success: boolean;
  error?: string;
  category?: Category;
};

export const createCategory = async (name: string): Promise<ActionResponse> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Não autorizado." };
  }

  if (!name || name.trim().length < 2) {
    return { success: false, error: "O nome deve ter ao menos 2 caracteres." };
  }

  try {
    const newCategory = await db.category.create({
      data: { name },
    });
    revalidatePath("/loja/categorias");
    return { success: true, category: newCategory };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "Uma categoria com este nome já existe.",
      };
    }
    return { success: false, error: "Falha ao criar categoria." };
  }
};

export const updateCategory = async (
  id: string,
  name: string
): Promise<ActionResponse> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Não autorizado." };
  }

  if (!name || name.trim().length < 2) {
    return { success: false, error: "O nome deve ter ao menos 2 caracteres." };
  }

  try {
    const updatedCategory = await db.category.update({
      where: { id },
      data: { name },
    });
    revalidatePath("/loja/categorias");
    return { success: true, category: updatedCategory };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "Uma categoria com este nome já existe.",
      };
    }
    return { success: false, error: "Falha ao atualizar categoria." };
  }
};

export const deleteCategory = async (id: string): Promise<ActionResponse> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Não autorizado." };
  }

  try {
    const productCount = await db.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return {
        success: false,
        error:
          "Não é possível excluir. Existem produtos associados a esta categoria.",
      };
    }

    await db.category.delete({ where: { id } });
    revalidatePath("/loja/categorias");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Falha ao deletar categoria." };
  }
};
