"use client";

import { Prisma } from "@prisma/client";
import { useState } from "react";

import currencyFormat from "@/app/_helpers/currency-format";
import { Button } from "@/app/_components/ui/button";
import ProductAdditionals from "./product_additional";
import ProductOptions from "./product_options";
import PizzaHalfHalf from "./pizza_halfhalf";
import OptionsTitle from "./options_title";
import { MessageCircleMoreIcon } from "lucide-react";
import { Textarea } from "@/app/_components/ui/textarea";
import { CartItem, useCartStore } from "@/app/_hooks/cartStore";

// Componente cliente para lógica interativa
interface ProductClientProps {
  product: Prisma.ProductGetPayload<{
    include: {
      Extras: true;
      Size: true;
      category: true;
    };
  }>;
  pizzas: Prisma.ProductGetPayload<{
    include: {
      Size: true;
    };
  }>[];
}

export const ProductClient = ({ product, pizzas }: ProductClientProps) => {
  const [isHalfHalfMode, setIsHalfHalfMode] = useState(product.isHalfHalf); // Modo padrão baseado no produto
  const [selectedSize, setSelectedSize] = useState(product.Size[0]?.id); // Primeiro tamanho como padrão
  const [firstHalf, setFirstHalf] = useState(product.id); // Primeiro sabor padrão
  const [secondHalf, setSecondHalf] = useState<string | null>(null); // Segundo sabor (opcional)
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");

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

  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    const selectedSizeObj = product.Size.find((s) => s.id === selectedSize);
    const basePrice = selectedSizeObj?.price || product.price || 0;

    // Determina o nome e o preço do item
    let cartItemName = product.name;
    let priceAtTime = basePrice;
    let halfhalf;

    if (isHalfHalfMode) {
      if (!secondHalf) {
        alert("Por favor, selecione o segundo sabor para o modo meio a meio.");
        return;
      }
      const secondPizza = pizzas.find((p) => p.id === secondHalf);
      const secondSize = secondPizza?.Size.find(
        (s) => s.name === selectedSizeObj?.name
      );
      const secondPrice = secondSize?.price || secondPizza?.price || 0;
      priceAtTime = Math.max(basePrice, secondPrice); // Usa o maior preço
      cartItemName = `${product.name} / ${secondPizza?.name || "Desconhecido"}`;
      halfhalf = {
        firstHalf: pizzas.find((p) => p.id === firstHalf),
        secondHalf: secondPizza,
      };
    }

    // Monta os extras
    const orderExtras = Object.entries(extrasQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([extraId, quantity]) => {
        const extra = product.Extras.find((e) => e.id === extraId);
        return {
          name: extra?.name || "",
          extraId,
          quantity,
          priceAtTime: extra?.price || 0,
        };
      });

    // Cria o CartItem
    const cartItem: Omit<CartItem, "cartItemId"> = {
      name: cartItemName,
      productId: product.id,
      quantity,
      sizeId: selectedSize,
      halfhalf: isHalfHalfMode ? halfhalf : undefined,
      imageUrl:
        product.imageUrl ||
        "https://img.freepik.com/vetores-gratis/delicioso-hamburguer-fast-food-isolado_18591-84257.jpg?t=st=1743799934~exp=1743803534~hmac=a7a439db240ada8f06d73c791972dfa61c2717542f3440b25d65e2d1b1133585&w=740",
      observation: observations || undefined,
      priceAtTime,
      orderExtras,
    };

    addToCart(cartItem);

    // Reseta o formulário
    setQuantity(1);
    setObservations("");
    setExtrasQuantities(
      product.Extras.reduce((acc, extra) => ({ ...acc, [extra.id]: 0 }), {})
    );
    if (isHalfHalfMode) setSecondHalf(null);
  };

  const selectedSizeName = product.Size.find(
    (s) => s.id === selectedSize
  )?.name;

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleObservationsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (e.target.value.length > 140) return;
    setObservations(e.target.value);
  };

  const calculateTotal = () => {
    // Encontra o tamanho selecionado do produto atual
    const selectedSizeObj = product.Size.find((s) => s.id === selectedSize);
    let basePrice = selectedSizeObj?.price || product.price || 0;

    // Se for meio a meio, ajusta o preço base para o maior entre os dois sabores
    if (isHalfHalfMode && secondHalf) {
      const secondPizza = pizzas.find((p) => p.id === secondHalf);
      if (secondPizza) {
        const secondSize = secondPizza.Size.find(
          (s) => s.name === selectedSizeObj?.name // Compara pelo nome do tamanho
        );
        const secondPrice = secondSize?.price || secondPizza.price || 0;
        basePrice = Math.max(basePrice, secondPrice); // Usa o preço mais alto
      }
    }

    // Calcula o total dos extras
    const extrasTotal = product.Extras.reduce((acc, extra) => {
      const quantity = extrasQuantities[extra.id] || 0;
      return acc + extra.price * quantity;
    }, 0);

    // Retorna o preço total multiplicado pela quantidade
    return (basePrice + extrasTotal) * quantity;
  };

  const onExtraQuantityChange = (extraId: string, quantity: number) => {
    setExtrasQuantities({
      ...extrasQuantities,
      [extraId]: quantity,
    });
  };

  return (
    <div>
      <div>
        {/* Alternar entre Inteira e Meio a Meio */}
        {product.isHalfHalf && (
          <div className="mt-4">
            <OptionsTitle title="Escolha o tipo" />
            <div className="flex gap-4 mt-2 px-4 w-full justify-center">
              <Button
                variant={isHalfHalfMode ? "outline" : "default"}
                onClick={() => setIsHalfHalfMode(false)}
              >
                Pizza Inteira
              </Button>
              <Button
                variant={isHalfHalfMode ? "default" : "outline"}
                onClick={() => setIsHalfHalfMode(true)}
              >
                Meio a Meio
              </Button>
            </div>
          </div>
        )}

        {/* Seleção de tamanho */}
        <ProductOptions
          sizes={product.Size}
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
        />

        {/* Seleção de sabores para Meio a Meio */}
        {isHalfHalfMode && (
          <PizzaHalfHalf
            productId={product.id}
            pizzas={pizzas}
            firstHalf={firstHalf}
            secondHalf={secondHalf}
            onFirstHalfChange={setFirstHalf}
            onSecondHalfChange={setSecondHalf}
            selectedSize={selectedSizeName || ""}
          />
        )}

        {/* Extras */}
        <ProductAdditionals
          product={product}
          extrasQuantities={extrasQuantities}
          onExtraQuantityChange={onExtraQuantityChange}
        />
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
