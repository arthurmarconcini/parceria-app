"use client";

import currencyFormat from "@/helpers/currency-format";
import { Prisma } from "@prisma/client";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/cartStore";
import { toast } from "sonner";
import Link from "next/link";

interface ProductCardProps {
  product: Prisma.ProductGetPayload<{
    include: {
      Size: true;
    };
  }>;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const { addToCart } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const requiresConfiguration = product.isHalfHalf || product.price === null;

    if (requiresConfiguration) {
      toast.info("Este produto tem opções. Configure na página de detalhes.", {
        action: {
          label: "Ver produto",
          onClick: () => router.push(`/produto/${product.id}`),
        },
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
        `https://img.freepik.com/fotos-gratis/hamburguer-enorme-com-carne-frita-e-legumes_140725-971.jpg`,
      priceAtTime: priceAtTime,
      quantity: 1,
      orderExtras: [],
    };

    addToCart(cartItemToAdd);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  let displayPrice = product.price;
  let originalPrice;

  if (product.price === null && product.Size && product.Size.length > 0) {
    displayPrice = product.Size[0].price;
  }

  if (displayPrice !== null && product.discount && product.discount > 0) {
    originalPrice = displayPrice;
    displayPrice = displayPrice * (1 - product.discount / 100);
  }

  return (
    <div className="flex flex-col space-y-1 max-w-[200px] min-w-[200px] group transition-all duration-200 hover:shadow-lg hover:border-primary rounded-md p-2 relative border bg-card">
      <Link href={`/produto/${product.id}`} className="flex-grow flex flex-col">
        <div className="w-full h-[150px] relative rounded-md overflow-hidden mb-2">
          <Image
            src={
              product.imageUrl ||
              `https://img.freepik.com/fotos-gratis/hamburguer-enorme-com-carne-frita-e-legumes_140725-971.jpg`
            }
            alt={product.name}
            fill
            className="object-cover absolute transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.discount && product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>
        <div className="flex-grow">
          <h1 className="font-semibold text-sm text-foreground group-hover:text-primary truncate">
            {product.name}
          </h1>
          {product.price === null && product.Size && product.Size.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              A partir de {currencyFormat(product.Size[0].price!)}
            </p>
          ) : displayPrice !== null ? (
            <p className="text-xs text-muted-foreground">
              {originalPrice ? (
                <>
                  <span className="line-through mr-1">
                    {currencyFormat(originalPrice)}
                  </span>
                  {currencyFormat(displayPrice)}
                </>
              ) : (
                currencyFormat(displayPrice)
              )}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Consulte opções</p>
          )}
        </div>
      </Link>
      <Button
        size="icon"
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground hover:bg-primary/90 z-10" // Ajustado posicionamento e z-index
        onClick={handleAddToCart}
        aria-label={`Adicionar ${product.name} ao carrinho`}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductCard;
