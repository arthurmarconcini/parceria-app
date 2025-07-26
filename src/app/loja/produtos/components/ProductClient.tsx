"use client";

import { Category, Extra, Product, Size } from "@prisma/client";
import { useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

import { ProductActions } from "./ProductActions";
import { ProductForm } from "./ProductForm";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/helpers/currency-format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type ProductWithRelations = Product & {
  category: Category;
  Size: Size[];
  Extras: Extra[];
};

interface ProductClientProps {
  products: ProductWithRelations[];
  categories: Category[];
}

export const ProductClient = ({ products, categories }: ProductClientProps) => {
  const [productToEdit, setProductToEdit] =
    useState<ProductWithRelations | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const handleEditClick = (product: ProductWithRelations) => {
    setProductToEdit(product);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCancelEdit = () => {
    setProductToEdit(null);
  };

  const handleSuccess = () => {
    setProductToEdit(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6">
      {/* Coluna da Tabela de Produtos */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Produtos Cadastrados</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden md:table-cell">
                  Categoria
                </TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden md:table-cell">
                    <Image
                      src={product.imageUrl || ""}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.Size && product.Size.length > 0 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-xs h-auto p-1"
                          >
                            A partir de {formatBRL(product.Size[0].price)}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>
                            Tamanhos e Preços
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {product.Size.map((size) => (
                            <DropdownMenuItem
                              key={size.id}
                              className="flex justify-between"
                            >
                              <span>{size.name}</span>
                              <span className="font-semibold ml-4">
                                {formatBRL(size.price)}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      formatBRL(product.price || 0)
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.category.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    <Badge
                      variant={product.isActive ? "success" : "destructive"}
                    >
                      {product.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ProductActions
                      product={product}
                      onEdit={() => handleEditClick(product)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Coluna do Formulário */}
      <div ref={formRef}>
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="text-2xl font-bold">
            {productToEdit ? "Editar Produto" : "Novo Produto"}
          </h2>
          {productToEdit && (
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
              Cancelar Edição
            </Button>
          )}
        </div>
        <ProductForm
          categories={categories}
          product={productToEdit}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};
