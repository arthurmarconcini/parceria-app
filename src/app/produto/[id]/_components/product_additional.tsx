"use client";

import { Button } from "@/components/ui/button";
import currencyFormat from "@/helpers/currency-format";
import { Prisma } from "@prisma/client";
import { MinusIcon, PlusIcon } from "lucide-react";
import OptionsTitle from "./options_title";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex flex-col gap-4">
        <div className="flex-1">
          <OptionsTitle
            title="Deseja adicionar algum ingrediente?"
            description="Escolha os ingredientes"
          />

          {product.Extras.length === 0 ? (
            <div className="p-6 flex items-center justify-center">
              <h1 className="text-sm font-semibold">
                Este produto não possui nenhuma opção de adicional
              </h1>
            </div>
          ) : (
            <div>
              {product.Extras.map((extra) => (
                <div
                  key={extra.id}
                  className="flex justify-between items-center p-4 border-b border-b-muted"
                >
                  <div>
                    <h1 className="text-sm ">{`Adicionar: ${extra.name}`}</h1>
                    <p className="text-xs text-muted-foreground">{`+ ${currencyFormat(
                      extra.price
                    )}`}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExtraDecrement(extra.id)}
                      disabled={extrasQuantities[extra.id] === 0}
                    >
                      <MinusIcon
                        size={16}
                        color={
                          extrasQuantities[extra.id] > 0 ? "orange" : "gray"
                        }
                      />
                    </Button>

                    <span className="w-8 text-center text-sm">
                      {extrasQuantities[extra.id]}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExtraIncrement(extra.id)}
                      disabled={extrasQuantities[extra.id] >= 10}
                    >
                      <PlusIcon
                        size={16}
                        color={
                          extrasQuantities[extra.id] < 10 ? "orange" : "gray"
                        }
                      />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductAdditionals;
