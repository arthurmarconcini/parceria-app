// Arquivo: src/app/loja/page.tsx
import { auth } from "@/auth"; // Importa a função auth do NextAuth
import { redirect } from "next/navigation"; // Importa a função redirect do Next.js

// Este é um Server Component que será executado no servidor.
export default async function LojaPage() {
  const session = await auth(); // Obtém a sessão atual do usuário

  // Verifica se o usuário está logado e qual o seu perfil
  if (session && session.user) {
    // Usuário está logado
    if (session.user.role === "ADMIN" || session.user.role === "CASHIER") {
      // Se for ADMIN ou CASHIER, redireciona para o painel de gestão
      redirect("/loja/gestor");
    } else {
      // Se for qualquer outro perfil (ex: "USER"), redireciona para a página inicial
      redirect("/");
    }
  } else {
    // Usuário não está logado, redireciona para a página inicial
    redirect("/");
  }

  // Como o componente sempre redirecionará, ele não renderizará nenhum JSX.
  // Retornar null é uma prática comum para componentes que apenas executam lógica de servidor.
  return null;
}
