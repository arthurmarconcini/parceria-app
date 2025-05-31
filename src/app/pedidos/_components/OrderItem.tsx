import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import currencyFormat from "@/helpers/currency-format";
import { translateStatus } from "@/helpers/translate-status";
import { Prisma } from "@prisma/client";
import Image from "next/image";

interface OrderItemProps {
  order: Prisma.OrderGetPayload<{
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
  }>;
}

const OrderItem = ({ order }: OrderItemProps) => {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>{`Pedido #${order.id}`}</CardTitle>
          <p className="text-sm ">{order.createdAt.toLocaleDateString()}</p>
        </div>
        <h2 className="text-semibold text-primary">
          {translateStatus(order.status)}
        </h2>
      </CardHeader>
      <CardContent>
        <ul>
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-2">
              <Image
                src={item.product.imageUrl ?? ""}
                alt={item.product.name}
                width={50}
                height={50}
                className="rounded-sm object-contain"
              />
              <div className="flex justify-between flex-1">
                <div>
                  <div>
                    <h1 className="text-sm font-semibold">
                      x{item.quantity} {item.product.name}
                    </h1>
                    <p className="text-xs">Descricao do item</p>
                  </div>
                  {item.orderExtras.map((orderExtra) => {
                    return (
                      <p key={orderExtra.id} className="text-xs">
                        {orderExtra.extra.name}
                      </p>
                    );
                  })}
                </div>
                <p className="text-lg font-bold">
                  {currencyFormat(item.priceAtTime)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default OrderItem;
