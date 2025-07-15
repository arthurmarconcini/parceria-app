import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/prisma";
import AddProduct from "./components/ProductDialog";
import { formatBRL } from "@/helpers/currency-format";
import ConfirmDeleteProductDialog from "./components/ConfirmDeleteProductDialog";
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
import { MoreHorizontal } from "lucide-react";
import EditProduct from "./components/EditProduct";
// <-- Importaremos o novo componente de edição

const AddProductsPage = async () => {
  const products = await db.product.findMany({
    where: { isActive: true },
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
        <AddProduct categories={categories} />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="hidden md:table-cell text-center">
                Desconto
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  {product.name}
                  <div className="text-xs text-muted-foreground md:hidden mt-1">
                    <p>{product.category.name}</p>
                    {product.discount && product.discount > 0 && (
                      <p>
                        Desconto:{" "}
                        <Badge variant="destructive">
                          {product.discount}% OFF
                        </Badge>
                      </p>
                    )}
                  </div>
                </TableCell>
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
                  {product.discount && product.discount > 0 ? (
                    <Badge variant="destructive">{product.discount}% OFF</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <EditProduct
                          product={product}
                          categories={categories}
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <ConfirmDeleteProductDialog productId={product.id} />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AddProductsPage;
