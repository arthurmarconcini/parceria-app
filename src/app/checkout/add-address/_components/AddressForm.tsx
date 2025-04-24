"use client";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { useState } from "react";

interface Locality {
  id: string;
  name: string;
  deliveryFee: number;
}

interface FormState {
  zipCode: string;
  street: string;
  number: string;
  state: string;
  localityId: string;
  error: string | null;
}

interface AddressFormProps {
  restaurantCity: { id: string; name: string };
  localities: Locality[];
  createAddress: (formData: FormData) => Promise<void>;
}

const isValidBrazilianZipCode = (zipCode: string): boolean => {
  const cleanedZipCode = zipCode.replace(/\D/g, "");
  const zipCodeRegex = /^[0-9]{8}$/;
  return zipCodeRegex.test(cleanedZipCode);
};

export default function AddressForm({
  restaurantCity,
  localities,
  createAddress,
}: AddressFormProps) {
  const [formState, setFormState] = useState<FormState>({
    zipCode: "",
    street: "",
    number: "",
    state: "",
    localityId: "",
    error: null,
  });

  const handleZipCodeChange = async (zipCode: string) => {
    setFormState((prev) => ({ ...prev, zipCode, error: null }));

    if (!isValidBrazilianZipCode(zipCode)) {
      setFormState((prev) => ({
        ...prev,
        error: "CEP inválido. Deve conter 8 dígitos (ex.: 12345-678).",
      }));
      return;
    }

    try {
      const cleanedZipCode = zipCode.replace(/\D/g, "");
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanedZipCode}/json/`
      );
      const data = await response.json();

      if (data.erro) {
        setFormState((prev) => ({
          ...prev,
          error: "CEP não encontrado.",
          street: "",
          state: "",
          localityId: "",
        }));
        return;
      }

      // Verifica se a cidade retornada é a mesma do restaurante
      if (data.localidade !== restaurantCity.name) {
        setFormState((prev) => ({
          ...prev,
          error: `Entregas são permitidas apenas em ${restaurantCity.name}.`,
          street: "",
          state: "",
          localityId: "",
        }));
        return;
      }

      // Busca a localidade correspondente ao bairro retornado
      const matchingLocality = localities.find(
        (locality) => locality.name.toLowerCase() === data.bairro.toLowerCase()
      );

      setFormState((prev) => ({
        ...prev,
        street: data.logradouro || "",
        state: data.uf || "",
        localityId: matchingLocality?.id || "",
        error: matchingLocality
          ? null
          : "Bairro não atendido pelo restaurante.",
      }));
    } catch (error) {
      console.error("Erro ao consultar o CEP:", error);
      setFormState((prev) => ({
        ...prev,
        error: "Erro ao consultar o CEP. Tente novamente.",
        street: "",
        state: "",
        localityId: "",
      }));
    }
  };

  return (
    <form action={createAddress}>
      {formState.error && (
        <p className="text-red-500 mb-4">{formState.error}</p>
      )}
      <div className="space-y-4">
        <div>
          <Label>CEP</Label>
          <Input
            name="zipCode"
            value={formState.zipCode}
            onChange={(e) => handleZipCodeChange(e.target.value)}
          />
        </div>
        <div>
          <Label>Rua</Label>
          <Input
            name="street"
            value={formState.street}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, street: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <Label>Número</Label>
          <Input
            name="number"
            value={formState.number}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, number: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <Label>Cidade</Label>
          <Input
            name="city"
            value={restaurantCity.name}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <Label>Localidade (Bairro)</Label>
          <Select
            name="localityId"
            value={formState.localityId}
            onValueChange={(value) =>
              setFormState((prev) => ({ ...prev, localityId: value }))
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um bairro" />
            </SelectTrigger>
            <SelectContent>
              {localities.map((locality) => (
                <SelectItem key={locality.id} value={locality.id}>
                  {locality.name} (Frete: R$ {locality.deliveryFee.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Estado</Label>
          <Input
            name="state"
            value={formState.state}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, state: e.target.value }))
            }
          />
        </div>
        <Button type="submit">Salvar Endereço</Button>
      </div>
    </form>
  );
}
