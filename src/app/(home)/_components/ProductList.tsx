import { Prisma } from "@prisma/client";
import ProductCard from "./ProductCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ProductListProps {
  products: Prisma.ProductGetPayload<{
    include: {
      Size: true;
    };
  }>[];
}

const ProductList = ({ products }: ProductListProps) => {
  if (!products || products.length === 0) {
    return (
      <p className="px-4 text-muted-foreground">
        Nenhum produto nesta categoria.
      </p>
    );
  }
  return (
    <ScrollArea>
      <div className="flex min-h-[240px] w-max space-x-3 px-4 py-1">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="mt-2" />{" "}
    </ScrollArea>
  );
};

export default ProductList;
