// pages/index.jsx

import { auth } from "@/auth";
import Footer from "../_components/Footer";
import { db } from "../_lib/prisma";
import CategoryList from "./_components/CategoryList";
import ProductList from "./_components/ProductList";

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

  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Lista de Categorias */}
          {session && (
            <div className="flex flex-col sm:flex-row items-center sm:items-end sm:gap-2 sm:justify-center">
              <h1 className="text-2xl font-bold">Olá, {session.user?.name}</h1>
            </div>
          )}
          <CategoryList categories={categories} />

          {/* Lista de Produtos por Categoria */}
          <div className="space-y-8 mt-6 md:mt-8">
            {categories.map((category) => (
              <section key={category.id} className="space-y-4">
                <h1 className="px-0 md:px-2 font-bold text-2xl md:text-3xl text-foreground">
                  {category.name}
                </h1>
                <ProductList products={category.products} />
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
