import { Prisma } from "@prisma/client";
import OrderItem from "./OrderItem";

interface OrderListProps {
  orders: Prisma.OrderGetPayload<{
    include: {
      items: {
        include: {
          product: true;
          orderExtras: {
            include: {
              extra: true;
            };
          };
        };
      };
    };
  }>[];
}

const OrderList = ({ orders }: OrderListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
};

export default OrderList;
