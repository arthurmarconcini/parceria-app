import CategoryList from "../_components/CategoryList";
import { db } from "../_lib/prisma";
import ProductCard from "./_components/ProductCard";

export default async function Home() {
  const categories = await db.category.findMany({
    include: {
      products: true,
    },
  });
  return (
    <div className="">
      <CategoryList categories={categories} />
      <div className="px-4 space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="space-y-2">
            <h1 className="font-bold text-2xl">{category.name}</h1>
            <div className="space-y-2">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
