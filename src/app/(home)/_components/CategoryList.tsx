"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";

import DynamicLucideIcon from "@/components/DynamicLucideIcon";
import { categoryIconMap, LucideIconName } from "@/lib/categoryIcons";

type Category = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId?: string;
}

const CategoryList = ({
  categories,
  selectedCategoryId,
}: CategoryListProps) => {
  const [selected, setSelected] = useState(selectedCategoryId);

  return (
    <ScrollArea className="w-full">
      <div className="flex w-max space-x-2 gap-1 px-4 mt-6">
        {categories.map((category) => {
          // Garante que o nome do ícone é do tipo correto
          const iconName: LucideIconName =
            categoryIconMap[category.name] || categoryIconMap.default;

          return (
            <Link
              key={category.id}
              href={`/categorias/${category.id}`}
              onClick={() => setSelected(category.id)}
              aria-current={selected === category.id ? "page" : undefined}
            >
              <Button
                variant={selected === category.id ? "default" : "outline"}
                className={cn(
                  "rounded-full flex items-center gap-2 px-4 py-2 transition-all duration-200",
                  selected === category.id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                )}
              >
                <DynamicLucideIcon name={iconName} size={18} />
                <span className="text-sm font-medium">{category.name}</span>
              </Button>
            </Link>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryList;
