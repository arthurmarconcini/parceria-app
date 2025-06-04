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

interface PizzaHalfHalfProps {
  pizzas: Prisma.ProductGetPayload<{ include: { Size: true } }>[];
  firstHalf: string;
  secondHalf: string | null;
  onFirstHalfChange: (id: string) => void;
  onSecondHalfChange: (id: string | null) => void;
  selectedSizeName?: string;
}

// Use a unique constant for the "none" option to avoid conflicts
const NO_SECOND_FLAVOR_VALUE = "_NO_SECOND_FLAVOR_";

const PizzaHalfHalf = ({
  pizzas,
  firstHalf,
  secondHalf,
  onFirstHalfChange,
  onSecondHalfChange,
  selectedSizeName,
}: PizzaHalfHalfProps) => {
  const getPriceForPizzaAndSize = (
    pizza: Prisma.ProductGetPayload<{ include: { Size: true } }>,
    sizeName?: string
  ) => {
    if (!sizeName) return pizza.price;
    const size = pizza.Size.find((s) => s.name === sizeName);
    return size?.price ?? pizza.price;
  };

  const handleSecondHalfChange = (selectedValue: string) => {
    if (selectedValue === NO_SECOND_FLAVOR_VALUE) {
      onSecondHalfChange(null);
    } else {
      onSecondHalfChange(selectedValue);
    }
  };

  return (
    <div className="mt-1">
      <OptionsTitle
        title="Monte sua pizza meio a meio"
        description="Escolha os dois sabores"
      />
      <div className="p-4 space-y-4">
        <div>
          <label
            htmlFor="first-half-select"
            className="block text-sm font-medium text-foreground mb-1"
          >
            1º Sabor
          </label>
          <Select value={firstHalf} onValueChange={onFirstHalfChange}>
            <SelectTrigger id="first-half-select" className="w-full">
              <SelectValue placeholder="Selecione o primeiro sabor" />
            </SelectTrigger>
            <SelectContent>
              {pizzas.map((pizza) => (
                <SelectItem key={pizza.id} value={pizza.id}>
                  {pizza.name}
                  {selectedSizeName &&
                    getPriceForPizzaAndSize(pizza, selectedSizeName) !== null &&
                    ` - ${currencyFormat(
                      getPriceForPizzaAndSize(pizza, selectedSizeName)!
                    )}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="second-half-select"
            className="block text-sm font-medium text-foreground mb-1"
          >
            2º Sabor
          </label>
          {/* The Select's value should be an empty string to show placeholder when `secondHalf` is null.
            When `secondHalf` has a value (a pizza ID), that ID is used.
          */}
          <Select
            value={secondHalf || ""} // Use empty string for placeholder when secondHalf is null
            onValueChange={handleSecondHalfChange}
          >
            <SelectTrigger id="second-half-select" className="w-full">
              <SelectValue placeholder="Selecione o segundo sabor (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {/* This item allows the user to explicitly choose "no second flavor",
                which translates to setting secondHalf to null.
              */}
              <SelectItem value={NO_SECOND_FLAVOR_VALUE}>
                Nenhum (Pizza inteira do 1º sabor)
              </SelectItem>
              {pizzas
                .filter((p) => p.id !== firstHalf)
                .map((pizza) => (
                  <SelectItem key={pizza.id} value={pizza.id}>
                    {pizza.name}
                    {selectedSizeName &&
                      getPriceForPizzaAndSize(pizza, selectedSizeName) !==
                        null &&
                      ` - ${currencyFormat(
                        getPriceForPizzaAndSize(pizza, selectedSizeName)!
                      )}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
export default PizzaHalfHalf;
