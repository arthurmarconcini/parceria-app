import { db } from "@/lib/prisma";
import { ProductClient } from "./components/ProductClient";

const ProductsPage = async () => {
  // 1. Busca de dados acontece no servidor, antes da renderização.
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

  // 2. Os dados são passados como props para o componente cliente.
  return <ProductClient products={products} categories={categories} />;
};

export default ProductsPage;
