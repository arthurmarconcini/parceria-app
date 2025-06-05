// src/auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db as prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@email.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios.");
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          throw new Error("Credenciais inválidas.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Credenciais inválidas.");
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // O callback 'jwt' é chamado sempre que um JSON Web Token é criado ou atualizado.
    async jwt({ token, user, trigger, session }) {
      // 1. No momento do login inicial, o objeto 'user' é passado.
      if (user) {
        token.id = user.id;
        token.role = (user as User).role; // Adiciona a role do usuário ao token
      }

      // 2. Se a sessão for atualizada (ex: pelo hook useSession().update()),
      // o 'trigger' será "update" e os dados da 'session' são passados.
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      return token;
    },
    // O callback 'session' é chamado sempre que uma sessão é acessada.
    // Ele usa os dados do token para construir o objeto da sessão.
    session: async ({ session, token }) => {
      // 3. Garante que os dados do token (agora com id e role) sejam passados para o objeto da sessão.
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
