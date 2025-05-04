"use client";

import { Button } from "@/components/ui/button";

import {
  AcceptOrder,
  CancelOrder,
  RejectOrder,
  ResumeOrder,
} from "../_actions/statusButtons";
import { useRouter } from "next/navigation";
import { Status } from "@prisma/client";

const OrderStatusCardButtons = ({
  orderId,
  status,
}: {
  orderId: string;
  status: Status;
}) => {
  const router = useRouter();

  const handleAcceptOrder = async (orderId: string) => {
    await AcceptOrder(orderId, status);

    router.refresh();
  };

  const handleRejectOrder = async (orderId: string) => {
    await RejectOrder(orderId);

    router.refresh();
  };

  const handleResumeOrder = async (orderId: string) => {
    await ResumeOrder(orderId);

    router.refresh();
  };

  const handleCancelOrder = async (orderId: string) => {
    await CancelOrder(orderId);

    router.refresh();
  };

  return (
    <div className="flex gap-2 mt-2">
      {status !== "CANCELED" ? (
        <Button className="flex-1" onClick={() => handleAcceptOrder(orderId)}>
          Aceitar
        </Button>
      ) : (
        <Button
          className="flex-1 cursor-pointer"
          onClick={() => handleResumeOrder(orderId)}
        >
          Retomar
        </Button>
      )}

      {status !== "CANCELED" ? (
        <Button
          variant={"destructive"}
          onClick={() => handleRejectOrder(orderId)}
        >
          Cancelar
        </Button>
      ) : (
        <Button
          variant={"destructive"}
          onClick={() => handleCancelOrder(orderId)}
          className="flex-2"
        >
          Excluir
        </Button>
      )}
    </div>
  );
};

export default OrderStatusCardButtons;
