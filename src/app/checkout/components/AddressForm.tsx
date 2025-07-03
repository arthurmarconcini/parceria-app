"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";

interface Locality {
  id: string;
  name: string;
  deliveryFee: number;
}

interface FormState {
  zipCode: string;
  street: string;
  number: string;
  localityId: string;
  reference: string;
  observation: string;
  error: string | null;
}

interface AddressFormProps {
  restaurantCity: { id: string; name: string };
  restaurantState: string;
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
  restaurantState,
  localities,
  createAddress,
}: AddressFormProps) {
  const [formState, setFormState] = useState<FormState>({
    zipCode: "",
    street: "",
    number: "",
    localityId: "",
    reference: "",
    observation: "",
    error: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleZipCodeChange = (zipCode: string) => {
    setFormState((prev) => ({ ...prev, zipCode, error: null }));
  };

  useEffect(() => {
    if (!formState.zipCode || !isValidBrazilianZipCode(formState.zipCode)) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchAddress = async () => {
      try {
        const cleanedZipCode = formState.zipCode.replace(/\D/g, "");
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanedZipCode}/json/`,
          { signal }
        );
        const data = await response.json();

        if (signal.aborted) {
          return;
        }

        if (data.erro) {
          setFormState((prev) => ({
            ...prev,
            error: "CEP não encontrado.",
            street: "",
            localityId: "",
          }));
          return;
        }

        if (data.localidade !== restaurantCity.name) {
          setFormState((prev) => ({
            ...prev,
            error: `Entregas são permitidas apenas em ${restaurantCity.name}.`,
            street: "",
            localityId: "",
          }));
          return;
        }

        const matchingLocality = localities.find(
          (locality) =>
            locality.name.toLowerCase() === data.bairro.toLowerCase()
        );

        setFormState((prev) => ({
          ...prev,
          street: data.logradouro || "",
          localityId: matchingLocality?.id || "",
          error: matchingLocality
            ? null
            : "Bairro não atendido pelo restaurante.",
        }));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Erro ao consultar o CEP:", error);
          setFormState((prev) => ({
            ...prev,
            error: "Erro ao consultar o CEP. Tente novamente.",
          }));
        }
      }
    };

    fetchAddress();

    return () => {
      controller.abort();
    };
  }, [formState.zipCode, localities, restaurantCity.name]);
  const handleSave = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("street", formState.street);
    formData.append("number", formState.number);
    formData.append("zipCode", formState.zipCode);
    formData.append("localityId", formState.localityId);
    formData.append("reference", formState.reference);
    formData.append("observation", formState.observation);

    formData.append("city", restaurantCity.name);
    formData.append("state", restaurantState);

    try {
      await createAddress(formData);
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={formRef} className="space-y-4">
      {formState.error && (
        <p className="text-red-500 mb-4">{formState.error}</p>
      )}
      <div className="space-y-1">
        <Label>CEP (opcional)</Label>
        <Input
          name="zipCode"
          value={formState.zipCode}
          onChange={(e) => handleZipCodeChange(e.target.value)}
          placeholder="Ex.: 12345-678"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1 col-span-2">
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
        <div className="space-y-1 ">
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
      </div>
      <div className="flex gap-2">
        <div className="space-y-1">
          <Label>Cidade</Label>
          <Input
            name="city"
            value={restaurantCity.name}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Input
            name="state"
            value={restaurantState}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>
      <div className="space-y-1">
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
      <div className="space-y-1">
        <Label>Referência (opcional)</Label>
        <Input
          name="reference"
          value={formState.reference}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, reference: e.target.value }))
          }
          placeholder="Ex.: fundos, portão preto"
        />
      </div>
      <div className="space-y-1">
        <Label>Observações (opcional)</Label>
        <Input
          name="observation"
          value={formState.observation}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, observation: e.target.value }))
          }
          placeholder="Ex.: apertar campainha, entregar ao porteiro"
        />
      </div>
      <Button type="button" onClick={handleSave} disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar Endereço"}
      </Button>
    </div>
  );
}
