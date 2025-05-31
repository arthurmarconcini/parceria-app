"use client";

import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";

const GestorClient = () => {
  const [loading, setLoading] = useState(false);
  const [pedidos, setPedidos] = useState<
    Prisma.OrderGetPayload<{
      distinctive;
      include: {
        items: true;
        user: true;
        address: true;
      };
    }>[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedPedido, setSelectedPedido] = useState<Prisma.OrderGetPayload<{
    include: {
      items: true;
      user: true;
      address: true;
    };
  }> | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  // Função para filtrar pedidos por nome ou hora
  const filteredPedidos = pedidos.filter((pedido) => {
    const matchesSearch =
      pedido.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Intl.DateTimeFormat("pt-br", {
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(new Date(pedido.createdAt))
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" || pedido.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Mapeamento dos status do enum para exibição em português nos filtros
  const statusDisplay = {
    PENDING: "Pendente",
    IN_PREPARATION: "Em Preparo",
    IN_TRANSIT: "Em Trânsito",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
  };

  // Mapeamento dos status para cores das fitas
  const statusColors = {
    PENDING: "bg-yellow-500",
    IN_PREPARATION: "bg-orange-500",
    IN_TRANSIT: "bg-red-500",
    DELIVERED: "bg-green-500",
    CANCELED: "bg-gray-500",
  };

  return (
    <div className="h-[700px] container mx-auto bg-foreground rounded-sm flex flex-row">
      <div className="flex flex-col h-full w-[480px] bg-amber-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Pesquisar</h1>
          <input
            type="text"
            placeholder="Buscar por nome ou hora"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mt-2 p-2 rounded-md bg-white text-black"
          />
        </div>
        <div className="px-4 pb-2">
          <div className="flex gap-2 flex-wrap">
            {[
              "todos",
              "PENDING",
              "IN_PREPARATION",
              "IN_TRANSIT",
              "DELIVERED",
              "CANCELED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md ${
                  statusFilter === status
                    ? "bg-white text-amber-800"
                    : "bg-amber-600 text-white"
                }`}
              >
                {status === "todos" ? "Todos" : statusDisplay[status]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {loading ? (
            <div className="p-4 text-center">Carregando...</div>
          ) : filteredPedidos.length === 0 ? (
            <div className="p-4 text-center">Nenhum pedido encontrado</div>
          ) : (
            filteredPedidos.map((pedido) => (
              <div
                className={`bg-background p-4 mx-2 my-2 flex items-center gap-6 rounded-md relative cursor-pointer ${
                  selectedPedido?.id === pedido.id ? "ring-2 ring-white" : ""
                }`}
                key={pedido.id}
                onClick={() => setSelectedPedido(pedido)}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-2 ${
                    statusColors[pedido.status]
                  }`}
                />
                <div className="text-foreground ml-4">
                  <h1 className="text-lg font-bold">
                    #{pedido.orderNumber.split("-")[3]}
                  </h1>
                  <h2>
                    {new Intl.DateTimeFormat("pt-br", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(pedido.createdAt))}
                  </h2>
                </div>
                <div>
                  <p className="text-foreground">{pedido.user.name}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 bg-blue-500 p-4 overflow-y-auto">
        {selectedPedido ? (
          <div className="text-white">
            <h1 className="text-2xl font-bold mb-4">
              Pedido #{selectedPedido.orderNumber.split("-")[3]}
            </h1>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Informações do Cliente
                </h2>
                <p>
                  <strong>Nome:</strong> {selectedPedido.user.name}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Endereço de Entrega</h2>
                <p>
                  <strong>Rua:</strong> {selectedPedido.address.street},{" "}
                  {selectedPedido.address.number}
                </p>

                <p>
                  <strong>Cidade:</strong> {selectedPedido.address.city}
                </p>
                <p>
                  <strong>Localidade:</strong>{" "}
                  {selectedPedido.address.localityId}
                </p>
                <p>
                  <strong>CEP:</strong> {selectedPedido.address.zipCode}
                </p>
                {selectedPedido.address.reference && (
                  <p>
                    <strong>Complemento:</strong>{" "}
                    {selectedPedido.address.reference}
                  </p>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold">Itens do Pedido</h2>
                {selectedPedido.items.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {selectedPedido.items.map((item, index) => (
                      <li key={index}>
                        {item.quantity}x {item.id} - R${" "}
                        {(item.priceAtTime * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhum item no pedido</p>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold">Status</h2>
                <p>{statusDisplay[selectedPedido.status]}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Horário do Pedido</h2>
                <p>
                  {new Intl.DateTimeFormat("pt-br", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(selectedPedido.createdAt))}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-white text-center p-4">
            <p>Selecione um pedido para ver os detalhes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestorClient;
