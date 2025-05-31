"use client";

import { Prisma, Status } from "@prisma/client"; // Importe PrismaOrder
import { useEffect, useState } from "react";
import PrintOrderReceipt from "../../dashboard/_components/PrintOrderReceipt";

import currencyFormat from "@/helpers/currency-format";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { UpdateResult } from "../actions/statusButtons";
import OrderStatusCardButtons from "./OrderStatusCardButtons";
// Importe UpdateResult

// Defina um tipo mais completo para os pedidos no estado, incluindo relações
type DetailedOrder = Prisma.OrderGetPayload<{
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

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/orders");
        const data: DetailedOrder[] = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const handleStatusUpdate = (result: UpdateResult) => {
    if (result.success) {
      if (result.updatedOrder) {
        const updatedOrder = result.updatedOrder;
        // Atualiza a lista de pedidos
        setPedidos((prevPedidos) =>
          prevPedidos.map((p) =>
            p.id === updatedOrder.id
              ? {
                  ...p,
                  status: updatedOrder.status,
                  updatedAt: updatedOrder.updatedAt,
                }
              : p
          )
        );
        // Atualiza o pedido selecionado, se for o caso, mantendo as relações já carregadas
        if (selectedPedido && selectedPedido.id === updatedOrder.id) {
          setSelectedPedido((prevSelected) => {
            if (!prevSelected) return null;
            return {
              ...prevSelected, // Mantém items, user, address etc.
              status: updatedOrder.status, // Atualiza o status
              updatedAt: updatedOrder.updatedAt, // E outros campos diretos do Order que podem ter mudado
            };
          });
        }
        // Adicionar um toast de sucesso aqui, se desejar
        // Ex: toast.success("Status do pedido atualizado!");
      } else if (result.deletedOrderId) {
        setPedidos((prevPedidos) =>
          prevPedidos.filter((p) => p.id !== result.deletedOrderId)
        );
        if (selectedPedido && selectedPedido.id === result.deletedOrderId) {
          setSelectedPedido(null);
        }
        // Adicionar um toast de sucesso aqui
        // Ex: toast.success("Pedido excluído com sucesso!");
      }
    } else {
      console.error("Falha ao atualizar status:", result.error);
      // Adicionar um toast de erro aqui
      // Ex: toast.error(`Falha ao atualizar: ${result.error}`);
    }
  };

  const filteredPedidos = pedidos.filter((pedido) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      pedido.user.name.toLowerCase().includes(searchTermLower) ||
      pedido.orderNumber.split("-")[3].includes(searchTermLower) || // Buscar pelo número curto do pedido
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

  const mainContainerHeight = isMobile
    ? "min-h-[calc(100dvh-4rem)]"
    : "h-[calc(100dvh-6rem)]";

  return (
    <div
      className={`container mx-auto flex flex-col md:flex-row pt-4 md:gap-6 ${mainContainerHeight} pb-4`}
    >
      {/* Coluna da Esquerda: Lista de Pedidos e Filtros */}
      <div
        className={`
          flex flex-col w-full md:w-2/5 lg:w-1/3 bg-card text-card-foreground p-3 md:p-4 rounded-lg shadow-lg
          ${isMobile && selectedPedido ? "hidden" : "flex"}
          ${isMobile ? "max-h-full" : "max-h-full"}
        `}
      >
        <div className="p-1">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Pedidos do Dia
          </h1>
          <input
            type="text"
            placeholder="Buscar por nome, nº ou hora"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mt-3 mb-3 p-2 rounded-md bg-background text-foreground border border-border focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="px-1 pb-3">
          <div className="flex gap-2 flex-wrap">
            {(
              [
                "todos",
                "PENDING",
                "IN_PREPARATION",
                "IN_TRANSIT",
                "DELIVERED",
                "CANCELED",
              ] as const
            ).map((statusKey) => (
              <Button
                key={statusKey}
                variant={statusFilter === statusKey ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(statusKey)}
                className={`text-xs md:text-sm ${
                  statusFilter === statusKey ? "font-semibold" : ""
                }`}
              >
                {statusKey === "todos"
                  ? "Todos"
                  : statusDisplay[statusKey as Status]}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando pedidos...
            </div>
          ) : filteredPedidos.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Nenhum pedido encontrado para hoje.
            </div>
          ) : (
            filteredPedidos.map((pedido) => (
              <div
                className={`bg-background border border-border p-3 rounded-lg relative cursor-pointer hover:border-primary transition-all duration-150 ease-in-out ${
                  selectedPedido?.id === pedido.id
                    ? "ring-2 ring-primary border-primary shadow-xl"
                    : "shadow-sm hover:shadow-md"
                }`}
                key={pedido.id}
                onClick={() => setSelectedPedido(pedido)}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-md ${
                    statusVisuals[pedido.status]?.ribbon || "bg-gray-300"
                  }`}
                />
                <div className="ml-3">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm md:text-base font-semibold text-foreground truncate pr-2">
                      #{pedido.orderNumber.split("-")[3]} - {pedido.user.name}
                    </h2>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        statusVisuals[pedido.status]?.tag ||
                        "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {statusDisplay[pedido.status]}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(pedido.createdAt))}
                    {" - "}{" "}
                    {currencyFormat(
                      pedido.total +
                        (pedido.isDelivery ? pedido.deliveryFee || 0 : 0)
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Coluna da Direita: Detalhes do Pedido Selecionado */}
      {(selectedPedido && !isMobile) || (selectedPedido && isMobile) ? (
        <div
          className={`
          flex-1 bg-card text-card-foreground p-4 md:p-6 overflow-y-auto rounded-lg shadow-lg
          ${
            isMobile && selectedPedido
              ? "flex flex-col w-full absolute inset-0 z-10 bg-card pt-4"
              : "hidden md:flex md:flex-col"
          }
          ${isMobile ? "max-h-full" : "max-h-full"}
        `}
        >
          {isMobile && selectedPedido && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setSelectedPedido(null)}
              className="mb-3 self-start text-primary hover:bg-primary/10 active:bg-primary/20 px-2"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
              Voltar
            </Button>
          )}
          {selectedPedido && (
            <>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Pedido #{selectedPedido.orderNumber.split("-")[3]}
                </h1>
                <span
                  className={`text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${
                    statusVisuals[selectedPedido.status]?.tag ||
                    "bg-gray-200 text-gray-800"
                  }`}
                >
                  {statusDisplay[selectedPedido.status]}
                </span>
              </div>

              <div className="mb-5">
                <PrintOrderReceipt orderId={selectedPedido.id} />
              </div>

              {/* Botões de Ação de Status */}
              {selectedPedido.status !== "DELIVERED" && ( // Mostra botões se não estiver Entregue
                <div className="mb-5">
                  <h3 className="text-md md:text-lg font-semibold mb-2 text-foreground">
                    Ações do Pedido:
                  </h3>
                  <OrderStatusCardButtons
                    orderId={selectedPedido.id}
                    status={selectedPedido.status}
                    onStatusUpdate={handleStatusUpdate}
                  />
                </div>
              )}
              {selectedPedido.status === "DELIVERED" && (
                <div className="mb-5 p-3 bg-green-600/10 text-green-700 rounded-md border border-green-600/30">
                  <p className="text-xs md:text-sm">
                    Este pedido já foi entregue.
                  </p>
                </div>
              )}

              <div className="space-y-5 text-sm md:text-base text-muted-foreground">
                <section>
                  <h2 className="text-lg md:text-xl font-semibold mb-2 border-b border-border pb-1 text-foreground">
                    Cliente e Entrega
                  </h2>
                  <p>
                    <strong className="text-foreground">Nome:</strong>{" "}
                    {selectedPedido.user.name}
                  </p>
                  <p>
                    <strong className="text-foreground">Telefone:</strong> (Não
                    disponível)
                  </p>
                  {selectedPedido.isDelivery && selectedPedido.address ? (
                    <>
                      <h3 className="text-md md:text-lg font-semibold mt-3 mb-1 text-foreground">
                        Endereço de Entrega
                      </h3>
                      <p>
                        {selectedPedido.address.street},{" "}
                        {selectedPedido.address.number}
                      </p>
                      {selectedPedido.address.reference && (
                        <p>
                          <strong>Complemento:</strong>{" "}
                          {selectedPedido.address.reference}
                        </p>
                      )}
                      <p>
                        <strong>Bairro:</strong>{" "}
                        {selectedPedido.address.locality?.name || "N/A"}
                      </p>
                      <p>
                        <strong>Cidade:</strong> {selectedPedido.address.city} -{" "}
                        {selectedPedido.address.state}
                      </p>
                      {selectedPedido.address.zipCode && (
                        <p>
                          <strong>CEP:</strong> {selectedPedido.address.zipCode}
                        </p>
                      )}
                      {selectedPedido.address.observation && (
                        <p>
                          <strong>Obs. Endereço:</strong>{" "}
                          {selectedPedido.address.observation}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2">
                      <strong className="text-foreground">Modalidade:</strong>{" "}
                      Retirada no local
                    </p>
                  )}
                </section>

                <section>
                  <h2 className="text-lg md:text-xl font-semibold mb-2 border-b border-border pb-1 text-foreground">
                    Itens
                  </h2>
                  {selectedPedido.items.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedPedido.items.map((item) => (
                        <li
                          key={item.id}
                          className="border-b border-border/30 pb-2 last:border-b-0"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-foreground flex-1 pr-2">
                              {item.quantity}x {item.product.name}{" "}
                              {item.Size ? `(${item.Size.name})` : ""}
                            </span>
                            <span className="font-medium text-foreground whitespace-nowrap">
                              {currencyFormat(item.priceAtTime * item.quantity)}
                            </span>
                          </div>
                          {item.HalfHalf &&
                            item.HalfHalf.firstHalf &&
                            item.HalfHalf.secondHalf && (
                              <div className="ml-4 text-xs text-muted-foreground/80 mt-0.5">
                                <p>
                                  &nbsp;&nbsp;├ 1/2:{" "}
                                  {item.HalfHalf.firstHalf.name}
                                </p>
                                <p>
                                  &nbsp;&nbsp;└ 1/2:{" "}
                                  {item.HalfHalf.secondHalf.name}
                                </p>
                              </div>
                            )}
                          {item.orderExtras && item.orderExtras.length > 0 && (
                            <div className="ml-4 text-xs text-muted-foreground/80 mt-0.5">
                              <strong className="text-foreground/70">
                                Adicionais:
                              </strong>
                              <ul className="list-disc list-inside ml-2">
                                {item.orderExtras.map((extraItem) => (
                                  <li key={extraItem.extra.id}>
                                    {extraItem.quantity}x {extraItem.extra.name}{" "}
                                    (+
                                    {currencyFormat(
                                      extraItem.priceAtTime * extraItem.quantity
                                    )}
                                    )
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.observation && (
                            <p className="ml-4 text-xs italic text-muted-foreground/80 mt-0.5">
                              <strong>Obs.:</strong> {item.observation}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nenhum item no pedido.</p>
                  )}
                </section>

                <section>
                  <h2 className="text-lg md:text-xl font-semibold mb-2 border-b border-border pb-1 text-foreground">
                    Pagamento e Totais
                  </h2>
                  <p>
                    <strong>Forma de Pagamento:</strong>{" "}
                    {selectedPedido.paymentMethod.replace("_", " ")}
                  </p>
                  {selectedPedido.paymentMethod === "CASH" &&
                    selectedPedido.requiresChange &&
                    selectedPedido.changeFor != null && (
                      <p>
                        <strong>Troco para:</strong>{" "}
                        {currencyFormat(selectedPedido.changeFor)}
                      </p>
                    )}
                  {selectedPedido.isDelivery &&
                    selectedPedido.deliveryFee != null &&
                    selectedPedido.deliveryFee > 0 && (
                      <p>
                        <strong>Taxa de Entrega:</strong>{" "}
                        {currencyFormat(selectedPedido.deliveryFee)}
                      </p>
                    )}
                  <p className="text-lg md:text-xl font-bold mt-3 text-primary">
                    Total do Pedido:{" "}
                    {currencyFormat(
                      selectedPedido.total +
                        (selectedPedido.isDelivery
                          ? selectedPedido.deliveryFee || 0
                          : 0)
                    )}
                  </p>
                </section>

                <section>
                  <h2 className="text-lg md:text-xl font-semibold mb-2 border-b border-border pb-1 text-foreground">
                    Horário do Pedido
                  </h2>
                  <p>
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "medium",
                      timeStyle: "medium",
                    }).format(new Date(selectedPedido.createdAt))}
                  </p>
                </section>
              </div>
            </>
          )}
        </div>
      ) : (
        !isMobile && (
          <div className="flex-1 flex items-center justify-center bg-card text-muted-foreground p-6 rounded-lg shadow-lg max-h-full">
            <p className="text-xl text-center">
              Selecione um pedido da lista
              <br />
              para ver os detalhes.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default GestorClient;
