import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db as prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

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
        // Verificar se as credenciais estão presentes
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios.");
        }

        // Buscar o usuário pelo email
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Se o usuário não existir ou a senha não bater
        if (!user || !user.password) {
          throw new Error("Credenciais inválidas.");
        }

        // Comparar a senha fornecida com o hash armazenado
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Credenciais inválidas.");
        }

        // Retornar o usuário se tudo estiver correto
        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login", // Define a página de login customizada
  },
  callbacks: {
    async jwt({ token, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string | null | undefined; // Assegure a consistência de tipo com next-auth.d.ts
        session.user.email = token.email as string; // Assegure a consistência de tipo com next-auth.d.ts// Adiciona o role à sessão
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // Necessário para usar JWT com callbacks personalizados,
  },
});
