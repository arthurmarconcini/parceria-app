"use server";

import { db } from "@/lib/prisma";
import { ProductSchemaType } from "@/lib/schemas";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const addProduct = async (
  formData: ProductSchemaType
): Promise<{ success: boolean; error?: string }> => {
  try {
    const category = await db.category.findUnique({
      where: { id: formData.categoryId },
    });

    if (!category) {
      throw new Error("Categoria não encontrada.");
    }

    const isPizzaCategory = category.name.toLowerCase() === "pizzas";

    await db.product.create({
      data: {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        price: isPizzaCategory ? null : formData.price, // O preço já é number | null
        discount: formData.discount, // O desconto já é number
        isHalfHalf: formData.isHalfHalf,
        categoryId: formData.categoryId,
        Size: {
          create: isPizzaCategory
            ? formData.sizes.map((size) => ({
                name: size.name,
                price: size.price!, // O preço do tamanho já é number
              }))
            : undefined,
        },
      },
    });

    revalidatePath("/loja/adicionar-produtos");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Já existe um produto com este nome." };
      }
    }
    console.error("Erro ao criar produto:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao criar o produto.",
    };
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await db.product.update({
      where: { id },
      data: { isActive: false },
    });
    revalidatePath("/loja/adicionar-produtos");
    return true;
  } catch (error) {
    console.error("Erro ao arquivar produto:", error);
    return false;
  }
};
