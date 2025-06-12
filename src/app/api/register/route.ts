import { hash } from "bcrypt";
import { db as prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { name, email, password, phone } = await request.json();

  if (!name || !email || !password || !phone) {
    return NextResponse.json(
      { error: "Nome, email, senha e telefone são obrigatórios" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
  }

  const hashedPassword = await hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
    },
  });

  return NextResponse.json(
    {
      message: "Usuário criado",

      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    },
    { status: 201 }
  );
}
