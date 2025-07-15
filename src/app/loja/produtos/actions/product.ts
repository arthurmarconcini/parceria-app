"use server";

import { z } from "zod";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProductFormValues } from "@/lib/schemas";

// Função auxiliar para processar e converter valores monetários
const preprocessCurrency = (val: unknown) => {
  if (typeof val === "string") {
    // Remove todos os caracteres não numéricos e converte para centavos
    const num = Number(val.replace(/\D/g, ""));
    // Retorna o valor em reais (ex: 2500 -> 25.00) se for um número válido
    return isNaN(num) ? undefined : num / 100;
  }
  if (typeof val === "number") {
    return val;
  }
  return undefined;
};

const productSchema = z
  .object({
    name: z.string().min(3, "O nome do produto é obrigatório."),
    description: z.string().optional(),
    price: z.preprocess(
      preprocessCurrency,
      z.number().positive("O preço deve ser um número positivo.").optional()
    ),
    categoryId: z.string().min(1, "A categoria é obrigatória."),
    discount: z.preprocess(
      (val) => (val ? Number(val) : 0),
      z.number().min(0).max(100).default(0)
    ),
    isActive: z.boolean().optional().default(true),
    isHalfHalf: z.boolean().optional().default(false),
    imageUrl: z.string().optional(),
    sizes: z
      .array(
        z.object({
          name: z.string().min(1, "O nome do tamanho é obrigatório."),
          price: z.preprocess(
            preprocessCurrency,
            z.number().positive("O preço do tamanho deve ser positivo.")
          ),
        })
      )
      .optional(),
    extras: z
      .array(
        z.object({
          name: z.string().min(1, "O nome do extra é obrigatório."),
          price: z.preprocess(
            preprocessCurrency,
            z.number().positive("O preço do extra deve ser positivo.")
          ),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validação condicional: se não há tamanhos, o preço base é obrigatório
    if (
      (!data.sizes || data.sizes.length === 0) &&
      (data.price === undefined || data.price === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message:
          "O preço base é obrigatório se o produto não tiver variações de tamanho.",
      });
    }
  });

export async function createProduct(data: ProductFormValues) {
  // Validar os dados no servidor como uma camada extra de segurança
  const validatedData = productSchema.safeParse(data);

  if (!validatedData.success) {
    throw new Error("Dados do produto inválidos.");
  }

  const {
    name,
    description,
    categoryId,
    imageUrl,
    discount,
    isHalfHalf,
    price,
    sizes,
    extras,
  } = validatedData.data;

  try {
    await db.product.create({
      data: {
        name,
        description,
        imageUrl,
        price,
        discount,
        isHalfHalf,
        categoryId,
        Size: {
          create: sizes?.map((size) => ({
            name: size.name,
            price: size.price,
          })),
        },
        Extras: {
          create: extras?.map((extra) => ({
            name: extra.name,
            price: extra.price,
          })),
        },
      },
    });

    // Revalida o path para que a tabela seja atualizada com o novo produto
    revalidatePath("/loja/produtos");
  } catch (error) {
    console.error("DATABASE_ERROR", error);
    throw new Error("Falha ao salvar o produto no banco de dados.");
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
