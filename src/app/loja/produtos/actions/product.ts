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
        price: isPizzaCategory ? null : formData.price,
        discount: formData.discount,
        isHalfHalf: formData.isHalfHalf,
        categoryId: formData.categoryId,
        Size: {
          create: isPizzaCategory
            ? formData.sizes.map((size) => ({
                name: size.name,
                price: size.price!,
              }))
            : undefined,
        },
        Extras: {
          create: formData.extras.map((extra) => ({
            name: extra.name,
            price: extra.price!,
          })),
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

// Nova ação para atualizar produto
export const updateProduct = async (
  productId: string,
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

    await db.$transaction(async (tx) => {
      // 1. Atualiza as informações básicas do produto
      await tx.product.update({
        where: { id: productId },
        data: {
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl,
          price: isPizzaCategory ? null : formData.price,
          discount: formData.discount,
          isHalfHalf: formData.isHalfHalf,
          categoryId: formData.categoryId,
        },
      });

      // 2. Remove tamanhos e extras antigos para simplificar a lógica
      await tx.size.deleteMany({ where: { productId } });
      await tx.extra.deleteMany({ where: { productId } });

      // 3. Cria os novos tamanhos (se for pizza)
      if (isPizzaCategory && formData.sizes.length > 0) {
        await tx.size.createMany({
          data: formData.sizes.map((size) => ({
            name: size.name,
            price: size.price!,
            productId,
          })),
        });
      }

      // 4. Cria os novos extras
      if (formData.extras.length > 0) {
        await tx.extra.createMany({
          data: formData.extras.map((extra) => ({
            name: extra.name,
            price: extra.price!,
            productId,
          })),
        });
      }
    });

    revalidatePath("/loja/produtos");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    // ... (tratamento de erro semelhante ao addProduct)
    console.error("Erro ao atualizar produto:", error);
    return {
      success: false,
      error: "Erro desconhecido ao atualizar o produto.",
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
