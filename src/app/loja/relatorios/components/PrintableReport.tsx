import { forwardRef } from "react";
import { PaymentMethod, Status } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { translateStatus } from "@/helpers/translate-status";

import { Separator } from "@/components/ui/separator";
import { OrderWithUser } from "./ReportClient";
import currencyFormat from "@/helpers/currency-format";

interface PrintableReportProps {
  orders: OrderWithUser[];
  filters: {
    date: DateRange | undefined;
    status?: string;
    paymentMethod?: string;
  };
}

/**
 * Componente formatado para impressão em impressora térmica.
 * Utiliza `forwardRef` para que o `useReactToPrint` possa acessá-lo.
 */
const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ orders, filters }, ref) => {
    // Calcula os totais e resumos com base nos dados filtrados.
    const totalAmount = orders.reduce((acc, order) => acc + order.total, 0);
    const totalOrders = orders.length;

    const paymentSummary = orders.reduce((acc, order) => {
      const method = order.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count += 1;
      acc[method].total += order.total;
      return acc;
    }, {} as Record<PaymentMethod, { count: number; total: number }>);

    return (
      <div ref={ref} className="p-2 text-xs font-mono bg-white text-black">
        <div className="text-center mb-2">
          <h1 className="font-bold text-sm">Relatório de Vendas</h1>
          <p>Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
        </div>

        <Separator className="my-2 bg-black" />

        <div>
          <h2 className="font-bold">Filtros Aplicados</h2>
          <p>
            Período:{" "}
            {filters.date?.from &&
              format(filters.date.from, "dd/MM/yy", { locale: ptBR })}
            {filters.date?.to &&
              ` - ${format(filters.date.to, "dd/MM/yy", { locale: ptBR })}`}
          </p>
          {filters.status && (
            <p>Status: {translateStatus(filters.status as Status)}</p>
          )}
          {filters.paymentMethod && <p>Pagamento: {filters.paymentMethod}</p>}
        </div>

        <Separator className="my-2 bg-black" />

        <div>
          <h2 className="font-bold">Resumo Geral</h2>
          <p>Faturamento Total: {currencyFormat(totalAmount)}</p>
          <p>Total de Pedidos: {totalOrders}</p>
        </div>

        <Separator className="my-2 bg-black" />

        <div>
          <h2 className="font-bold">Resumo por Pagamento</h2>
          {Object.entries(paymentSummary).map(([method, summary]) => (
            <div key={method}>
              <p className="capitalize">
                {method.replace("_", " ").toLowerCase()}: {summary.count}{" "}
                pedido(s) - {currencyFormat(summary.total)}
              </p>
            </div>
          ))}
        </div>

        <Separator className="my-2 bg-black" />

        <div>
          <h2 className="font-bold">Lista de Pedidos</h2>
          {orders.map((order) => (
            <div key={order.id} className="mt-2">
              <p>
                #{order.orderNumber} - {format(order.createdAt, "HH:mm")} -{" "}
                {currencyFormat(order.total)}
              </p>
              <p>
                Cliente: {order.user?.name || order.guestName || "Convidado"}
              </p>
              <p>
                Status: {translateStatus(order.status)} | Pag:{" "}
                {order.paymentMethod}
              </p>
              <Separator className="my-1 bg-black opacity-50" />
            </div>
          ))}
        </div>
      </div>
    );
  }
);

PrintableReport.displayName = "PrintableReport";

export default PrintableReport;
