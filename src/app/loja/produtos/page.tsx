import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/prisma";
import { formatBRL } from "@/helpers/currency-format";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProductActions } from "./components/ProductActions"; // Importe o novo componente
import { PlusCircle } from "lucide-react";

const ProductsPage = async () => {
  const products = await db.product.findMany({
    include: {
      category: true,
      Size: {
        orderBy: {
          price: "asc",
        },
      },
      Extras: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
        {/* Botão para adicionar novo produto (a lógica de estado será no ProductClient) */}
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="hidden md:table-cell text-center">
                Status
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                data-state={product.isActive ? "" : "inactive"}
              >
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.category.name}
                </TableCell>
                <TableCell>
                  {product.Size && product.Size.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-xs h-auto p-1">
                          A partir de {formatBRL(product.Size[0].price)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Tamanhos e Preços</DropdownMenuLabel>
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
                <TableCell className="hidden md:table-cell text-center">
                  <Badge variant={product.isActive ? "success" : "destructive"}>
                    {product.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {/* Componente de Ações */}
                  <ProductActions product={product} categories={categories} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductsPage;
