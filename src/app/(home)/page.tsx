import { db } from "../_lib/prisma";
import CategoryList from "./_components/CategoryList";
import ProductList from "./_components/ProductList";

export default async function Home() {
  const categories = await db.category.findMany({
    include: {
      products: true,
    },
  });
  return (
    <div className="">
      <CategoryList categories={categories} />
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="space-y-2.5">
            <h1 className="px-4 font-bold text-2xl">{category.name}</h1>
            <ProductList products={category.products} />
          </div>
        ))}
      </div>
    </div>
  );
}
