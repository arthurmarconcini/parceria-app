import { db } from "@/lib/prisma";
import { ProductClient } from "./components/ProductClient";

const ProductsPage = async () => {
  const products = await db.product.findMany({
    include: {
      category: true,
      Size: {
        orderBy: {
          price: "asc",
        },
      },
      Extras: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return <ProductClient products={products} categories={categories} />;
};

export default ProductsPage;
