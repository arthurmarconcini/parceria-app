"use client";

import { Button } from "@/app/_components/ui/button";
import { ScrollArea, ScrollBar } from "@/app/_components/ui/scroll-area";
import { Category } from "@prisma/client";

interface CategoryListProps {
  categories: Category[];
}

const CategoryList = ({ categories }: CategoryListProps) => {
  return (
    <ScrollArea>
      <div className="flex w-max space-x-2 p-4 gap-1">
        {categories.map((category) => (
          <Button key={category.id}>{category.name}</Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryList;
