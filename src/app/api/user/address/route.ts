// src/app/api/user/address/route.ts

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const address = await db.address.findFirst({
      where: {
        userId: session.user.id,
        isDefault: true,
        isActive: true,
      },
      include: {
        locality: true, // Inclui os dados da localidade (bairro)
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Endereço padrão não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
