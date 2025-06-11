"use server";

import { db } from "@/lib/prisma";
import { Order, Status } from "@prisma/client";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export interface UpdateResult {
  success: boolean;
  updatedOrder?: Order;
  deletedOrderId?: string;
  error?: string;
}

const STATUS_ORDER_SEQUENCE: Status[] = [
  "PENDING",
  "IN_PREPARATION",
  "IN_TRANSIT",
  "DELIVERED",
];

const getNextStatus = (currentStatus: Status): Status | null => {
  if (currentStatus === "CANCELED" || currentStatus === "DELIVERED") {
    return null;
  }
  const currentIndex = STATUS_ORDER_SEQUENCE.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= STATUS_ORDER_SEQUENCE.length - 1) {
    return null;
  }
  return STATUS_ORDER_SEQUENCE[currentIndex + 1];
};

export const AcceptOrder = async (
  orderId: string,
  currentStatus: Status
): Promise<UpdateResult> => {
  try {
    const nextStatus = getNextStatus(currentStatus);

    if (!nextStatus) {
      return {
        success: false,
        error:
          "Não é possível avançar o status deste pedido ou ele já está finalizado.",
      };
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
      include: {
        user: true,
        address: { include: { locality: true } },
        items: {
          include: {
            product: true,
            Size: true,
            orderExtras: {
              include: {
                extra: true,
              },
            },
            HalfHalf: { include: { firstHalf: true, secondHalf: true } },
          },
        },
      },
    });
    await pusher.trigger("pedidos", "status-atualizado", updatedOrder);

    return { success: true, updatedOrder };
  } catch (error) {
    console.error("Erro ao aceitar/avançar o status do pedido:", error);
    return {
      success: false,
      error: "Erro ao aceitar/avançar o status do pedido.",
    };
  }
};

export const RejectOrder = async (orderId: string): Promise<UpdateResult> => {
  try {
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status: "CANCELED" },
    });
    return { success: true, updatedOrder };
  } catch (error) {
    console.error("Erro ao cancelar o pedido (RejectOrder):", error);
    return { success: false, error: "Erro ao cancelar o pedido." };
  }
};

export const ResumeOrder = async (orderId: string): Promise<UpdateResult> => {
  try {
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status: "PENDING" },
    });
    return { success: true, updatedOrder };
  } catch (error) {
    console.error("Erro ao retomar o pedido:", error);
    return { success: false, error: "Erro ao retomar o pedido." };
  }
};

export const DeleteOrderPermanently = async (
  orderId: string
): Promise<UpdateResult> => {
  try {
    await db.order.delete({
      where: { id: orderId },
    });
    return { success: true, deletedOrderId: orderId };
  } catch (error) {
    console.error("Erro ao excluir o pedido permanentemente:", error);
    return {
      success: false,
      error: "Erro ao excluir o pedido permanentemente.",
    };
  }
};

export { DeleteOrderPermanently as CancelOrder };
