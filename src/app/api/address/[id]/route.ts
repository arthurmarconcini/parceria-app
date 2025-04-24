import { db } from "@/app/_lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await db.address.delete({
      where: { id },
    });
    return NextResponse.json(
      { message: "Endereço excluído com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir endereço:", error);
    return NextResponse.json(
      { error: "Erro ao excluir endereço" },
      { status: 500 }
    );
  }
}
