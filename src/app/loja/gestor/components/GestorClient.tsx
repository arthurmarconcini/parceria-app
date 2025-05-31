"use client";

import { Prisma, Status } from "@prisma/client";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

import OrderListPanel from "./OrderListPanel";
import OrderDetailPanel from "./OrderDetailPanel";
import { UpdateResult } from "../actions/statusButtons";

// Tipo para o pedido detalhado, usado em todo o componente
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
    user: true;
    address: { include: { locality: true } };
  };
}>;

const GestorClient = () => {
  const [loading, setLoading] = useState(false);
  const [pedidos, setPedidos] = useState<DetailedOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "todos">("todos");
  const [selectedPedido, setSelectedPedido] = useState<DetailedOrder | null>(
    null
  );

  const isMobile = useIsMobile();

  // Efeito para buscar os pedidos da API
  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/orders"); // API já filtra por dia
        const data: DetailedOrder[] = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        // Considerar adicionar um toast de erro para o usuário
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  // Callback para atualizar o estado local após uma mudança de status
  const handleStatusUpdate = (result: UpdateResult) => {
    if (result.success) {
      if (result.updatedOrder) {
        const updatedOrder = result.updatedOrder;
        setPedidos((prevPedidos) =>
          prevPedidos.map((p) =>
            p.id === updatedOrder.id
              ? {
                  ...p,
                  status: updatedOrder.status,
                  updatedAt: updatedOrder.updatedAt,
                } // Atualiza apenas campos diretos do pedido
              : p
          )
        );
        if (selectedPedido && selectedPedido.id === updatedOrder.id) {
          setSelectedPedido((prevSelected) => {
            if (!prevSelected) return null;
            // Mantém as relações (items, user, address) e atualiza o status e updatedAt
            return {
              ...prevSelected,
              status: updatedOrder.status,
              updatedAt: updatedOrder.updatedAt,
            };
          });
        }
        // Ex: toast.success("Status do pedido atualizado!");
      } else if (result.deletedOrderId) {
        setPedidos((prevPedidos) =>
          prevPedidos.filter((p) => p.id !== result.deletedOrderId)
        );
        if (selectedPedido && selectedPedido.id === result.deletedOrderId) {
          setSelectedPedido(null); // Limpa o pedido selecionado se ele foi excluído
        }
        // Ex: toast.success("Pedido excluído com sucesso!");
      }
    } else {
      console.error("Falha ao atualizar status:", result.error);
      // Ex: toast.error(`Falha ao atualizar: ${result.error}`);
    }
  };

  // Filtra os pedidos com base no termo de busca e no filtro de status
  const filteredPedidos = pedidos.filter((pedido) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      pedido.user.name.toLowerCase().includes(searchTermLower) ||
      pedido.orderNumber.split("-")[3].includes(searchTermLower) ||
      new Intl.DateTimeFormat("pt-br", {
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(new Date(pedido.createdAt))
        .includes(searchTermLower);

    const matchesStatus =
      statusFilter === "todos" || pedido.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Mapeamentos para exibição de status
  const statusDisplay: Record<Status, string> = {
    PENDING: "Pendente",
    IN_PREPARATION: "Em Preparo",
    IN_TRANSIT: "Em Trânsito",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
  };

  const statusVisuals: Record<Status, { ribbon: string; tag: string }> = {
    PENDING: { ribbon: "bg-accent", tag: "bg-accent text-accent-foreground" },
    IN_PREPARATION: { ribbon: "bg-blue-500", tag: "bg-blue-500 text-white" },
    IN_TRANSIT: { ribbon: "bg-orange-500", tag: "bg-orange-500 text-white" },
    DELIVERED: { ribbon: "bg-green-600", tag: "bg-green-600 text-white" },
    CANCELED: { ribbon: "bg-muted", tag: "bg-muted text-muted-foreground" },
  };

  // Define a altura do container principal para ocupar o espaço disponível
  const mainContainerHeight = isMobile
    ? "min-h-[calc(100dvh-var(--shop-header-height,4rem))]"
    : "h-[calc(100dvh-var(--shop-header-height,4rem)-2rem)]";

  return (
    <div
      className={`flex flex-col md:flex-row md:gap-6 ${mainContainerHeight}`}
    >
      <OrderListPanel
        loading={loading}
        pedidos={filteredPedidos}
        selectedPedidoId={selectedPedido?.id || null}
        onSelectPedido={setSelectedPedido}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusDisplay={statusDisplay}
        statusVisuals={statusVisuals}
        className={`${
          isMobile && selectedPedido ? "hidden" : "flex"
        } md:w-2/5 lg:w-1/3 max-h-full`}
      />
      <OrderDetailPanel
        pedido={selectedPedido}
        isMobile={isMobile}
        onCloseMobileDetail={() => setSelectedPedido(null)}
        onStatusUpdate={handleStatusUpdate}
        statusDisplay={statusDisplay}
        statusVisuals={statusVisuals}
        className={`${isMobile && !selectedPedido ? "hidden" : "flex"}`}
      />
    </div>
  );
};

export default GestorClient;
