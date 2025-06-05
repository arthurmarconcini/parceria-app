"use client";

import { Button } from "@/components/ui/button";
import currencyFormat from "@/helpers/currency-format";
import { Prisma } from "@prisma/client";
import { MinusIcon, PlusIcon } from "lucide-react";
import OptionsTitle from "./OptionsTitle";

interface ProductAdditionalsProps {
  product: Prisma.ProductGetPayload<{
    include: {
      Extras: true;
    };
  }>;
  extrasQuantities: { [key: string]: number };
  onExtraQuantityChange: (extraId: string, quantity: number) => void;
}

const ProductAdditionals = ({
  product,
  extrasQuantities,
  onExtraQuantityChange,
}: ProductAdditionalsProps) => {
  const handleExtraIncrement = (extraId: string) => {
    if (extrasQuantities[extraId] >= 10) return;
    onExtraQuantityChange(extraId, extrasQuantities[extraId] + 1);
  };

  const handleExtraDecrement = (extraId: string) => {
    if (extrasQuantities[extraId] <= 0) return;
    onExtraQuantityChange(extraId, extrasQuantities[extraId] - 1);
  };

  if (!product.Extras || product.Extras.length === 0) {
    return null;
  }

  return (
    <div>
      <OptionsTitle
        title="Turbine seu pedido!"
        description="Adicione mais sabor com nossos extras."
      />
      <div className="divide-y divide-border">
        {product.Extras.map((extra) => (
          <div
            key={extra.id}
            className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex-1 pr-2">
              <h1 className="text-sm font-medium text-foreground">
                {extra.name}
              </h1>
              <p className="text-xs text-primary font-semibold">{`+ ${currencyFormat(
                extra.price
              )}`}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full border-muted-foreground/50 hover:border-primary hover:bg-primary/10"
                onClick={() => handleExtraDecrement(extra.id)}
                disabled={extrasQuantities[extra.id] === 0}
                aria-label={`Diminuir quantidade de ${extra.name}`}
              >
                <MinusIcon
                  size={16}
                  className={
                    extrasQuantities[extra.id] > 0
                      ? "text-primary"
                      : "text-muted-foreground/70"
                  }
                />
              </Button>

              <span className="w-6 text-center text-sm font-medium text-foreground">
                {extrasQuantities[extra.id]}
              </span>

              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full border-muted-foreground/50 hover:border-primary hover:bg-primary/10"
                onClick={() => handleExtraIncrement(extra.id)}
                disabled={extrasQuantities[extra.id] >= 10}
                aria-label={`Aumentar quantidade de ${extra.name}`}
              >
                <PlusIcon
                  size={16}
                  className={
                    extrasQuantities[extra.id] < 10
                      ? "text-primary"
                      : "text-muted-foreground/70"
                  }
                />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductAdditionals;
