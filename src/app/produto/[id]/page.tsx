import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductClient } from "./components/ProductClient"; //
import { Prisma } from "@prisma/client";

interface ProductPageProps {
  params: { id: string };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id, isActive: true },

    include: {
      Extras: true,
      Size: true,
      category: true,
    },
  });

  if (!product) {
    return notFound();
  }

  let pizzasForHalfHalf: Prisma.ProductGetPayload<{
    include: { Size: true };
  }>[] = [];
  if (product.category.name.toLowerCase() === "pizzas" && product.isHalfHalf) {
    pizzasForHalfHalf = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
      },
      include: {
        Size: true,
      },
    });
  }

  return (
    <div className="container mx-auto max-w-4xl pb-28 md:pb-24">
      {/* Aumentado padding p/ mobile */}
      <ProductClient product={product} pizzas={pizzasForHalfHalf} />
    </div>
  );
};

export default ProductPage;
