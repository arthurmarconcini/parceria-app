"use client";

import { Prisma, Product as PrismaProduct } from "@prisma/client"; //
import { useEffect, useState } from "react";
import Image from "next/image";

import currencyFormat from "@/helpers/currency-format";
import { Button } from "@/components/ui/button";

// Our refactored size selector
import PizzaHalfHalf from "./PizzaHalfHalf"; // Our refactored flavor selector
import OptionsTitle from "./OptionsTitle";
import {
  MessageCircleMoreIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "lucide-react"; //
import { Textarea } from "@/components/ui/textarea";
import { CartItem, useCartStore } from "@/hooks/cartStore"; //
import { Separator } from "@/components/ui/separator"; //
import { toast } from "sonner"; //
import ProductOptions from "./SizeSelector";
import ProductAdditionals from "./ProductAdditionals";

interface ProductClientProps {
  product: Prisma.ProductGetPayload<{
    include: {
      Extras: true;
      Size: true;
      category: true;
    };
  }>;
  pizzas: Prisma.ProductGetPayload<{
    // Renamed for clarity
    include: {
      Size: true;
    };
  }>[];
}

export const ProductClient = ({
  product,
  pizzas: allPizzasForHalfHalf,
}: ProductClientProps) => {
  //
  const { addToCart } = useCartStore(); //

  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");

  // Default selectedSize: if sizes exist, pick the first one (or smallest by price later), else undefined.
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.Size && product.Size.length > 0
      ? product.Size.sort((a, b) => a.price - b.price)[0].id
      : undefined
  );

  // Pizza specific states
  const [isHalfHalfMode, setIsHalfHalfMode] = useState(
    product.isHalfHalf && product.category.name.toLowerCase() === "pizzas"
  ); // Default to true only for pizzas marked as halfHalf
  const [firstHalfPizzaId, setFirstHalfPizzaId] = useState<string>(product.id); // Default first half to the current product
  const [secondHalfPizzaId, setSecondHalfPizzaId] = useState<string | null>(
    null
  );

  const [extrasQuantities, setExtrasQuantities] = useState<{
    [key: string]: number;
  }>(product.Extras.reduce((acc, extra) => ({ ...acc, [extra.id]: 0 }), {}));

  const isPizzaCategory = product.category.name.toLowerCase() === "pizzas";

  // Effect to reset half-half mode if product category is not pizza
  useEffect(() => {
    if (!isPizzaCategory) {
      setIsHalfHalfMode(false);
    }
  }, [isPizzaCategory]);

  // Effect to set default size if not already set and sizes are available
  useEffect(() => {
    if (!selectedSize && product.Size && product.Size.length > 0) {
      const sortedSizes = [...product.Size].sort((a, b) => a.price - b.price);
      setSelectedSize(sortedSizes[0].id);
    }
  }, [product.Size, selectedSize]);

  const handleAddToCart = () => {
    let priceAtTime = 0;
    let cartItemName = product.name;
    let finalSelectedSizeId = selectedSize;
    let halfhalfPayload: CartItem["halfhalf"] = undefined; //

    const currentSelectedSizeObj = product.Size.find(
      (s) => s.id === finalSelectedSizeId
    );

    if (isPizzaCategory) {
      if (!finalSelectedSizeId) {
        toast.error("Por favor, selecione o tamanho da pizza.");
        return;
      }
      const firstHalfProduct = allPizzasForHalfHalf.find(
        (p) => p.id === firstHalfPizzaId
      );
      if (!firstHalfProduct) {
        toast.error("Primeiro sabor da pizza não encontrado.");
        return;
      }
      const firstHalfSizePrice = firstHalfProduct.Size.find(
        (s) => s.id === finalSelectedSizeId
      )?.price;
      if (firstHalfSizePrice === undefined) {
        toast.error(
          `Tamanho ${currentSelectedSizeObj?.name} não disponível para ${firstHalfProduct.name}.`
        );
        return;
      }
      priceAtTime = firstHalfSizePrice;
      cartItemName = firstHalfProduct.name; // Base name on the first half

      if (isHalfHalfMode && secondHalfPizzaId) {
        const secondHalfProduct = allPizzasForHalfHalf.find(
          (p) => p.id === secondHalfPizzaId
        );
        if (!secondHalfProduct) {
          toast.error("Segundo sabor da pizza não encontrado.");
          return;
        }
        const secondHalfSizePrice = secondHalfProduct.Size.find(
          (s) => s.name === currentSelectedSizeObj?.name
        )?.price; // Match by name
        if (secondHalfSizePrice === undefined) {
          toast.error(
            `Tamanho ${currentSelectedSizeObj?.name} não disponível para ${secondHalfProduct.name}.`
          );
          return;
        }
        // For half-half, the price is usually the higher of the two halves
        priceAtTime = Math.max(priceAtTime, secondHalfSizePrice);
        cartItemName = `1/2 ${firstHalfProduct.name}, 1/2 ${secondHalfProduct.name}`;
        halfhalfPayload = {
          //
          firstHalf: firstHalfProduct as PrismaProduct, // Cast to ensure type compatibility
          secondHalf: secondHalfProduct as PrismaProduct, //
        };
      } else if (isHalfHalfMode && !secondHalfPizzaId) {
        // If half-half mode is active but no second flavor, it's effectively a whole pizza of the first flavor
        // Price and name are already set for the first half.
      }
    } else {
      // Not a pizza
      if (product.Size && product.Size.length > 0) {
        // Has sizes (e.g. Açaí)
        if (!finalSelectedSizeId) {
          toast.error("Por favor, selecione um tamanho.");
          return;
        }
        priceAtTime = currentSelectedSizeObj?.price || 0;
      } else {
        // No sizes (e.g. Burger, Drink)
        priceAtTime = product.price || 0;
        finalSelectedSizeId = undefined; // Ensure no sizeId for products without sizes
      }
    }

    if (
      priceAtTime === 0 &&
      !(isPizzaCategory && isHalfHalfMode && secondHalfPizzaId)
    ) {
      // Allow price 0 only if it's a calculated half-half scenario where one half might be promotionally free
      // Or if the product naturally has price 0 (unlikely for primary products)
      // For now, let's assume if it's not a calculated half-half, price 0 is an error.
      if (!isPizzaCategory || !isHalfHalfMode || !secondHalfPizzaId) {
        // For simplicity, if price is 0 and it's not a complex half/half, assume error
        // unless product.price was explicitly 0 (which is rare)
        if (product.price !== 0) {
          toast.error(
            "Erro ao determinar o preço do produto. Tente novamente."
          );
          return;
        }
      }
    }

    const orderExtras = Object.entries(extrasQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([extraId, qty]) => {
        const extra = product.Extras.find((e) => e.id === extraId);
        return {
          name: extra?.name || "",
          extraId,
          quantity: qty,
          priceAtTime: extra?.price || 0,
        };
      });

    const cartItem: Omit<CartItem, "cartItemId"> = {
      name: cartItemName,
      productId: product.id, // Use the main product ID for reference
      quantity,
      sizeId: finalSelectedSizeId,
      halfhalf: halfhalfPayload, //
      imageUrl: product.imageUrl || "", //
      observation: observations || undefined,
      priceAtTime,
      orderExtras,
    };

    addToCart(cartItem);
    toast.success(`${cartItemName} adicionado ao carrinho!`);

    // Reset state after adding
    setQuantity(1);
    setObservations("");
    setExtrasQuantities(
      product.Extras.reduce((acc, extra) => ({ ...acc, [extra.id]: 0 }), {})
    );
    if (isPizzaCategory) {
      setSecondHalfPizzaId(null); // Reset second half
      // Optionally reset firstHalfPizzaId to product.id if it makes sense
    }
  };

  const selectedSizeObj = product.Size.find((s) => s.id === selectedSize);
  const selectedSizeNameForPizzaHalves = selectedSizeObj?.name;

  const calculateTotal = () => {
    let basePrice = 0;

    if (isPizzaCategory) {
      if (!selectedSize) return 0; // Cannot calculate without size

      const firstPizzaProduct =
        allPizzasForHalfHalf.find((p) => p.id === firstHalfPizzaId) || product;
      const firstPizzaSize = firstPizzaProduct.Size.find(
        (s) => s.id === selectedSize
      );

      if (!firstPizzaSize) return 0; // Size not found for first pizza
      basePrice = firstPizzaSize.price;

      if (isHalfHalfMode && secondHalfPizzaId) {
        const secondPizzaProduct = allPizzasForHalfHalf.find(
          (p) => p.id === secondHalfPizzaId
        );
        // Important: Find the *corresponding* size (by name) for the second pizza
        const secondPizzaSize = secondPizzaProduct?.Size.find(
          (s) => s.name === firstPizzaSize.name
        );
        if (secondPizzaSize) {
          basePrice = Math.max(basePrice, secondPizzaSize.price);
        }
      }
    } else {
      // Not a pizza
      if (product.Size && product.Size.length > 0) {
        // Product has sizes (e.g., Açaí)
        const currentSize = product.Size.find((s) => s.id === selectedSize);
        basePrice = currentSize?.price || 0;
      } else {
        // Product has no sizes (e.g., Burger)
        basePrice = product.price || 0;
      }
    }

    const extrasTotal = product.Extras.reduce((acc, extra) => {
      const qty = extrasQuantities[extra.id] || 0;
      return acc + extra.price * qty;
    }, 0);

    return (basePrice + extrasTotal) * quantity;
  };

  const onExtraQuantityChange = (extraId: string, qty: number) => {
    setExtrasQuantities({ ...extrasQuantities, [extraId]: qty });
  };

  const handleIncrementQuantity = () =>
    setQuantity((prev) => Math.min(prev + 1, 10)); // Max 10
  const handleDecrementQuantity = () =>
    setQuantity((prev) => Math.max(prev - 1, 1)); // Min 1

  return (
    <div className="flex flex-col">
      {/* Product Image and Basic Info */}
      <div className="relative h-64 md:h-80 w-full">
        <Image
          src={
            product.imageUrl ||
            "https://img.freepik.com/fotos-gratis/hamburguer-enorme-com-carne-frita-e-legumes_140725-971.jpg"
          }
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="p-4 space-y-3">
        <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}
        {/* Display initial price or "From..." for non-configurable items */}
        {!isPizzaCategory &&
          product.price !== null &&
          (!product.Size || product.Size.length === 0) && (
            <p className="text-xl font-semibold text-primary">
              {currencyFormat(
                product.price * (1 - (product.discount || 0) / 100)
              )}
              {product.discount && product.discount > 0 && (
                <span className="ml-2 text-sm line-through text-muted-foreground">
                  {currencyFormat(product.price)}
                </span>
              )}
            </p>
          )}
      </div>

      <Separator />

      {/* Configuration Sections */}
      <div className="space-y-1">
        {isPizzaCategory && product.isHalfHalf && (
          <>
            <OptionsTitle title="Como você quer sua pizza?" />
            <div className="flex gap-2 p-4 justify-stretch">
              <Button
                variant={!isHalfHalfMode ? "default" : "outline"}
                onClick={() => {
                  setIsHalfHalfMode(false);
                  setSecondHalfPizzaId(null);
                }}
                className="flex-1"
              >
                Inteira
              </Button>
              <Button
                variant={isHalfHalfMode ? "default" : "outline"}
                onClick={() => setIsHalfHalfMode(true)}
                className="flex-1"
              >
                Meio a Meio
              </Button>
            </div>
            <Separator />
          </>
        )}

        {product.Size && product.Size.length > 0 && (
          <>
            <ProductOptions
              sizes={product.Size}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              title={
                isPizzaCategory && isHalfHalfMode
                  ? "1. Escolha o tamanho"
                  : "Escolha o tamanho"
              }
            />
            <Separator />
          </>
        )}

        {isPizzaCategory && isHalfHalfMode && (
          <>
            <PizzaHalfHalf
              pizzas={allPizzasForHalfHalf}
              firstHalf={firstHalfPizzaId}
              secondHalf={secondHalfPizzaId}
              onFirstHalfChange={setFirstHalfPizzaId}
              onSecondHalfChange={setSecondHalfPizzaId}
              selectedSizeName={selectedSizeNameForPizzaHalves}
            />
            <Separator />
          </>
        )}

        {product.Extras && product.Extras.length > 0 && (
          <>
            <ProductAdditionals
              product={product}
              extrasQuantities={extrasQuantities}
              onExtraQuantityChange={onExtraQuantityChange}
            />
            <Separator />
          </>
        )}

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <MessageCircleMoreIcon
                size={18}
                className="text-muted-foreground"
              />
              <p className="text-sm font-medium text-foreground">
                Alguma observação?
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{`${observations.length} / 140`}</span>
          </div>
          <Textarea
            placeholder="Ex: tirar a cebola, maionese à parte etc..."
            value={observations}
            onChange={(e) => {
              if (e.target.value.length <= 140) {
                setObservations(e.target.value);
              }
            }}
            className="text-sm min-h-[80px]"
          />
        </div>
      </div>

      {/* Fixed Footer for Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg p-3 md:p-4 z-50">
        <div className="container mx-auto flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1 p-1 border rounded-md">
            <Button
              onClick={handleDecrementQuantity}
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8 text-primary hover:bg-primary/10"
            >
              <MinusIcon size={16} strokeWidth={2.5} />
            </Button>
            <span className="w-6 text-center text-sm md:text-base font-medium">
              {quantity}
            </span>
            <Button
              onClick={handleIncrementQuantity}
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8 text-primary hover:bg-primary/10"
            >
              <PlusIcon size={16} strokeWidth={2.5} />
            </Button>
          </div>
          <Button
            onClick={handleAddToCart}
            className="flex-1 h-10 md:h-12 text-sm md:text-base"
            disabled={Boolean(
              isPizzaCategory &&
                (!selectedSize ||
                  (isHalfHalfMode &&
                    !secondHalfPizzaId &&
                    product.id === firstHalfPizzaId &&
                    allPizzasForHalfHalf.length > 1))
            )}
          >
            <ShoppingCartIcon size={18} className="mr-2" />
            Adicionar ({currencyFormat(calculateTotal())})
          </Button>
        </div>
      </div>
    </div>
  );
};
