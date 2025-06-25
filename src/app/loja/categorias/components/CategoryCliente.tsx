"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CategoryForm } from "./CategoryForm";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../actions/categoryActions";

interface CategoryClientProps {
  categories: Category[];
}

export default function CategoryClient({
  categories: initialCategories,
}: CategoryClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleOpenForm = (category: Category | null = null) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: { name: string }) => {
    const isEditing = !!selectedCategory;
    const action = isEditing
      ? updateCategory(selectedCategory.id, data.name)
      : createCategory(data.name);

    toast.promise(action, {
      loading: isEditing ? "Atualizando..." : "Criando...",
      success: (res) => {
        if (!res.success || !res.category) {
          throw new Error(res.error || "A resposta da ação falhou.");
        }
        setIsFormOpen(false);

        if (isEditing) {
          setCategories((prev) =>
            prev
              .map((cat) => (cat.id === res.category!.id ? res.category! : cat))
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        } else {
          setCategories((prev) =>
            [...prev, res.category!].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
        }

        router.refresh();

        return `Categoria ${isEditing ? "atualizada" : "criada"} com sucesso!`;
      },
      error: (err) => err.message || "Ocorreu um erro.",
    });
  };

  const handleDelete = async (id: string) => {
    toast.promise(deleteCategory(id), {
      loading: "Excluindo...",
      success: (res) => {
        if (!res.success) {
          throw new Error(res.error);
        }

        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        return "Categoria excluída com sucesso!";
      },
      error: (err) => err.message || "Ocorreu um erro.",
    });
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date));

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">ID</TableHead>
              <TableHead className="hidden sm:table-cell">Criado em</TableHead>
              <TableHead className="hidden sm:table-cell">
                Atualizado em
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                  {category.id}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatDate(category.createdAt)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatDate(category.updatedAt)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenForm(category)}
                  >
                    Editar
                  </Button>
                  <DeleteCategoryDialog
                    onDelete={() => handleDelete(category.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        category={selectedCategory}
      />
    </>
  );
}
