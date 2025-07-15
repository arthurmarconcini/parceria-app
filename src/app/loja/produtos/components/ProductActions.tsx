"use client";

import { useState } from "react";
import { Category, Product, Size, Extra } from "@prisma/client";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toggleProductStatus } from "../actions/product";
import { useRouter } from "next/navigation";
// Um modal/dialog de confirmação seria importado aqui
// import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

// Tipagem completa do produto para o componente
type ProductWithDetails = Product & {
  category: Category;
  Size: Size[];
  Extras: Extra[];
};

interface ProductActionsProps {
  product: ProductWithDetails;
  categories: Category[]; // Para o formulário de edição
}

export function ProductActions({ product }: ProductActionsProps) {
  const [isActive, setIsActive] = useState(product.isActive);
  const router = useRouter();

  const handleStatusToggle = async () => {
    const newStatus = !isActive;
    setIsActive(newStatus); // Otimista UI update

    toast.promise(toggleProductStatus(product.id, !newStatus), {
      loading: "Alterando status...",
      success: () => {
        router.refresh(); // Revalida os dados da página
        return `Produto ${newStatus ? "ativado" : "desativado"} com sucesso.`;
      },
      error: (err) => {
        setIsActive(!newStatus); // Reverte em caso de erro
        return (
          (err as Error).message || "Falha ao alterar o status do produto."
        );
      },
    });
  };

  const handleDelete = () => {
    // A lógica para deletar o produto, geralmente com um dialog de confirmação, viria aqui.
    // Ex: openDeleteDialog(product.id)
    toast.info("Funcionalidade de exclusão a ser implementada.");
  };

  const handleEdit = () => {
    // A lógica para abrir o formulário de edição, possivelmente em um modal, viria aqui.
    // Ex: openEditModal(product)
    toast.info("Funcionalidade de edição a ser implementada.");
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {isActive ? "Ativo" : "Inativo"}
        </span>
        <Switch
          checked={isActive}
          onCheckedChange={handleStatusToggle}
          aria-label="Ativar ou desativar produto"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
