import { db } from "@/app/_lib/prisma";
import { notFound } from "next/navigation";

interface ProductProps {
  params: Promise<{ id: string }>;
}

const Product = async ({ params }: ProductProps) => {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    return notFound();
  }

  return <div>{product.name}</div>;
};

export default Product;
