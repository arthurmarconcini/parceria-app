"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(credentials: {
  email: string;
  password: string;
}) {
  try {
    await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Credenciais inválidas. Verifique seu e-mail e senha.",
      };
    }

    console.error("Erro na loginAction:", error);
    return {
      success: false,
      error: "Ocorreu um erro interno. Tente novamente mais tarde.",
    };
  }
}
