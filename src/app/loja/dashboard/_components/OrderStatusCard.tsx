import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import currencyFormat from "@/helpers/currency-format";
import { Prisma, Status } from "@prisma/client";
import OrderStatusCardButtons from "./OrderStatusCardButtons";
import { translateStatus } from "@/helpers/translate-status";
import PrintOrderReceipt from "./PrintOrderReceipt";

interface OrderStatusCardProps {
  orders: Prisma.OrderGetPayload<{
    include: { items: true; user: { include: { addresses: true } } };
  }>[];
  status: Status;
}

const getColorClass = (status: Status) => {
  switch (status) {
    case "PENDING":
      return "bg-red-50";
    case "IN_PREPARATION":
      return "bg-blue-100";
    case "IN_TRANSIT":
      return "bg-yellow-100";
    case "DELIVERED":
      return "bg-green-100";
    case "CANCELED":
      return "bg-gray-100";
    default:
      return "bg-white";
  }
};

const OrderStatusCard = ({ orders, status }: OrderStatusCardProps) => {
  const colorClass = getColorClass(status);

  return (
    <Card className={`${colorClass} min-w-[400px]`}>
      <CardHeader>
        <CardTitle>{`${translateStatus(status)} (${orders.length})`}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 overflow-scroll h-[500px]">
          {orders.map((order) => (
            <li key={order.id} className="bg-white rounded-xs p-2">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-lg">{`Pedido #${
                  order.orderNumber.split(`-`)[3]
                }`}</h1>
                <h2 className="text-xs">
                  {order.createdAt.toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </h2>
              </div>

              <div>
                <p className="font-semibold text-sm">{order.user.name}</p>

                {order.user.addresses
                  .filter((address) => address.isDefault === true)
                  .map((address) => (
                    <p key={address.id} className="text-sm">
                      {address.street}, {address.number}, {address.city} -
                      {address.state}
                    </p>
                  ))}
                <p className="mt-1 font-bold">{currencyFormat(order.total)}</p>
                <PrintOrderReceipt orderId={order.id} />

                {status !== "DELIVERED" ? (
                  <OrderStatusCardButtons status={status} orderId={order.id} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default OrderStatusCard;
