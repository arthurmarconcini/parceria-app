import { User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  interface User extends Pick<PrismaUser, "id" | "email" | "name" | "role"> {
    id: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: string; // Adiciona role à sessão
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string; // Adiciona role ao token
  }
}
