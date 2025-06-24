"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddressForm from "@/app/checkout/components/AddressForm";
import { Locality, RestaurantCity } from "@prisma/client";
import { PlusCircle } from "lucide-react";

interface AddressFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localities: Locality[];
  restaurantCity: RestaurantCity;
  restaurantState: string;
  createAddress: (formData: FormData) => Promise<void>;
}

export const AddressFormModal = ({
  open,
  onOpenChange,
  localities,
  restaurantCity,
  restaurantState,
  createAddress,
}: AddressFormModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Novo Endereço
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Endereço</DialogTitle>
        </DialogHeader>
        <AddressForm
          localities={localities}
          restaurantCity={restaurantCity}
          restaurantState={restaurantState}
          createAddress={createAddress}
        />
      </DialogContent>
    </Dialog>
  );
};
