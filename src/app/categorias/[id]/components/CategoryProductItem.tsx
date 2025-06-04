"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import currencyFormat from "@/helpers/currency-format";
import { useCartStore } from "@/hooks/cartStore";

interface CategoryProductItemProps {
  product: Prisma.ProductGetPayload<{
    include: {
      Size: true;
    };
  }>;
}

const CategoryProductItem = ({ product }: CategoryProductItemProps) => {
  const router = useRouter();
  const { addToCart } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const requiresConfiguration = product.isHalfHalf || product.price === null;

    if (requiresConfiguration) {
      toast.info("Este produto tem opções. Configure na página de detalhes.", {
        action: {
          label: "Ver produto",
          onClick: () => router.push(`/produto/${product.id}`),
        },
        duration: 5000,
      });
      return;
    }

    let priceAtTime = product.price!;
    if (product.discount && product.discount > 0) {
      priceAtTime = product.price! * (1 - product.discount / 100);
    }

    const cartItemToAdd = {
      productId: product.id,
      name: product.name,
      imageUrl:
        product.imageUrl ||
        "https://img.freepik.com/fotos-gratis/hamburguer-enorme-com-carne-frita-e-legumes_140725-971.jpg?w=900&t=st=1717528244~exp=1717528844~hmac=781c556eda14775913648994408819b708e5dd8d88c1543fde5e640831a90a93", // Fallback image
      priceAtTime: priceAtTime,
      quantity: 1,
      orderExtras: [],
    };

    addToCart(cartItemToAdd);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const isPizzaType =
    product.price === null && product.Size && product.Size.length > 0; //

  let displayPrice = product.price;
  let originalPrice;

  if (!isPizzaType && displayPrice !== null) {
    if (product.discount && product.discount > 0) {
      originalPrice = displayPrice;
      displayPrice = displayPrice * (1 - product.discount / 100);
    }
  }

  return (
    <Link
      href={`/produto/${product.id}`}
      className="block w-full transition-colors hover:bg-muted/50"
      aria-label={`Ver detalhes de ${product.name}`}
    >
      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 border-b">
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
          <Image
            src={
              product.imageUrl ||
              "https://img.freepik.com/fotos-gratis/hamburguer-enorme-com-carne-frita-e-legumes_140725-971.jpg?w=900&t=st=1717528244~exp=1717528844~hmac=781c556eda14775913648994408819b708e5dd8d88c1543fde5e640831a90a93"
            }
            alt={product.name}
            fill
            className="object-cover rounded-md"
            sizes="(max-width: 768px) 20vw, 10vw"
          />
          {product.discount && product.discount > 0 && !isPizzaType && (
            <span className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="text-xs md:text-sm mt-2">
            {isPizzaType ? (
              <div className="space-y-1">
                {product.Size.sort((a, b) => a.price - b.price).map((size) => (
                  <div
                    key={size.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">{size.name}</span>
                    <span className="font-semibold text-foreground">
                      {currencyFormat(size.price)}
                    </span>
                  </div>
                ))}
              </div>
            ) : displayPrice !== null ? (
              <p>
                {originalPrice ? (
                  <>
                    <span className="line-through text-muted-foreground mr-1.5">
                      {currencyFormat(originalPrice)}
                    </span>
                    <span className="text-foreground font-medium">
                      {currencyFormat(displayPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-foreground font-medium">
                    {currencyFormat(displayPrice)}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Consulte opções</p>
            )}
          </div>
        </div>

        <div className="ml-auto flex-shrink-0 pt-1">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-primary text-primary h-8 w-8 md:h-9 md:w-9 hover:bg-primary/10 active:bg-primary/20" // Added active state
            onClick={handleQuickAdd}
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default CategoryProductItem;
