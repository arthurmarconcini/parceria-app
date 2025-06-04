import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductClient } from "./_components/ProductClient"; //
import { Prisma } from "@prisma/client";

interface ProductPageProps {
  params: { id: string };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { id } = await params;

  const product = await db.product.findUnique({
    //
    where: { id },
    include: {
      Extras: true,
      Size: true,
      category: true,
    },
  });

  if (!product) {
    //
    return notFound();
  }

  let pizzasForHalfHalf: Prisma.ProductGetPayload<{
    include: { Size: true };
  }>[] = [];
  if (product.category.name.toLowerCase() === "pizzas" && product.isHalfHalf) {
    pizzasForHalfHalf = await db.product.findMany({
      //
      where: {
        categoryId: product.categoryId,
      },
      include: {
        Size: true,
      },
    });
  }

  return (
    <div className="pb-24">
      <ProductClient product={product} pizzas={pizzasForHalfHalf} />
    </div>
  );
};

export default ProductPage;
