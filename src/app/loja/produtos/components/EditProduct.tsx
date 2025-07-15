"use client";

import { useState } from "react";
import { Product, Category, Extra, Size } from "@prisma/client";
import { Button } from "@/components/ui/button";
import ProductDialog from "./ProductDialog";

interface EditProductProps {
  product: Product & { Extras: Extra[]; Size: Size[] };
  categories: Category[];
}

export default function EditProduct({ product, categories }: EditProductProps) {
  const [open, setOpen] = useState(false);

  return (
    <ProductDialog
      productToEdit={product}
      categories={categories}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button className="w-full justify-start p-2 h-auto">Editar</Button>
      }
    />
  );
}
