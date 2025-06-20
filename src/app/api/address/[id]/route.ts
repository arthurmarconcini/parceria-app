import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    const addressToDelete = await db.address.findUnique({
      where: { id },
    });

    if (!addressToDelete || addressToDelete.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Endereço não encontrado ou não pertence a este usuário" },
        { status: 404 }
      );
    }

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
