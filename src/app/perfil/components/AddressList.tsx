"use client";

import { AddressWithLocality } from "./ProfileClient";
import { AddressCard } from "./AddressCard";
import { setDefaultAddressAction } from "../actions/PerfilActions";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddressListProps {
  addresses: AddressWithLocality[];
  onAddressDeleted: (deletedAddressId: string) => void;
  onDefaultAddressSet: (updatedAddresses: AddressWithLocality[]) => void;
}

export const AddressList = ({
  addresses,
  onAddressDeleted,
  onDefaultAddressSet,
}: AddressListProps) => {
  const handleSetDefault = async (addressId: string) => {
    const result = await setDefaultAddressAction(addressId);
    if (result.success && result.addresses) {
      toast.success("Endereço padrão atualizado!");
      onDefaultAddressSet(result.addresses as AddressWithLocality[]);
    } else {
      toast.error(result.error || "Falha ao atualizar o endereço padrão.");
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-10 border-dashed border-2 rounded-lg">
        <p className="text-muted-foreground">
          Você ainda não tem endereços cadastrados.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[450px] pr-4">
      <div className="space-y-4">
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onSetDefault={handleSetDefault}
            onAddressDeleted={onAddressDeleted}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
