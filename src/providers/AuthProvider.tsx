"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Session } from "next-auth";

type AuthProviderProps = {
  children: ReactNode;
  session?: Session | null; // Adicionamos a prop de sessão
};

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // Revalida a sessão a cada 5 minutos
      refetchOnWindowFocus={true} // Atualiza ao focar na janela
    >
      {children}
    </SessionProvider>
  );
}
