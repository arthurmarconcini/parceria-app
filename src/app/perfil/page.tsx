// src/app/perfil/page.tsx

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "./components/ProfileClient";
import { User } from "lucide-react";

export default async function ProfilePage() {
  // 1. Tenta obter a sessão do usuário
  const session = await auth();

  // 2. Verificação de segurança: Se não houver sessão, usuário, ou ID do usuário, redireciona para o login.
  // Esta é a principal barreira de proteção da página.
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 3. Busca os dados do usuário no banco de dados usando o ID da sessão.
  // Usamos 'findUnique' porque 'id' é um campo único.
  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  // 4. Se o usuário da sessão não existir no banco de dados (caso raro), redireciona por segurança.
  if (!user) {
    redirect("/login");
  }

  // 5. Busca a lista de endereços associada a este usuário.
  const addresses = await db.address.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      locality: true, // Inclui os dados da localidade (bairro) para cada endereço
    },
    orderBy: {
      isDefault: "desc", // Garante que o endereço padrão apareça primeiro na lista
    },
  });

  // 6. Se todas as verificações passaram e os dados foram buscados, renderiza a página.
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <User className="h-8 w-8" />
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
      </div>

      {/* Passa TODOS os dados necessários (user e addresses) para o componente cliente */}
      <ProfileClient user={user} />
    </div>
  );
}
