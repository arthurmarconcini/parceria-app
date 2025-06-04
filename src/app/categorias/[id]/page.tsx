import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CategoryProductItem from "./components/CategoryProductItem";
import {
  getIconComponentForCategory,
  type IconComponentType,
} from "@/lib/categoryIcons";
import { Utensils } from "lucide-react";

interface CategoryPageProps {
  params: {
    id: string;
  };
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { id } = params;
  const category = await db.category.findUnique({
    where: {
      id,
    },
    include: {
      products: {
        include: {
          Size: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  if (!category) {
    //
    return notFound();
  }

  const IconComponent: IconComponentType =
    getIconComponentForCategory(category.name) || Utensils; //

  return (
    <div className="container mx-auto px-0 md:px-4 py-6 md:py-8">
      <div className="flex items-center gap-3 px-4 md:px-0 mb-6 md:mb-8 pb-3 border-b">
        <IconComponent size={28} className="text-primary flex-shrink-0" />
        <h1 className="font-semibold text-xl md:text-2xl text-foreground tracking-tight">
          {category.name}
        </h1>
      </div>

      {category.products.length > 0 ? (
        <div className="flex flex-col">
          {category.products.map((product) => (
            <CategoryProductItem key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-lg">
            Oops! Nenhum produto encontrado nesta categoria.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Tente explorar outras delícias do nosso cardápio!
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
