"use client";

import { Prisma } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import OrderCard from "./OrderCard";
import { FiltersState, OrderFilters } from "./OrdersFilters";
import OrderDetailDialog from "./OrderDetailDialog";
import Pusher from "pusher-js";

export type DetailedOrder = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
        Size: true;
        orderExtras: { include: { extra: true } };
        HalfHalf: { include: { firstHalf: true; secondHalf: true } };
      };
    };
    address: { include: { locality: true } };
  };
}>;

interface UserOrdersClientProps {
  orders: DetailedOrder[];
}

export const UserOrdersClient = ({ orders }: UserOrdersClientProps) => {
  const [realTimeOrders, setRealTimeOrders] = useState<DetailedOrder[]>(orders);
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(
    null
  );
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    date: null,
  });

  const filteredOrders = useMemo(() => {
    return realTimeOrders.filter((order) => {
      // Filtro de busca por nome do produto
      const searchMatch =
        filters.search.trim() === "" ||
        order.items.some((item) =>
          item.product.name.toLowerCase().includes(filters.search.toLowerCase())
        );

      // Filtro por data
      const dateMatch =
        !filters.date ||
        new Date(order.createdAt).toDateString() ===
          new Date(filters.date).toDateString();

      return searchMatch && dateMatch;
    });
  }, [realTimeOrders, filters]);

  const handleOpenDetails = (order: DetailedOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("pedidos");

    channel.bind("status-atualizado", (updatedOrder: DetailedOrder) => {
      setRealTimeOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("pedidos");
    };
  }, []);

  return (
    <>
      <OrderFilters filters={filters} onFilterChange={setFilters} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onSelectOrder={() => handleOpenDetails(order)}
          />
        ))}
      </div>

      <OrderDetailDialog
        order={selectedOrder}
        onOpenChange={handleCloseDetails}
      />
    </>
  );
};
