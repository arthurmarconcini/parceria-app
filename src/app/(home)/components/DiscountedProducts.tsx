import { Prisma } from "@prisma/client";
import { Flame } from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import DiscountedProductCard from "./DiscountedProductCard";

interface DiscountedProductsProps {
  products: Prisma.ProductGetPayload<{
    include: {
      Size: true;
    };
  }>[];
}

const DiscountedProducts = ({ products }: DiscountedProductsProps) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 py-6">
      <div className="flex items-center gap-3 px-4 md:px-2">
        <Flame className="h-7 w-7 text-destructive" />
        <h2 className="font-bold text-xl md:text-2xl text-foreground tracking-tight">
          Ofertas Imperdíveis!
        </h2>
      </div>
      <ScrollArea>
        <div className="flex w-max space-x-4 px-4 py-2">
          {products.map((product) => (
            <DiscountedProductCard key={product.id} product={product} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="mt-2" />
      </ScrollArea>
    </section>
  );
};

export default DiscountedProducts;
