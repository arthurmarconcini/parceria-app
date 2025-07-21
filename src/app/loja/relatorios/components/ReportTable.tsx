import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Skeleton } from "@/components/ui/skeleton";
import { translateStatus } from "@/helpers/translate-status";
import { OrderWithUser } from "./ReportClient";
import currencyFormat from "@/helpers/currency-format";

interface ReportTableProps {
  orders: OrderWithUser[];
  isLoading: boolean;
}

/**
 * Tabela que exibe a lista de pedidos do relatório.
 */
const ReportTable = ({ orders, isLoading }: ReportTableProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Detalhes das Vendas</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Exibe esqueletos de carregamento enquanto os dados são buscados.
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              // Renderiza os dados dos pedidos.
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.orderNumber}
                  </TableCell>
                  <TableCell>
                    {order.user?.name || order.guestName || "Convidado"}
                  </TableCell>
                  <TableCell>
                    {format(order.createdAt, "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge>{translateStatus(order.status)}</Badge>
                  </TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell className="text-right">
                    {currencyFormat(order.total)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Mensagem para quando não há resultados.
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReportTable;
