import { User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  interface User
    extends Pick<PrismaUser, "id" | "email" | "name" | "role" | "phone"> {
    id: string;
    role?: string;
    name?: string | null;
    email: string | null;
    phone: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string | null;
      name?: string | null;
      role?: string;
      phone?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    name?: string | null;
    email: string | null;
    phone?: string | null;
  }
}
