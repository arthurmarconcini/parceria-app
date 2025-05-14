import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import AddProduct from "./components/AddProduct";
import { formatBRL } from "@/helpers/currency-format";
import ConfirmDeleteProductDialog from "./components/ConfirmDeleteProductDialog";

const AddProductsPage = async () => {
  const session = await auth();

  if (!session || !session.user || session.user.role === "USER") {
    return redirect("/");
  }

  const products = await db.product.findMany({
    include: {
      category: true,
      Size: true,
    },
  });

  const categories = await db.category.findMany();

  return (
    <div className="mt-10 pb-10 container mx-auto flex gap-2 flex-col items-center min-h-screen">
      <div className="w-full flex">
        <AddProduct categories={categories} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Preco</TableHead>
            <TableHead>Desconto</TableHead>
            <TableHead>Categoria</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.name}</TableCell>
              {product.category.name === "Pizzas" ? (
                <TableCell>
                  {product.Size.map((size) => (
                    <p key={size.id}>
                      {size.name} - {formatBRL(size.price)}
                    </p>
                  ))}
                </TableCell>
              ) : (
                <TableCell>{formatBRL(product.price || 0)}</TableCell>
              )}
              <TableCell>
                {product.discount ? product.discount * 10 : 0}%
              </TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>
                <ConfirmDeleteProductDialog productId={product.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AddProductsPage;
