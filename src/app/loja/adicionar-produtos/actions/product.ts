"use server";

import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface SizeInput {
  name: string;
  price: number;
}

interface FormData {
  name: string;
  price: number | null;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
  discount: number | null;
  isHalfHalf: boolean;
  sizes: SizeInput[];
}

interface AddProductResult {
  success: boolean;
  error?: string;
}

const addProduct = async (formData: FormData): Promise<AddProductResult> => {
  // Validação dos dados
  if (!formData.name.trim()) {
    return { success: false, error: "O nome do produto é obrigatório." };
  }
  if (!formData.categoryId) {
    return { success: false, error: "A categoria é obrigatória." };
  }

  try {
    // Verificar se a categoria existe e se é "Pizzas"
    const category = await db.category.findUnique({
      where: { id: formData.categoryId },
    });
    if (!category) {
      return { success: false, error: "Categoria não encontrada." };
    }
    const isPizzaCategory = category.name.toLowerCase() === "pizzas";

    // Validar preço do produto
    if (isPizzaCategory) {
      if (formData.price !== null) {
        return {
          success: false,
          error:
            "O preço do produto deve ser nulo para pizzas, pois os preços são definidos pelos tamanhos.",
        };
      }
    } else {
      if (
        formData.price === null ||
        isNaN(formData.price) ||
        formData.price <= 0
      ) {
        return {
          success: false,
          error: "O preço do produto é obrigatório e deve ser maior que zero.",
        };
      }
    }

    // Validar desconto
    if (
      formData.discount !== null &&
      (isNaN(formData.discount) || formData.discount < 0)
    ) {
      return { success: false, error: "Desconto inválido." };
    }

    // Validar tamanhos para pizzas
    if (isPizzaCategory) {
      if (formData.sizes.length === 0) {
        return {
          success: false,
          error: "Pelo menos um tamanho é obrigatório para pizzas.",
        };
      }
      for (const size of formData.sizes) {
        if (!size.name.trim()) {
          return { success: false, error: "O nome do tamanho é obrigatório." };
        }
        if (isNaN(size.price) || size.price <= 0) {
          return {
            success: false,
            error: "O preço do tamanho deve ser maior que zero.",
          };
        }
      }
    } else if (formData.sizes.length > 0) {
      return {
        success: false,
        error: "Tamanhos só podem ser fornecidos para a categoria Pizzas.",
      };
    }

    // Criar o produto
    const product = await db.product.create({
      data: {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        imageUrl: formData.imageUrl,
        category: {
          connect: { id: formData.categoryId },
        },
        discount: formData.discount,
        isHalfHalf: formData.isHalfHalf,
      },
    });

    // Criar tamanhos, se fornecidos
    if (isPizzaCategory && formData.sizes.length > 0) {
      await db.size.createMany({
        data: formData.sizes.map((size) => ({
          name: size.name,
          price: size.price,
          productId: product.id,
        })),
      });
    }

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
      error: "Erro ao criar o produto. Tente novamente.",
    };
  }
};

const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await db.product.update({
      where: { id },
      data: { isActive: false },
    });
    return true;
  } catch (error) {
    console.error("Erro ao arquivar produto:", error);
    return false;
  }
};

export { addProduct, deleteProduct };
