// src/app/pedidos/_components/OrderCard.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import currencyFormat from "@/helpers/currency-format";
import { translateStatus } from "@/helpers/translate-status";
import Image from "next/image";
import { DetailedOrder } from "./UserOrdersClient";

interface OrderCardProps {
  order: DetailedOrder;
  onSelectOrder: () => void;
}

export default function OrderCard({ order, onSelectOrder }: OrderCardProps) {
  const statusVariant = {
    PENDING: "default",
    IN_PREPARATION: "default",
    IN_TRANSIT: "default",
    DELIVERED: "success",
    CANCELED: "destructive",
  }[order.status] as "default" | "success" | "destructive";

  return (
    <Card
      onClick={onSelectOrder}
      className="flex cursor-pointer flex-col overflow-hidden transition-all hover:border-primary hover:shadow-lg"
    >
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-base font-bold">
          Pedido #{order.orderNumber}
        </CardTitle>
        <Badge variant={statusVariant}>{translateStatus(order.status)}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-4 pt-0">
        <div className="flex -space-x-4">
          {order.items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-background"
            >
              <Image
                src={item.product.imageUrl || "/placeholder.png"}
                alt={item.product.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-muted">
              <span className="text-xs font-bold text-muted-foreground">
                +{order.items.length - 3}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-col items-start gap-2">
          <span className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "long",
            }).format(new Date(order.createdAt))}
          </span>
          <span className="text-lg font-bold text-foreground">
            {currencyFormat(order.total)}
          </span>
          <Button variant="outline" className="mt-2 w-full">
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
