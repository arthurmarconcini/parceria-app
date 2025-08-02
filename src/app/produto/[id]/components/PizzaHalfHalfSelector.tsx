"use client";

import { Prisma } from "@prisma/client";
import OptionsTitle from "./OptionsTitle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import currencyFormat from "@/helpers/currency-format";
import { cn } from "@/lib/utils";

interface PizzaHalfHalfSelectorProps {
  pizzas: Prisma.ProductGetPayload<{ include: { Size: true } }>[];

  productPagePizza: Prisma.ProductGetPayload<{ include: { Size: true } }>;
  secondHalfPizzaId: string | null;
  onSecondHalfChange: (id: string | null) => void;
  selectedSizeName?: string;
  disabled?: boolean;
}

const NENHUM_SEGUNDO_SABOR_VALUE = "_NENHUM_SEGUNDO_SABOR_";

const PizzaHalfHalfSelector = ({
  pizzas,
  productPagePizza,
  secondHalfPizzaId,
  onSecondHalfChange,
  selectedSizeName,
  disabled = false,
}: PizzaHalfHalfSelectorProps) => {
  const getPriceForPizzaAndSize = (
    pizzaId: string,
    sizeName?: string
  ): number | null => {
    if (!sizeName) return null;
    const pizzaProduct = pizzas.find((p) => p.id === pizzaId);
    if (!pizzaProduct) return null;
    const sizeInfo = pizzaProduct.Size.find((s) => s.name === sizeName);
    return sizeInfo?.price ?? null;
  };

  const handleSecondHalfChange = (selectedValue: string) => {
    if (selectedValue === NENHUM_SEGUNDO_SABOR_VALUE) {
      onSecondHalfChange(null);
    } else {
      onSecondHalfChange(selectedValue);
    }
  };

  const firstHalfPrice = getPriceForPizzaAndSize(
    productPagePizza.id,
    selectedSizeName
  );

  return (
    <div className="mt-1">
      <OptionsTitle
        title="Monte sua pizza meio a meio"
        description="Escolha o segundo sabor para combinar"
      />
      <div className="space-y-4 p-4">
        <div>
          <label
            htmlFor="first-half-display"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            1º Sabor (Fixo)
          </label>
          <div
            id="first-half-display"
            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
          >
            <span>{productPagePizza.name}</span>
            {selectedSizeName && firstHalfPrice !== null && (
              <span className="font-semibold">
                {currencyFormat(firstHalfPrice)}
              </span>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="second-half-select"
            className={cn(
              "mb-1 block text-sm font-medium text-foreground",
              disabled && "text-muted-foreground"
            )}
          >
            2º Sabor
          </label>
          <Select
            value={secondHalfPizzaId || ""}
            onValueChange={handleSecondHalfChange}
            disabled={disabled || !selectedSizeName}
          >
            <SelectTrigger
              id="second-half-select"
              className="w-full"
              disabled={disabled || !selectedSizeName}
            >
              <SelectValue
                placeholder={
                  !selectedSizeName
                    ? "Selecione um tamanho primeiro"
                    : "Selecione o segundo sabor (opcional)"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NENHUM_SEGUNDO_SABOR_VALUE}>
                Nenhum (Pizza inteira do 1º sabor)
              </SelectItem>
              {pizzas
                .filter((p) => p.id !== productPagePizza.id)
                .map((pizza) => {
                  return (
                    <SelectItem
                      key={pizza.id}
                      value={pizza.id}
                      disabled={!selectedSizeName}
                    >
                      {pizza.name}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PizzaHalfHalfSelector;
