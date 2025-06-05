// src/app/pedidos/_components/OrderDetailDialog.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import currencyFormat from "@/helpers/currency-format";
import { DetailedOrder } from "./UserOrdersClient";
import Image from "next/image";

interface OrderDetailDialogProps {
  order: DetailedOrder | null;
  onOpenChange: (open: boolean) => void;
}

export default function OrderDetailDialog({
  order,
  onOpenChange,
}: OrderDetailDialogProps) {
  if (!order) {
    return null;
  }

  // Calcula o total dos produtos (subtotal)
  const subtotal = order.items.reduce((acc, item) => {
    const extrasTotal = item.orderExtras.reduce(
      (extraAcc, extra) => extraAcc + extra.priceAtTime * extra.quantity,
      0
    );
    return acc + (item.priceAtTime + extrasTotal) * item.quantity;
  }, 0);

  const discount = subtotal - order.total;

  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            Realizado em{" "}
            {new Date(order.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <Image
                  src={item.product.imageUrl || "/placeholder.png"}
                  alt={item.product.name}
                  width={60}
                  height={60}
                  className="rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x {currencyFormat(item.priceAtTime)}
                  </p>
                  {item.orderExtras.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <strong>Adicionais:</strong>{" "}
                      {item.orderExtras.map((e) => e.extra.name).join(", ")}
                    </div>
                  )}
                </div>
                <p className="font-semibold">
                  {currencyFormat(item.priceAtTime * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{currencyFormat(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Descontos</span>
                <span>- {currencyFormat(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrega</span>
              <span>{currencyFormat(order.deliveryFee ?? 0)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{currencyFormat(order.total)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
