"use client";

import { Card } from "@/app/_components/ui/card";
import currencyFormat from "@/app/_helpers/currency-format";
import { Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link href={`/product/${product.id}`}>
      <Card key={product.id} className="flex flex-row p-4">
        <div className="flex-1">
          <h1 className="text-lg">{product.name}</h1>
          <span>{currencyFormat(product.price)}</span>
        </div>
        <Image
          src={
            product.imageUrl ||
            `https://img.freepik.com/psd-gratuitas/modelo-de-midia-social-de-hamburguer-quente-e-picante_505751-2886.jpg?t=st=1741020839~exp=1741024439~hmac=066195a75d87fd588f3d2ff7fe7f4f25546e4a76e51c713e79a9bcc60faf7c01&w=740`
          }
          alt={product.name}
          width={48}
          height={48}
          className="rounded-sm object-contain"
        />
      </Card>
    </Link>
  );
};

export default ProductCard;
