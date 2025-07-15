"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Product, Category, Size, Extra } from "@prisma/client";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleProductStatus } from "../actions/product";
import { ProductFormDialog } from "./ProductFormDialog";

type ProductWithRelations = Product & {
  category: Category;
  Size: Size[];
  Extras: Extra[];
};

interface ProductActionsProps {
  product: ProductWithRelations;
  categories: Category[];
}

export const ProductActions = ({
  product,
  categories,
}: ProductActionsProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(product);

  const handleToggleStatus = async () => {
    const action = toggleProductStatus(
      currentProduct.id,
      currentProduct.isActive
    );
    toast.promise(action, {
      loading: "Alterando status...",
      success: (res) => {
        if (res.success) {
          setCurrentProduct((prev) => ({ ...prev, isActive: !prev.isActive }));
          return "Status do produto alterado com sucesso!";
        }
        throw new Error(res.error);
      },
      error: (err) => err.message,
    });
  };

  return (
    <>
      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={currentProduct}
        categories={categories}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsFormOpen(true)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {currentProduct.isActive ? "Desativar" : "Reativar"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
