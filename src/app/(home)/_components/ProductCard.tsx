"use client";

import currencyFormat from "@/app/_helpers/currency-format";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Prisma.ProductGetPayload<{
    include: {
      Size: true;
    };
  }>;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link href={`/product/${product.id}`}>
      <div key={product.id} className="flex flex-col space-y-1 max-w-[200px]">
        <div className="w-[200px] h-[180px] relative rounded-md overflow-hidden">
          <Image
            src={
              product.imageUrl ||
              `https://img.freepik.com/fotos-gratis/hamburguer-enorme-com-carne-frita-e-legumes_140725-971.jpg?t=st=1741906423~exp=1741910023~hmac=8deb415adc07a586802503a9495897ab95e9a69926ae5b99d6bb6a2584ccd2d5&w=740`
            }
            alt={product.name}
            fill
            className="object-cover absolute"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="">
          <h1 className="font-semibold text-sm">{product.name}</h1>
          {product.isHalfHalf ? (
            <p className="text-xs text-muted-foreground">
              a partir de {currencyFormat(product.Size[0].price!)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {currencyFormat(product.price!)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
