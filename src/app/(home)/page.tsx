import { db } from "../../lib/prisma";
import CategoryList from "./_components/CategoryList";
import ProductList from "./_components/ProductList";
import Footer from "@/components/layout/Footer";
import {
  getIconComponentForCategory,
  type IconComponentType,
} from "@/lib/categoryIcons";

export default async function Home() {
  const categories = await db.category.findMany({
    include: {
      products: {
        include: {
          Size: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <CategoryList categories={categories} />

          <div className="space-y-10 mt-10 md:mt-12">
            {categories.map((category) => {
              const IconComponent: IconComponentType | null = category.name
                ? getIconComponentForCategory(category.name) //
                : null;

              return (
                <section key={category.id} className="space-y-4">
                  <div className="flex items-center gap-3 px-0 md:px-2 pb-2 border-b border-border/60">
                    {IconComponent && (
                      <IconComponent
                        size={28}
                        className="text-primary flex-shrink-0"
                      />
                    )}
                    <h2 className="font-semibold text-xl md:text-2xl text-foreground tracking-tight">
                      {category.name}
                    </h2>
                  </div>
                  <ProductList products={category.products} />
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
