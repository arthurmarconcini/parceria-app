import { db } from "@/app/_lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";

import currencyFormat from "@/app/_helpers/currency-format";

import { ProductClient } from "./_components/product_cliente";

interface ProductProps {
  params: Promise<{ id: string }>;
}

const Product = async ({ params }: ProductProps) => {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      Extras: true,
      Size: true,
      category: true,
    },
  });

  const pizzas = await db.product.findMany({
    where: {
      categoryId: product?.categoryId,
    },
    include: {
      Size: true,
    },
  });

  if (!product) {
    return notFound();
  }

  return (
    <div className="container mx-auto">
      <div className="flex gap-4 justify-between p-4">
        <Image
          src={
            product.imageUrl ||
            `https://img.freepik.com/psd-gratuitas/modelo-de-midia-social-de-hamburguer-quente-e-picante_505751-2886.jpg?t=st=1741020839~exp=1741024439~hmac=066195a75d87fd588f3d2ff7fe7f4f25546e4a76e51c713e79a9bcc60faf7c01&w=740`
          }
          alt={product.name}
          width={64}
          height={64}
          className="object-contain rounded-sm"
        />
        <div className="flex-1">
          <h1 className="">{product.name}</h1>
          <h2 className="text-sm">Pao, carne, queijo e salada</h2>

          <p className="text-xs text-muted-foreground">
            {!product.isHalfHalf
              ? currencyFormat(product.price!)
              : `a partir de ${currencyFormat(product.Size[0].price!)}`}
          </p>
        </div>
      </div>
      <ProductClient product={product} pizzas={pizzas} />
    </div>
  );
};

export default Product;
