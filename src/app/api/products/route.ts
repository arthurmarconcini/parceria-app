// app/api/products/route.ts
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
// Certifique-se de configurar o Prisma em lib/prisma.ts

export async function POST(request: Request) {
  const { productIds } = await request.json(); // Recebe uma lista de productIds

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json(
      { error: "Nenhum productId fornecido" },
      { status: 400 }
    );
  }

  try {
    const products = await db.product.findMany({
      where: {
        id: { in: productIds }, // Busca produtos com base nos IDs
      },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}
