import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RestaurantCity } from "@prisma/client";
import { createAddressAction } from "@/app/actions/AddressActions";
import AddressForm from "./AddressForm";
import { AddressWithLocality, LocalityWithCity } from "./CheckoutClient";

interface AddressSelectionProps {
  addresses: AddressWithLocality[];
  setAddresses: React.Dispatch<React.SetStateAction<AddressWithLocality[]>>;
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  localities: LocalityWithCity[];
  restaurantCity: RestaurantCity;
  restaurantState: string;
}

export const AddressSelection = ({
  addresses,
  setAddresses,
  selectedAddressId,
  setSelectedAddressId,
  localities,
  restaurantCity,
  restaurantState,
}: AddressSelectionProps) => {
  const [isModalOpen, setAddressModalOpen] = useState(false);

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/address/${addressId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao excluir endereço.");

      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      if (selectedAddressId === addressId) setSelectedAddressId(null);

      toast.success("Endereço excluído com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const handleCreateAddressInModal = async (formData: FormData) => {
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

    const result = await createAddressAction(data);

    if (result.success && result.newAddress) {
      toast.success("Endereço adicionado com sucesso!");
      setAddresses((prev) => [result.newAddress, ...prev]);
      setSelectedAddressId(result.newAddress.id);
      setAddressModalOpen(false);
    } else {
      toast.error("Falha ao adicionar endereço.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Endereço de Entrega</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAddressId || ""}
          onValueChange={setSelectedAddressId}
          className="space-y-2"
        >
          {addresses.map((address) => (
            <Label
              key={address.id}
              htmlFor={address.id}
              className="flex items-center justify-between p-3 border rounded-md cursor-pointer has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <RadioGroupItem value={address.id} id={address.id} />
                <span>
                  {address.street}, {address.number} - {address.locality?.name}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteAddress(address.id);
                }}
              >
                <Trash2Icon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </Label>
          ))}
        </RadioGroup>

        <Dialog open={isModalOpen} onOpenChange={setAddressModalOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
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
              createAddress={handleCreateAddressInModal}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
