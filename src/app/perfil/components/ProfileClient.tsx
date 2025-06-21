"use client";

import { Prisma, User, Locality, RestaurantCity } from "@prisma/client";
import { ProfileForm } from "./ProfileForm";
import { AddressManager } from "./AddressManager";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type AddressWithLocality = Prisma.AddressGetPayload<{
  include: {
    locality: true;
  };
}>;

interface ProfileClientProps {
  user: User;
  addresses: AddressWithLocality[];
  localities: Locality[];
  restaurantCity: RestaurantCity | null;
  restaurantState: string;
}

export const ProfileClient = ({
  user: initialUser,
  addresses: initialAddresses,
  localities,
  restaurantCity,
  restaurantState,
}: ProfileClientProps) => {
  const [user, setUser] = useState(initialUser);
  const [addresses, setAddresses] = useState(initialAddresses);
  const router = useRouter();

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleAddressAdded = (newAddress: AddressWithLocality) => {
    // Coloca o novo endereço (que é o padrão) no início da lista
    setAddresses((prev) => [
      newAddress,
      ...prev.map((ad) => ({ ...ad, isDefault: false })),
    ]);
    router.refresh();
  };

  const handleAddressDeleted = (deletedAddressId: string) => {
    setAddresses((prev) => prev.filter((ad) => ad.id !== deletedAddressId));
    router.refresh();
  };

  const handleDefaultAddressSet = (updatedAddresses: AddressWithLocality[]) => {
    setAddresses(updatedAddresses);
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <h2 className="text-xl font-semibold">Dados Pessoais</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie suas informações de contato.
        </p>
        <ProfileForm user={user} onProfileUpdate={handleProfileUpdate} />
      </div>

      <div className="lg:col-span-2">
        <AddressManager
          addresses={addresses}
          localities={localities}
          restaurantCity={restaurantCity}
          restaurantState={restaurantState}
          onAddressAdded={handleAddressAdded}
          onAddressDeleted={handleAddressDeleted}
          onDefaultAddressSet={handleDefaultAddressSet}
        />
      </div>
    </div>
  );
};
