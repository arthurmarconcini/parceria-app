import currencyFormat from "@/helpers/currency-format";
import { db } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
      products: true,
    },
  });

  if (!category) {
    return notFound();
  }

  return (
    <div className="p-4">
      <h1 className="font-bold text-lg uppercase mt-4">{category.name}</h1>

      <div className="flex flex-col gap-4 mt-8 border-t border-muted">
        {category.products.map((product) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="flex justify-between border-b py-4 border-muted"
          >
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-sm font-bold">{product.name}</h1>
              <h2 className="font-semibold text-xs">{product.id}</h2>
              <p className="text-xs text-muted-foreground">
                {currencyFormat(Number(product.price))}
              </p>
            </div>
            <div className="w-28 h-20 relative overflow-hidden flex-shrink-0">
              <Image
                src={product.imageUrl || ""}
                alt={product.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
