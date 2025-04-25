// components/ProductCard.jsx
"use client";

import currencyFormat from "@/app/_helpers/currency-format";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/_components/ui/button";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Prisma.ProductGetPayload<{
    include: {
      Size: true;
    };
  }>;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="flex flex-col space-y-1 max-w-[200px] group transition-all duration-200 hover:shadow-lg hover:border-primary rounded-md p-2 relative">
      <Link href={`/product/${product.id}`}>
        <div className="w-[200px] h-[180px] relative rounded-md overflow-hidden">
          <Image
            src={
              product.imageUrl ||
              `https://img.freepik.com/fotos-gratis/hamburguer-enorme-com-carne-frita-e-legumes_140725-971.jpg`
            }
            alt={product.name}
            fill
            className="object-cover absolute transition-opacity group-hover:opacity-90"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.discount && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>
        <div>
          <h1 className="font-semibold text-sm text-foreground group-hover:text-primary truncate">
            {product.name}
          </h1>
          {product.isHalfHalf ? (
            <p className="text-xs text-muted-foreground">
              a partir de {currencyFormat(product.Size[0].price!)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {product.discount
                ? `${currencyFormat(
                    product.price! * (1 - product.discount / 100)
                  )} (${currencyFormat(product.price!)})`
                : currencyFormat(product.price!)}
            </p>
          )}
        </div>
      </Link>
      <Button
        size="icon"
        className="absolute bottom-10 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={(e) => {
          e.preventDefault();
          console.log(`Adicionar ${product.name} ao carrinho`);
        }}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductCard;
