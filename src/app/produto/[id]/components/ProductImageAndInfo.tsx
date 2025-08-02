"use client";

import Image from "next/image";
import currencyFormat from "@/helpers/currency-format";
import { Product, Size } from "@prisma/client";

interface ProductImageAndInfoProps {
  product: Pick<
    Product,
    "imageUrl" | "name" | "description" | "price" | "discount"
  > & {
    category?: { name: string };
    Size?: Size[];
  };
  isPizzaCategory: boolean;
}

const ProductImageAndInfo = ({
  product,
  isPizzaCategory,
}: ProductImageAndInfoProps) => {
  const shouldDisplayFixedPrice =
    !isPizzaCategory &&
    (!product.Size || product.Size.length === 0) &&
    product.price !== null;

  return (
    <>
      <div className="relative h-64 w-full md:h-80">
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
      <div className="space-y-3 p-4">
        <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}
        {shouldDisplayFixedPrice ? (
          <p className="text-xl font-semibold text-primary">
            {currencyFormat(
              product.price! * (1 - (product.discount || 0) / 100)
            )}
            {product.discount && product.discount > 0 && (
              <span className="ml-2 text-sm line-through text-muted-foreground">
                {currencyFormat(product.price!)}
              </span>
            )}
          </p>
        ) : (
          <p className="text-xl font-semibold text-primary">
            a partir de{" "}
            {product.Size &&
              product.Size.length > 0 &&
              currencyFormat(
                product.Size[0].price * (1 - (product.discount || 0) / 100)
              )}
            {product.discount &&
              product.discount > 0 &&
              product.Size &&
              product.Size.length > 0 && (
                <span className="ml-2 text-sm line-through text-muted-foreground">
                  {currencyFormat(product.Size[0].price)}
                </span>
              )}
          </p>
        )}
      </div>
    </>
  );
};

export default ProductImageAndInfo;
