"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { deleteProduct } from "../actions/product";
import { useRouter } from "next/navigation";

interface ConfirmDeleteProductDialogProps {
  productId: string;
}

const ConfirmDeleteProductDialog = ({
  productId,
}: ConfirmDeleteProductDialogProps) => {
  const router = useRouter();

  const handleDeleteProduct = async (productId: string) => {
    const result = await deleteProduct(productId);

    if (result) {
      router.refresh();
      alert("Produto excluído com sucesso!");
    } else {
      alert("Erro ao excluir produto!");
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="link"
          className="cursor-pointer hover:text-destructive"
        >
          <X />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deseja excluir esse produto?</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteProduct(productId)}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteProductDialog;
