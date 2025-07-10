"use client";

import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import currencyFormat from "@/helpers/currency-format";

interface DiscountedProductCardProps {
  product: Prisma.ProductGetPayload<{
    include: {
      Size: true;
    };
  }>;
}

const DiscountedProductCard = ({ product }: DiscountedProductCardProps) => {
  // O preço a ser exibido será o preço com desconto.
  const displayPrice = product.price! * (1 - (product.discount || 0) / 100);

  return (
    <Link
      href={`/produto/${product.id}`}
      className="block w-[280px] sm:w-[320px] flex-shrink-0 group"
      aria-label={`Ver oferta de ${product.name}`}
    >
      <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-card">
        <div className="relative w-full h-40">
          <Image
            src={
              product.imageUrl ||
              `https://img.freepik.com/fotos-gratis/hamburguer-enorme-com-carne-frita-e-legumes_140725-971.jpg`
            }
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 80vw, 320px"
          />
          <Badge
            variant="destructive"
            className="absolute top-3 right-3 text-sm py-1 px-3 shadow-lg"
          >
            {product.discount}% OFF
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">
            {product.description}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-primary">
              {currencyFormat(displayPrice)}
            </p>
            <p className="text-md font-medium text-muted-foreground line-through">
              {currencyFormat(product.price!)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DiscountedProductCard;
