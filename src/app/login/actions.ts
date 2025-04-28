"use server";

import { signIn } from "@/auth"; // Importa a função signIn do NextAuth configurado
import { AuthError } from "next-auth";

export async function loginAction(credentials: {
  email: string;
  password: string;
}) {
  try {
    // Tenta fazer o login com as credenciais fornecidas
    await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false, // Não redireciona automaticamente, deixamos o cliente lidar com isso
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Credenciais inválidas" };
    }
    return { success: false, error: "Erro interno no servidor" };
  }
}
