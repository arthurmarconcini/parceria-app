"use client";

import { Prisma, Status } from "@prisma/client";
import currencyFormat from "@/helpers/currency-format";

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

interface OrderListItemProps {
  pedido: DetailedOrder;
  isSelected: boolean;
  onSelectPedido: (pedido: DetailedOrder) => void;
  statusDisplay: Record<Status, string>;
  statusVisuals: Record<Status, { ribbon: string; tag: string }>;
}

const OrderListItem: React.FC<OrderListItemProps> = ({
  pedido,
  isSelected,
  onSelectPedido,
  statusDisplay,
  statusVisuals,
}) => {
  return (
    <div
      className={`bg-background border border-border p-3 rounded-lg relative cursor-pointer hover:border-primary transition-all duration-150 ease-in-out ${
        isSelected
          ? "ring-2 ring-primary border-primary shadow-xl"
          : "shadow-sm hover:shadow-md"
      }`}
      onClick={() => onSelectPedido(pedido)}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-md ${
          statusVisuals[pedido.status]?.ribbon || "bg-gray-300"
        }`}
      />
      <div className="ml-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm md:text-base font-semibold text-foreground truncate pr-2">
            #{pedido.orderNumber.split("-")[3]} - {pedido.user.name}
          </h2>
          <span
            className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
              statusVisuals[pedido.status]?.tag || "bg-gray-200 text-gray-800"
            }`}
          >
            {statusDisplay[pedido.status]}
          </span>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">
          {new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(pedido.createdAt))}
          {" - "}
          {currencyFormat(
            pedido.total + (pedido.isDelivery ? pedido.deliveryFee || 0 : 0)
          )}
        </p>
      </div>
    </div>
  );
};

export default OrderListItem;
