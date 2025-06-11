import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const localities = await db.locality.findMany({
      include: {
        // Inclui o modelo 'RestaurantCity' relacionado
        city: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Mapeia o resultado para adicionar o 'state' se necessário,
    // mantendo a lógica centralizada no backend.
    const response = localities.map((loc) => ({
      ...loc,
      state: "ES", // Assumindo "ES" como estado fixo para todas as cidades, ajuste se necessário.
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar localidades:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar as áreas de entrega." },
      { status: 500 }
    );
  }
}
