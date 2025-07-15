"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importe o ScrollArea
import { ProductForm } from "./ProductForm";
import { addProduct, updateProduct } from "../actions/product";
import { Product, Category } from "@prisma/client";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product & { Size: { name: string; price: number }[] };
  categories: Category[];
}

export const ProductFormDialog = ({
  open,
  onOpenChange,
  product,
  categories,
}: ProductFormDialogProps) => {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsPending(true);
    const action = product ? updateProduct(product.id, data) : addProduct(data);

    toast.promise(action, {
      loading: product ? "Atualizando produto..." : "Criando produto...",
      success: (res) => {
        if (res.success) {
          onOpenChange(false);
          return `Produto ${product ? "atualizado" : "criado"} com sucesso!`;
        }
        throw new Error(
          typeof res.error === "object" &&
          res.error !== null &&
          "fieldErrors" in res.error
            ? JSON.stringify(
                (res.error as { fieldErrors: unknown }).fieldErrors
              )
            : String(res.error)
        );
      },
      error: (err) => err.message,
      finally: () => setIsPending(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <ScrollArea className="max-h-[80vh] overflow-y-auto">
          {" "}
          {/* Ajuste a altura máxima conforme necessário */}
          <DialogHeader>
            <DialogTitle>
              {product ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              {product
                ? "Altere as informações do produto."
                : "Adicione um novo produto ao seu cardápio."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={product}
            categories={categories}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
