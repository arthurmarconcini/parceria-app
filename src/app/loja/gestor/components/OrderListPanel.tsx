"use client";

import { Prisma, Status } from "@prisma/client";
import { Button } from "@/components/ui/button";
import OrderListItem from "./OrderListItem"; // Será criado a seguir

// Tipos que serão passados como props
type DetailedOrder = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
        Size: true;
        orderExtras: { include: { extra: true } };
        HalfHalf: { include: { firstHalf: true; secondHalf: true } };
      };
    };
    user: true;
    address: { include: { locality: true } };
  };
}>;

interface OrderListPanelProps {
  loading: boolean;
  pedidos: DetailedOrder[];
  selectedPedidoId: string | null;
  onSelectPedido: (pedido: DetailedOrder) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: Status | "todos";
  onStatusFilterChange: (status: Status | "todos") => void;
  statusDisplay: Record<Status, string>;
  statusVisuals: Record<Status, { ribbon: string; tag: string }>;
  className?: string;
}

const OrderListPanel: React.FC<OrderListPanelProps> = ({
  loading,
  pedidos,
  selectedPedidoId,
  onSelectPedido,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  statusDisplay,
  statusVisuals,
  className,
}) => {
  return (
    <div
      className={`flex flex-col w-full bg-card text-card-foreground p-3 md:p-4 rounded-lg shadow-lg ${className}`}
    >
      <div className="p-1">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Pedidos do Dia
        </h1>
        <input
          type="text"
          placeholder="Buscar por nome, nº ou hora"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full mt-3 mb-3 p-2 rounded-md bg-background text-foreground border border-border focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="px-1 pb-3">
        <div className="flex gap-2 flex-wrap">
          {(
            [
              "todos",
              "PENDING",
              "IN_PREPARATION",
              "IN_TRANSIT",
              "DELIVERED",
              "CANCELED",
            ] as const
          ).map((statusKey) => (
            <Button
              key={statusKey}
              variant={statusFilter === statusKey ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusFilterChange(statusKey)}
              className={`text-xs md:text-sm ${
                statusFilter === statusKey ? "font-semibold" : ""
              }`}
            >
              {statusKey === "todos"
                ? "Todos"
                : statusDisplay[statusKey as Status]}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Carregando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Nenhum pedido encontrado para hoje.
          </div>
        ) : (
          pedidos.map((pedido) => (
            <OrderListItem
              key={pedido.id}
              pedido={pedido}
              isSelected={selectedPedidoId === pedido.id}
              onSelectPedido={onSelectPedido}
              statusDisplay={statusDisplay}
              statusVisuals={statusVisuals}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OrderListPanel;
