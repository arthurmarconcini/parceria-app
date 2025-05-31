"use server";

import { db } from "@/lib/prisma";
import { Status } from "@prisma/client";

const STATUS_ORDER: Status[] = [
  "PENDING",
  "IN_PREPARATION",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELED",
];

const getNextStatus = (currentStatus: Status): Status | null => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === STATUS_ORDER.length - 1) {
    return null; // Não há próximo status
  }
  return STATUS_ORDER[currentIndex + 1];
};

const AcceptOrder = async (orderId: string, currentStatus: Status) => {
  try {
    const nextStatus = getNextStatus(currentStatus);

    if (!nextStatus) {
      throw new Error("Não há próximo status.");
    }

    await db.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: nextStatus,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar o status do pedido:", error);
    throw error;
  }
};

const RejectOrder = async (orderId: string) => {
  await db.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "CANCELED",
    },
  });
};

const ResumeOrder = async (orderId: string) => {
  await db.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "PENDING",
    },
  });
};

const CancelOrder = async (orderId: string) => {
  await db.order.delete({
    where: {
      id: orderId,
    },
  });
};

export { AcceptOrder, RejectOrder, CancelOrder, ResumeOrder };
