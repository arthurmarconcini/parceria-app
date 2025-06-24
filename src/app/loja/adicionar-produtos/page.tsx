import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/prisma";
import AddProduct from "./components/AddProduct";
import { formatBRL } from "@/helpers/currency-format";
import ConfirmDeleteProductDialog from "./components/ConfirmDeleteProductDialog";

const AddProductsPage = async () => {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      Size: true,
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
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  {product.name}
                  <p className="text-xs text-muted-foreground md:hidden">
                    {product.category.name}
                  </p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.category.name}
                </TableCell>
                <TableCell>
                  {product.category.name.toLowerCase() === "pizzas" ? (
                    <div className="text-xs space-y-1">
                      {product.Size.map((size) => (
                        <div
                          key={size.id}
                          className="flex justify-between items-center gap-2"
                        >
                          <span>{size.name}:</span>
                          <span className="font-semibold">
                            {formatBRL(size.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    formatBRL(product.price || 0)
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <ConfirmDeleteProductDialog productId={product.id} />
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
