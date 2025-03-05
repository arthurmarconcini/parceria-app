"use client";

import { Category } from "@prisma/client";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Button } from "./ui/button";

interface CategoryListProps {
  categories: Category[];
}

const CategoryList = ({ categories }: CategoryListProps) => {
  return (
    <ScrollArea>
      <div className="flex w-max space-x-2 p-4">
        {categories.map((category) => (
          <Button key={category.id}>{category.name}</Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryList;
