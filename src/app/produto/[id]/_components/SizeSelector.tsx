"use client";

import { Size } from "@prisma/client";
import currencyFormat from "@/helpers/currency-format";
import OptionsTitle from "./OptionsTitle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: Size[];
  selectedSize: string | undefined;
  onSizeChange: (sizeId: string) => void;
  title?: string;
  description?: string;
}

const sizeOrderMap: { [key: string]: number } = {
  BROTO: 0,
  P: 1,
  PEQUENA: 1,
  M: 2,
  MÉDIA: 2,
  MEDIA: 2,
  G: 3,
  GRANDE: 3,
  GG: 4,
  GIGA: 4,
  GIGANTE: 4,
  FAMÍLIA: 5,
  FAMILIA: 5,
};

const SizeSelector = ({
  sizes,
  selectedSize,
  onSizeChange,
  title = "Selecione o tamanho",
  description,
}: SizeSelectorProps) => {
  if (!sizes || sizes.length === 0) {
    return null;
  }

  const normalizeSizeName = (name: string): string => {
    return name
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/-/g, " ");
  };

  const sortedSizes = [...sizes].sort((a, b) => {
    const normalizedNameA = normalizeSizeName(a.name);
    const normalizedNameB = normalizeSizeName(b.name);
    const orderA = sizeOrderMap[normalizedNameA] ?? Infinity;
    const orderB = sizeOrderMap[normalizedNameB] ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    return a.price - b.price;
  });

  return (
    <div className="mt-1">
      <OptionsTitle title={title} description={description} />
      <ScrollArea className="w-full whitespace-nowrap">
        <RadioGroup
          value={selectedSize}
          onValueChange={onSizeChange}
          className="p-4 flex space-x-3 sm:grid sm:grid-cols-2 sm:space-x-0 sm:gap-3"
        >
          {sortedSizes.map((size) => (
            <Label
              key={size.id}
              htmlFor={size.id}
              className={cn(
                "flex items-center justify-between p-3 border rounded-md cursor-pointer transition-all min-w-[120px] sm:min-w-0", // Aumentado min-width para melhor visualização
                "hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50",
                selectedSize === size.id
                  ? "border-primary ring-2 ring-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div className="flex flex-col text-left">
                {" "}
                {/* Alinhado texto à esquerda */}
                <span className="font-medium text-sm text-foreground whitespace-normal">
                  {" "}
                  {/* Permitir quebra de linha */}
                  {size.name}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="font-semibold text-sm text-foreground">
                  {currencyFormat(size.price)}
                </span>
                <RadioGroupItem
                  value={size.id}
                  id={size.id}
                  className="border-primary text-primary focus-visible:ring-primary/80"
                />
              </div>
            </Label>
          ))}
        </RadioGroup>
        <ScrollBar orientation="horizontal" className="sm:hidden" />
      </ScrollArea>
    </div>
  );
};

export default SizeSelector;
