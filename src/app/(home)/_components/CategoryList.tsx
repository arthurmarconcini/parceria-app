"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import {
  getIconComponentForCategory,
  type IconComponentType,
} from "@/lib/categoryIcons";

type Category = {
  id: string;
  name: string;
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

  if (!categories || categories.length === 0) {
    return (
      <p className="px-4 mt-6 text-muted-foreground">
        Nenhuma categoria encontrada.
      </p>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex w-max space-x-2 gap-1 px-4 mt-6">
        {categories.map((category) => {
          const IconComponent: IconComponentType = getIconComponentForCategory(
            category.name
          );

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
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {IconComponent ? (
                  <IconComponent size={18} aria-hidden="true" />
                ) : (
                  <span className="w-[18px] h-[18px]" />
                )}
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
