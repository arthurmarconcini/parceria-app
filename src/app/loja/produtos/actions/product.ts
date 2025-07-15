"use server";

import { z } from "zod";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
  name: z.string().min(3, "O nome do produto é obrigatório."),
  description: z.string().optional(),
  price: z
    .number()
    .min(0, "O preço não pode ser negativo.")
    .optional()
    .nullable(),
  categoryId: z.string().min(1, "A categoria é obrigatória."),
  discount: z.number().min(0).max(100).optional(),
  isActive: z.boolean().default(true),
  isHalfHalf: z.boolean().optional(),
  imageUrl: z.string().optional(),
  sizes: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().min(0),
      })
    )
    .optional(),
  extras: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().min(0),
      })
    )
    .optional(),
});

export async function addProduct(data: z.infer<typeof productSchema>) {
  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error.flatten() };
  }

  const {
    name,
    description,
    price,
    categoryId,
    discount,
    isActive,
    isHalfHalf,
    imageUrl,
    sizes,
    extras,
  } = validation.data;

  try {
    await db.product.create({
      data: {
        name,
        description,
        price,
        categoryId,
        discount,
        isActive,
        isHalfHalf,
        imageUrl,
        Size: {
          create: sizes,
        },
        Extras: {
          create: extras,
        },
      },
    });
    revalidatePath("/loja/produtos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar o produto." };
  }
}

export async function updateProduct(
  id: string,
  data: z.infer<typeof productSchema>
) {
  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error.flatten() };
  }

  const {
    name,
    description,
    price,
    categoryId,
    discount,
    isActive,
    isHalfHalf,
    imageUrl,
    sizes,
    extras,
  } = validation.data;

  try {
    await db.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        categoryId,
        discount,
        isActive,
        isHalfHalf,
        imageUrl,
        Size: {
          deleteMany: {},
          create: sizes,
        },
        Extras: {
          deleteMany: {},
          create: extras,
        },
      },
    });
    revalidatePath("/loja/produtos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar o produto." };
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    await db.product.update({
      where: { id },
      data: { isActive: !isActive },
    });
    revalidatePath("/loja/produtos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao alterar o status do produto." };
  }
}
