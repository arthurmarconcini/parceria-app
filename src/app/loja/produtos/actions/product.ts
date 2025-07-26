"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";
import { productSchema } from "@/lib/schemas";
import { db } from "@/lib/prisma";

export const createProduct = async (
  data: z.infer<typeof productSchema>
): Promise<{
  success: boolean;
  message: string;
  error?: Record<string, string[]> | undefined;
}> => {
  const validatedFields = productSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dados inválidos.",
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { sizes, extras, ...productData } = validatedFields.data;

    await db.product.create({
      data: {
        ...productData,
        Size: {
          createMany: {
            data: sizes || [],
          },
        },
        Extras: {
          createMany: {
            data: extras || [],
          },
        },
      },
    });

    revalidatePath("/loja/produtos");
    revalidatePath("/");

    return { success: true, message: "Produto criado com sucesso." };
  } catch (error) {
    console.error("Erro ao criar o produto:", error);
    return { success: false, message: "Erro ao criar o produto." };
  }
};

export const deleteProduct = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/loja/produtos");
    revalidatePath("/");
    return { success: true, message: "Produto excluído com sucesso." };
  } catch (error) {
    console.error("Erro ao excluir o produto:", error);
    return { success: false, message: "Erro ao excluir o produto." };
  }
};

export const updateProduct = async (
  id: string,
  data: z.infer<typeof productSchema>
): Promise<{
  success: boolean;
  message: string;
  error?: Record<string, string[]> | undefined;
}> => {
  const validatedFields = productSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dados inválidos para atualização.",
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { sizes, extras, ...productData } = validatedFields.data;

    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: productData,
      });

      await tx.size.deleteMany({
        where: { productId: id },
      });

      if (sizes && sizes.length > 0) {
        await tx.size.createMany({
          data: sizes.map((size) => ({
            ...size,
            productId: id,
          })),
        });
      }

      await tx.extra.deleteMany({
        where: { productId: id },
      });

      if (extras && extras.length > 0) {
        await tx.extra.createMany({
          data: extras.map((extra) => ({
            ...extra,
            productId: id,
          })),
        });
      }
    });

    revalidatePath("/loja/produtos");
    revalidatePath("/");

    return { success: true, message: "Produto atualizado com sucesso." };
  } catch (error) {
    console.error("Erro ao atualizar o produto:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
    return {
      success: false,
      message: `Erro ao atualizar o produto: ${errorMessage}`,
    };
  }
};
