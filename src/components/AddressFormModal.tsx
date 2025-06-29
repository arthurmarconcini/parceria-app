// src/app/perfil/components/AddressFormModal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Importe a nova action
import { toast } from "sonner";
import { Locality } from "@prisma/client";
import { createAddressAction } from "@/actions/AddressActions";
import AddressForm from "@/app/checkout/components/AddressForm";

// Props para carregar dados necessários para o formulário
interface AddressFormModalProps {
  localities: Locality[];
  restaurantCity: { id: string; name: string };
  restaurantState: string;
}

export const AddressFormModal = ({
  localities,
  restaurantCity,
  restaurantState,
}: AddressFormModalProps) => {
  const [open, setOpen] = useState(false);

  const handleCreateAddress = async (formData: FormData) => {
    const data = {
      street: formData.get("street") as string,
      number: formData.get("number") as string,
      zipCode: formData.get("zipCode") as string | null,
      localityId: formData.get("localityId") as string,
      reference: formData.get("reference") as string | null,
      observation: formData.get("observation") as string | null,
      city: restaurantCity.name,
      state: restaurantState,
    };

    try {
      await createAddressAction(data); // Chama a action centralizada
      toast.success("Endereço adicionado com sucesso!");
      setOpen(false); // Fecha o modal após o sucesso
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao adicionar endereço."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Novo Endereço</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Endereço</DialogTitle>
        </DialogHeader>
        <AddressForm
          localities={localities}
          restaurantCity={restaurantCity}
          restaurantState={restaurantState}
          // Note que não estamos mais passando a action diretamente
          // O AddressForm precisa ser ligeiramente ajustado para chamar um `onSubmit` genérico
          createAddress={handleCreateAddress}
        />
      </DialogContent>
    </Dialog>
  );
};
