import { hash } from "bcrypt";
import { db as prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { registerFormSchema } from "@/lib/schemas"; // Importando o schema compartilhado

export async function POST(request: Request) {
  const body = await request.json();

  const validationResult = registerFormSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: validationResult.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password, phone } = validationResult.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso." },
        { status: 409 }
      );
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso!",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro no servidor." },
      { status: 500 }
    );
  }
}
