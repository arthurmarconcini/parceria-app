"use client";
import { Button } from "@/app/_components/ui/button";
import { Textarea } from "@/app/_components/ui/textarea";
import currencyFormat from "@/app/_helpers/currency-format";
import { CartItem, useCartStore } from "@/app/_hooks/cartStore";
import { Prisma } from "@prisma/client";
import { MessageCircleMoreIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

interface ProductAdditionalsProps {
  product: Prisma.ProductGetPayload<{
    include: {
      Extras: true;
    };
  }>;
}

const ProductAdditionals = ({ product }: ProductAdditionalsProps) => {
  const [extrasQuantities, setExtrasQuantities] = useState<{
    [key: string]: number;
  }>(
    product.Extras.reduce(
      (acc, extra) => ({
        ...acc,
        [extra.id]: 0,
      }),
      {}
    )
  );
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");

  const { cart, addToCart } = useCartStore();

  const calculateTotal = () => {
    const total = product.Extras.reduce((acc, extra) => {
      return acc + extra.price * extrasQuantities[extra.id];
    }, 0);

    return quantity * (total + product.price);
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleExtraIncrement = (extraId: string) => {
    if (extrasQuantities[extraId] > 9) return;

    setExtrasQuantities({
      ...extrasQuantities,
      [extraId]: extrasQuantities[extraId] + 1,
    });
  };

  const handleExtraDecrement = (extraId: string) => {
    if (extrasQuantities[extraId] === 0) return;

    setExtrasQuantities({
      ...extrasQuantities,
      [extraId]: extrasQuantities[extraId] - 1,
    });
  };

  const handleObservationsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (e.target.value.length > 140) return;
    setObservations(e.target.value);
  };

  const handleAddToCart = () => {
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

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex flex-col gap-4">
        <div className="flex-1">
          <div className="bg-muted p-4">
            <h1 className="text-sm">Deseja adicionar algum ingrediente?</h1>
            <p className="text-xs text-muted-foreground">
              Escolha ate x opcoes
            </p>
          </div>
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
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <MessageCircleMoreIcon size={16} />
              <p className="text-sm">Alguma observação ?</p>
            </div>

            <span className="text-sm">{`${observations.length} / 140`}</span>
          </div>
          <Textarea
            className="text-sm text-muted-foreground focus-visible:ring-chart-5 focus-visible:border-chart-5 focus:border-chart-5"
            placeholder="Ex: tirar a cebola, maionese a parte etc..."
            value={observations}
            onChange={(e) => handleObservationsChange(e)}
          />
        </div>
      </div>
      <div className="fixed bottom-0 right-0 z-50 w-full bg-muted">
        <div className="flex gap-4 p-4">
          <div className="flex gap-2 items-center">
            <Button onClick={handleDecrement} variant="outline">
              -
            </Button>
            <div className="w-6 text-center">
              <span>{quantity}</span>
            </div>

            <Button onClick={handleIncrement} variant="outline">
              +
            </Button>
          </div>
          <Button
            onClick={handleAddToCart}
            className="flex-1"
          >{`Adicionar ${currencyFormat(calculateTotal())}`}</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductAdditionals;
