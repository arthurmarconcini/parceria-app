"use client";

import { Button } from "@/app/_components/ui/button";
import { ScrollArea, ScrollBar } from "@/app/_components/ui/scroll-area";
import { Category } from "@prisma/client";
import Link from "next/link";

interface CategoryListProps {
  categories: Category[];
}

const CategoryList = ({ categories }: CategoryListProps) => {
  return (
    <ScrollArea>
      <div className="flex w-max space-x-2 p-4 gap-1">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.id}`}>
            <Button>{category.name}</Button>
          </Link>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryList;
