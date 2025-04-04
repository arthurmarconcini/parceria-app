"use client";

import { Button } from "@/app/_components/ui/button";
import currencyFormat from "@/app/_helpers/currency-format";
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
  onExtraQuantityChange: (extraId: string, quanttity: number) => void;
}

const ProductAdditionals = ({
  product,
  extrasQuantities,
  onExtraQuantityChange,
}: ProductAdditionalsProps) => {
  const handleExtraIncrement = (extraId: string) => {
    if (extrasQuantities[extraId] > 9) return;

    onExtraQuantityChange(extraId, extrasQuantities[extraId] + 1);
  };

  const handleExtraDecrement = (extraId: string) => {
    if (extrasQuantities[extraId] === 0) return;

    onExtraQuantityChange(extraId, extrasQuantities[extraId] - 1);
  };

  /* const handleAddToCart = () => {
    const cartItem: CartItem = {
      name: product.name,
      productId: product.id,
      quantity: quantity,
      imageUrl: product.imageUrl || "",
      observation: observations,
      priceAtTime: product.price,
      orderExtras: product.Extras.filter(
        (extra) => extrasQuantities[extra.id] > 0
      ) // Filtra apenas extras com quantidade > 0
        .map((extra) => ({
          name: extra.name,
          extraId: extra.id,
          quantity: extrasQuantities[extra.id],
          priceAtTime: extra.price,
        })),
    };

    addToCart(cartItem);

    console.log(cart);

    // Reseta os valores após adicionar ao carrinho
    setQuantity(1);
    setExtrasQuantities(
      product.Extras.reduce((acc, extra) => ({ ...acc, [extra.id]: 0 }), {})
    );
    setObservations(""); // Opcional: resetar as observações também
  };
 */
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex flex-col gap-4">
        <div className="flex-1">
          <OptionsTitle
            title="Deseja adicionar algum ingrediente?"
            description="Escolha os ingredientes"
          />

          <div>
            {product.Extras.map((extra) => (
              <div
                key={extra.id}
                className="flex justify-between items-center p-4 border-b border-b-muted"
              >
                <div>
                  <p className="text-sm font-semibold">{`Adicionar: ${extra.name}`}</p>
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
                      color={`${
                        extrasQuantities[extra.id] > 0 ? "orange" : "gray"
                      }`}
                    />
                  </Button>

                  <span className="w-8 text-center">
                    {extrasQuantities[extra.id]}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExtraIncrement(extra.id)}
                    disabled={extrasQuantities[extra.id] === 10}
                  >
                    <PlusIcon
                      size={16}
                      color={`${
                        extrasQuantities[extra.id] < 10 ? "orange" : "gray"
                      }`}
                    />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAdditionals;
