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
  return (
    <ScrollArea className="">
      <div className="flex min-h-[200px] w-max space-x-2 px-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default ProductList;
