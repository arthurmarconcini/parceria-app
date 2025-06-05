// src/app/perfil/_components/ProfileClient.tsx
import { Prisma, User } from "@prisma/client";
import { ProfileForm } from "./ProfileForm";

export type AddressWithLocality = Prisma.AddressGetPayload<{
  include: {
    locality: true;
  };
}>;

interface ProfileClientProps {
  user: User;
}

export const ProfileClient = ({ user }: ProfileClientProps) => {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <h2 className="text-xl font-semibold">Dados Pessoais</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie suas informações de contato.
        </p>
        <ProfileForm user={user} />
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold">Meus Endereços</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Gerencie seus endereços de entrega e faturamento.
        </p>
        {/* Adicione o componente de gerenciamento de endereços aqui */}
      </div>
    </div>
  );
};
