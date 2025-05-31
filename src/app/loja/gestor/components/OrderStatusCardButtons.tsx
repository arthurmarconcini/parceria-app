"use client";

import { Button } from "@/components/ui/button";
import { Status } from "@prisma/client";
import {
  AcceptOrder,
  DeleteOrderPermanently, // Usar a ação de exclusão permanente
  RejectOrder,
  ResumeOrder,
  UpdateResult,
} from "../actions/statusButtons";

interface OrderStatusCardButtonsProps {
  orderId: string;
  status: Status;
  onStatusUpdate: (result: UpdateResult) => void; // Callback para atualizar a UI no GestorClient
}

const OrderStatusCardButtons = ({
  orderId,
  status,
  onStatusUpdate,
}: OrderStatusCardButtonsProps) => {
  const handleAcceptOrder = async () => {
    const result = await AcceptOrder(orderId, status);
    onStatusUpdate(result);
  };

  const handleRejectOrder = async () => {
    // Marca como Cancelado
    const result = await RejectOrder(orderId);
    onStatusUpdate(result);
  };

  const handleResumeOrder = async () => {
    // Volta para Pendente
    const result = await ResumeOrder(orderId);
    onStatusUpdate(result);
  };

  const handleDeleteOrder = async () => {
    // Exclui permanentemente
    const result = await DeleteOrderPermanently(orderId);
    onStatusUpdate(result);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-2">
      {status === "PENDING" && (
        <Button className="flex-1" onClick={handleAcceptOrder}>
          Aceitar e Preparar
        </Button>
      )}
      {status === "IN_PREPARATION" && (
        <Button className="flex-1" onClick={handleAcceptOrder}>
          Enviar (Em Trânsito)
        </Button>
      )}
      {status === "IN_TRANSIT" && (
        <Button className="flex-1" onClick={handleAcceptOrder}>
          Marcar como Entregue
        </Button>
      )}

      {/* Botão para cancelar (mudar status para CANCELED) */}
      {status !== "DELIVERED" && status !== "CANCELED" && (
        <Button
          variant={"outline"} // Pode ser 'destructive' se preferir um destaque maior para cancelamento
          onClick={handleRejectOrder}
          className="flex-1 sm:flex-auto"
        >
          Cancelar Pedido
        </Button>
      )}

      {/* Ações específicas para pedidos já cancelados */}
      {status === "CANCELED" && (
        <>
          <Button className="flex-1" onClick={handleResumeOrder}>
            Retomar Pedido
          </Button>
          <Button
            variant={"destructive"}
            onClick={handleDeleteOrder}
            className="flex-1"
          >
            Excluir Perm.
          </Button>
        </>
      )}
    </div>
  );
};

export default OrderStatusCardButtons;
