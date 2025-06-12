import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const localities = await db.locality.findMany({
      include: {
        city: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const response = localities.map((loc) => ({
      ...loc,
      state: "ES",
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
