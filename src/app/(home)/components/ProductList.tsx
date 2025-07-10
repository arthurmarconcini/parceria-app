"use client";

import { Prisma } from "@prisma/client";
import ProductCard from "./ProductCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import HomeProductItem from "./HomeProductItem";

interface ProductListProps {
  products: Prisma.ProductGetPayload<{
    include: {
      Size: true;
    };
  }>[];
}

const ProductList = ({ products }: ProductListProps) => {
  const isMobile = useIsMobile();

  if (!products || products.length === 0) {
    return (
      <p className="px-4 text-muted-foreground">
        Nenhum produto nesta categoria.
      </p>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col">
        {products.map((product) => (
          <HomeProductItem key={product.id} product={product} />
        ))}
      </div>
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
