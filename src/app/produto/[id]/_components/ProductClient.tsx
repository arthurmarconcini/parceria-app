"use client";

import { Prisma, Product as PrismaProduct } from "@prisma/client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { CartItem, useCartStore } from "@/hooks/cartStore";

import ProductImageAndInfo from "./ProductImageAndInfo";
import PizzaModeSelector from "./PizzaModeSelector";
import SizeSelector from "./SizeSelector";
import PizzaHalfHalfSelector from "./PizzaHalfHalfSelector";
import ProductAdditionals from "./ProductAdditionals";
import ProductObservations from "./ProductObservations";
import ProductActionsFooter from "./ProductActionsFooter";

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

export const ProductClient = ({
  product: produtoDaPagina,
  pizzas: todasAsPizzasParaSelecao,
}: ProductClientProps) => {
  const { addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");

  const firstHalfPizzaId = produtoDaPagina.id;

  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>(
    () => {
      if (produtoDaPagina.Size && produtoDaPagina.Size.length > 0) {
        return [...produtoDaPagina.Size].sort((a, b) => a.price - b.price)[0]
          .id;
      }
      return undefined;
    }
  );

  const isPizzaCategory = useMemo(
    () => produtoDaPagina.category.name.toLowerCase() === "pizzas",
    [produtoDaPagina.category.name]
  );

  const [isHalfHalfMode, setIsHalfHalfMode] = useState(
    isPizzaCategory && produtoDaPagina.isHalfHalf === true
  );

  const [secondHalfPizzaId, setSecondHalfPizzaId] = useState<string | null>(
    null
  );

  const [extrasQuantities, setExtrasQuantities] = useState<{
    [key: string]: number;
  }>(() =>
    produtoDaPagina.Extras.reduce(
      (acc, extra) => ({ ...acc, [extra.id]: 0 }),
      {}
    )
  );

  useEffect(() => {
    if (!isPizzaCategory) {
      setIsHalfHalfMode(false);
    } else {
      setIsHalfHalfMode(produtoDaPagina.isHalfHalf === true);
    }
  }, [isPizzaCategory, produtoDaPagina.isHalfHalf]);

  useEffect(() => {
    if (
      !selectedSizeId &&
      produtoDaPagina.Size &&
      produtoDaPagina.Size.length > 0
    ) {
      const sortedSizes = [...produtoDaPagina.Size].sort(
        (a, b) => a.price - b.price
      );
      setSelectedSizeId(sortedSizes[0].id);
    }
  }, [produtoDaPagina.Size, selectedSizeId]);

  const selectedSizeObject = useMemo(() => {
    return produtoDaPagina.Size.find((s) => s.id === selectedSizeId);
  }, [produtoDaPagina.Size, selectedSizeId]);

  const handlePizzaModeChange = (isHalfHalf: boolean) => {
    setIsHalfHalfMode(isHalfHalf);
    if (!isHalfHalf) {
      setSecondHalfPizzaId(null);
    }
  };

  const calcularPrecoBasePizza = (): number => {
    if (!isPizzaCategory || !selectedSizeObject) return 0;

    const obterPrecoSaborNoTamanhoSelecionado = (
      pizzaId: string
    ): number | null => {
      const pizzaProd = todasAsPizzasParaSelecao.find((p) => p.id === pizzaId);
      if (!pizzaProd) return null;
      const tamanho = pizzaProd.Size.find(
        (s) => s.name === selectedSizeObject.name
      );
      return tamanho?.price ?? null;
    };

    const precoPrimeiraMetade =
      obterPrecoSaborNoTamanhoSelecionado(firstHalfPizzaId);
    if (precoPrimeiraMetade === null) return 0;

    if (isHalfHalfMode && secondHalfPizzaId) {
      const precoSegundaMetade =
        obterPrecoSaborNoTamanhoSelecionado(secondHalfPizzaId);

      if (precoSegundaMetade === null) return precoPrimeiraMetade;
      return Math.max(precoPrimeiraMetade, precoSegundaMetade);
    }
    return precoPrimeiraMetade;
  };

  const calcularPrecoTotal = (): number => {
    let precoBase = 0;

    if (isPizzaCategory) {
      precoBase = calcularPrecoBasePizza();
    } else {
      if (produtoDaPagina.Size && produtoDaPagina.Size.length > 0) {
        precoBase = selectedSizeObject?.price || 0;
      } else {
        precoBase = produtoDaPagina.price || 0;
      }
    }

    if (
      produtoDaPagina.discount &&
      produtoDaPagina.discount > 0 &&
      precoBase > 0
    ) {
      precoBase *= 1 - produtoDaPagina.discount / 100;
    }

    const totalAdicionais = produtoDaPagina.Extras.reduce((acc, extra) => {
      const qty = extrasQuantities[extra.id] || 0;
      return acc + extra.price * qty;
    }, 0);

    return (precoBase + totalAdicionais) * quantity;
  };

  const handleAdicionarAoCarrinho = () => {
    let precoBaseItemCarrinho = 0;
    let nomeItemCarrinho = produtoDaPagina.name;
    let payloadMeioAMeio: CartItem["halfhalf"] = undefined;

    if (isPizzaCategory) {
      if (!selectedSizeId || !selectedSizeObject) {
        toast.error("Por favor, selecione o tamanho da pizza.");
        return;
      }
      precoBaseItemCarrinho = calcularPrecoBasePizza();

      if (produtoDaPagina.discount && produtoDaPagina.discount > 0) {
        precoBaseItemCarrinho *= 1 - produtoDaPagina.discount / 100;
      }

      const produtoPrimeiraMetade = produtoDaPagina;

      if (isHalfHalfMode && secondHalfPizzaId) {
        const produtoSegundaMetade = todasAsPizzasParaSelecao.find(
          (p) => p.id === secondHalfPizzaId
        );
        if (!produtoSegundaMetade) {
          toast.error("Segundo sabor da pizza não encontrado.");
          return;
        }
        nomeItemCarrinho = `1/2 ${produtoPrimeiraMetade.name}, 1/2 ${produtoSegundaMetade.name}`;
        payloadMeioAMeio = {
          firstHalf: produtoPrimeiraMetade as PrismaProduct,
          secondHalf: produtoSegundaMetade as PrismaProduct,
        };
      } else {
        nomeItemCarrinho = produtoPrimeiraMetade.name;
      }
    } else {
      if (produtoDaPagina.Size && produtoDaPagina.Size.length > 0) {
        if (!selectedSizeId || !selectedSizeObject) {
          toast.error("Por favor, selecione um tamanho.");
          return;
        }
        precoBaseItemCarrinho = selectedSizeObject.price || 0;
      } else {
        precoBaseItemCarrinho = produtoDaPagina.price || 0;
      }
      if (produtoDaPagina.discount && produtoDaPagina.discount > 0) {
        precoBaseItemCarrinho *= 1 - produtoDaPagina.discount / 100;
      }
    }

    if (
      precoBaseItemCarrinho <= 0 &&
      produtoDaPagina.price !== 0 &&
      !(isPizzaCategory && produtoDaPagina.price === null)
    ) {
      toast.error(
        "Erro ao determinar o preço base do produto. Tente novamente."
      );
      return;
    }

    const extrasDoPedido = Object.entries(extrasQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([extraId, qty]) => {
        const extraInfo = produtoDaPagina.Extras.find((e) => e.id === extraId);
        return {
          name: extraInfo?.name || "Adicional desconhecido",
          extraId,
          quantity: qty,
          priceAtTime: extraInfo?.price || 0,
        };
      });

    const itemParaCarrinho: Omit<CartItem, "cartItemId"> = {
      name: nomeItemCarrinho,
      productId: produtoDaPagina.id,
      quantity,
      sizeId: selectedSizeId,
      halfhalf: payloadMeioAMeio,
      imageUrl: produtoDaPagina.imageUrl || "",
      observation: observations || undefined,
      priceAtTime: precoBaseItemCarrinho,
      orderExtras: extrasDoPedido,
    };

    addToCart(itemParaCarrinho);
    toast.success(`${nomeItemCarrinho} adicionado ao carrinho!`);

    setQuantity(1);
    setObservations("");
    setExtrasQuantities(
      produtoDaPagina.Extras.reduce(
        (acc, extra) => ({ ...acc, [extra.id]: 0 }),
        {}
      )
    );
    if (isPizzaCategory) {
      setSecondHalfPizzaId(null);
    }
  };

  const handleIncrementarQuantidade = () =>
    setQuantity((prev) => Math.min(prev + 1, 10));
  const handleDecrementarQuantidade = () =>
    setQuantity((prev) => Math.max(prev - 1, 1));

  const desabilitarAdicionarAoCarrinho = useMemo(() => {
    if (isPizzaCategory && !selectedSizeId) return true;
    if (
      !isPizzaCategory &&
      produtoDaPagina.Size &&
      produtoDaPagina.Size.length > 0 &&
      !selectedSizeId
    ) {
      return true;
    }

    return false;
  }, [isPizzaCategory, selectedSizeId, produtoDaPagina.Size]);

  return (
    <div className="flex flex-col">
      <ProductImageAndInfo
        product={produtoDaPagina}
        isPizzaCategory={isPizzaCategory}
      />
      <Separator />
      <div className="space-y-1">
        {isPizzaCategory && produtoDaPagina.isHalfHalf && (
          <>
            <PizzaModeSelector
              isHalfHalfMode={isHalfHalfMode}
              onSelectMode={handlePizzaModeChange}
            />
            <Separator />
          </>
        )}

        {produtoDaPagina.Size && produtoDaPagina.Size.length > 0 && (
          <>
            <SizeSelector
              sizes={produtoDaPagina.Size}
              selectedSize={selectedSizeId}
              onSizeChange={setSelectedSizeId}
              title={
                isPizzaCategory && isHalfHalfMode
                  ? "1. Escolha o tamanho"
                  : "Escolha o tamanho"
              }
            />
            <Separator />
          </>
        )}

        {isPizzaCategory && isHalfHalfMode && produtoDaPagina.isHalfHalf && (
          <>
            <PizzaHalfHalfSelector
              pizzas={todasAsPizzasParaSelecao}
              productPagePizza={produtoDaPagina}
              secondHalfPizzaId={secondHalfPizzaId}
              onSecondHalfChange={setSecondHalfPizzaId}
              selectedSizeName={selectedSizeObject?.name}
              disabled={!isHalfHalfMode || !selectedSizeId}
            />
            <Separator />
          </>
        )}

        {produtoDaPagina.Extras && produtoDaPagina.Extras.length > 0 && (
          <>
            <ProductAdditionals
              product={produtoDaPagina}
              extrasQuantities={extrasQuantities}
              onExtraQuantityChange={(extraId, qty) =>
                setExtrasQuantities((prev) => ({ ...prev, [extraId]: qty }))
              }
            />
            <Separator />
          </>
        )}

        <ProductObservations value={observations} onChange={setObservations} />
      </div>
      <ProductActionsFooter
        quantity={quantity}
        onDecrementQuantity={handleDecrementarQuantidade}
        onIncrementQuantity={handleIncrementarQuantidade}
        totalPrice={calcularPrecoTotal()}
        onAddToCart={handleAdicionarAoCarrinho}
        disabledAddToCart={desabilitarAdicionarAoCarrinho}
      />
      <div className="pb-24 md:pb-28" />
    </div>
  );
};
