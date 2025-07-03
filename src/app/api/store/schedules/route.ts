import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const operatingHours = await db.operatingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  const settings = await db.storeSettings.findFirst();

  return NextResponse.json({ operatingHours, settings });
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { operatingHours, isTemporarilyClosed } = await request.json();

  try {
    // Transação para atualizar tudo de uma vez
    await db.$transaction(async (tx) => {
      for (const hour of operatingHours) {
        await tx.operatingHours.upsert({
          where: { dayOfWeek: hour.dayOfWeek },
          update: {
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
          create: {
            dayOfWeek: hour.dayOfWeek,
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
        });
      }

      // Atualiza as configurações da loja
      const settings = await tx.storeSettings.findFirst();
      if (settings) {
        await tx.storeSettings.update({
          where: { id: settings.id },
          data: { isTemporarilyClosed },
        });
      } else {
        await tx.storeSettings.create({
          data: { isTemporarilyClosed },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Horários atualizados com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao atualizar horários:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar horários" },
      { status: 500 }
    );
  }
}
