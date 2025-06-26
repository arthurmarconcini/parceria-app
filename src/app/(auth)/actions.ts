"use server";

import { z } from "zod";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import { db } from "@/lib/prisma";
import { transporter } from "@/lib/nodemailer";
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

export async function requestPasswordResetAction(email: string) {
  if (!email) {
    return { success: false, error: "O campo de e-mail é obrigatório." };
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return {
      success: false,
      error: "Nenhum usuário encontrado com este e-mail.",
    };
  }

  const token = nanoid();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // Expira em 1 hora

  await db.passwordResetToken.deleteMany({ where: { email } });

  await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;

  try {
    console.log("Link de redefinição gerado:", resetLink);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Redefinição de Senha - Parceria App",
      html: `
        <h1>Redefinição de Senha</h1>
        <p>Olá ${user.name || ""},</p>
        <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetLink}" style="background-color: #fccf04; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Redefinir Senha</a>
        <p>Este link expirará em 1 hora.</p>
        <p>Se você não solicitou isso, por favor ignore este e-mail.</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar e-mail de redefinição:", error);
    return { success: false, error: "Não foi possível enviar o e-mail." };
  }
}

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export async function resetPasswordAction(token: string, formData: FormData) {
  const data = Object.fromEntries(formData);
  const validation = resetPasswordSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  const { password } = validation.data;

  const resetToken = await db.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || new Date() > resetToken.expires) {
    return { success: false, error: "Token inválido ou expirado." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({ where: { id: resetToken.id } });

  return { success: true };
}
