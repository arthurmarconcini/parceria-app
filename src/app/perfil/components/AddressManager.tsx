"use client";

import { Locality, RestaurantCity } from "@prisma/client";
import { AddressList } from "./AddressList";
import { AddressFormModal } from "./AddressFormModal";
import { useState } from "react";
import { createAddressAction } from "@/app/actions/AddressActions";
import { toast } from "sonner";
import { AddressWithLocality } from "./ProfileClient";

interface AddressManagerProps {
  addresses: AddressWithLocality[];
  localities: Locality[];
  restaurantCity: RestaurantCity | null;
  restaurantState: string;
  onAddressAdded: (newAddress: AddressWithLocality) => void;
  onAddressDeleted: (deletedAddressId: string) => void;
  onDefaultAddressSet: (updatedAddresses: AddressWithLocality[]) => void;
}

export const AddressManager = ({
  addresses,
  localities,
  restaurantCity,
  restaurantState,
  onAddressAdded,
  onAddressDeleted,
  onDefaultAddressSet,
}: AddressManagerProps) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleCreateAddress = async (formData: FormData) => {
    const data = {
      street: formData.get("street") as string,
      number: formData.get("number") as string,
      zipCode: formData.get("zipCode") as string | null,
      localityId: formData.get("localityId") as string,
      reference: formData.get("reference") as string | null,
      observation: formData.get("observation") as string | null,
      city: restaurantCity?.name || "",
      state: restaurantState,
    };

    try {
      const result = await createAddressAction(data);
      if (result.success && result.newAddress) {
        toast.success("Endereço adicionado com sucesso!");
        onAddressAdded(result.newAddress as AddressWithLocality);
        setModalOpen(false);
      } else {
        toast.error("Falha ao adicionar endereço.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro desconhecido."
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Meus Endereços</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus endereços de entrega.
          </p>
        </div>
        {restaurantCity && (
          <AddressFormModal
            open={isModalOpen}
            onOpenChange={setModalOpen}
            localities={localities}
            restaurantCity={restaurantCity}
            restaurantState={restaurantState}
            createAddress={handleCreateAddress}
          />
        )}
      </div>
      <AddressList
        addresses={addresses}
        onAddressDeleted={onAddressDeleted}
        onDefaultAddressSet={onDefaultAddressSet}
      />
    </div>
  );
};
