"use client";

import { Prisma, Status } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

import currencyFormat from "@/helpers/currency-format";
import OrderDetailSection from "./OrderDetailSection";
import { UpdateResult } from "../actions/statusButtons";
import OrderStatusCardButtons from "./OrderStatusCardButtons";
import PrintOrderReceipt from "./PrintOrderReceipt";

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

interface OrderDetailPanelProps {
  pedido: DetailedOrder | null;
  isMobile: boolean;
  onCloseMobileDetail: () => void;
  onStatusUpdate: (result: UpdateResult) => void;
  statusDisplay: Record<Status, string>;
  statusVisuals: Record<Status, { ribbon: string; tag: string }>;
  className?: string;
}

const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({
  pedido,
  isMobile,
  onCloseMobileDetail,
  onStatusUpdate,
  statusDisplay,
  statusVisuals,
  className,
}) => {
  if (!pedido) {
    return (
      !isMobile && (
        <div className="flex-1 flex items-center justify-center bg-card text-muted-foreground p-6 rounded-lg shadow-lg max-h-full">
          <p className="text-xl text-center">
            Selecione um pedido da lista
            <br />
            para ver os detalhes.
          </p>
        </div>
      )
    );
  }

  const displayName = pedido.isGuestOrder
    ? pedido.guestName
    : pedido.user?.name;
  const displayPhone = pedido.isGuestOrder
    ? pedido.guestPhone
    : pedido.user?.phone;

  return (
    <div
      className={`flex-1 bg-card text-card-foreground md:rounded-lg shadow-lg ${
        isMobile
          ? "flex flex-col w-full fixed inset-0 z-50 bg-card"
          : "hidden md:flex md:flex-col p-4 md:p-6 rounded-lg max-h-full overflow-y-auto"
      } ${className}`}
    >
      {/* Container para conteúdo de detalhes com rolagem interna no mobile */}
      <div className={`${isMobile ? "flex-1 overflow-y-auto" : ""}`}>
        {isMobile && (
          <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-2 border-b border-border z-10 flex items-center h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseMobileDetail}
              className="text-primary hover:bg-primary/10 active:bg-primary/20 h-10 w-10"
            >
              <ChevronLeftIcon className="w-6 h-6" />
              <span className="sr-only">Voltar</span>
            </Button>
            <h2 className="ml-2 text-lg font-semibold text-foreground truncate">
              Pedido #{pedido.orderNumber.split("-")[3]}
            </h2>
          </div>
        )}

        {/* Conteúdo principal dos detalhes (com padding se mobile) */}
        <div className={`${isMobile ? "p-4" : ""}`}>
          {!isMobile && (
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Pedido #{pedido.orderNumber.split("-")[3]}
              </h1>
              <span
                className={`text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${
                  statusVisuals[pedido.status]?.tag ||
                  "bg-gray-200 text-gray-800"
                }`}
              >
                {statusDisplay[pedido.status]}
              </span>
            </div>
          )}
          {isMobile && (
            <div className="flex justify-end my-3">
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${
                  statusVisuals[pedido.status]?.tag ||
                  "bg-gray-200 text-gray-800"
                }`}
              >
                {statusDisplay[pedido.status]}
              </span>
            </div>
          )}

          <div className="mb-5">
            <PrintOrderReceipt order={pedido} />
          </div>

          {pedido.status !== "DELIVERED" && (
            <div className="mb-5">
              <h3 className="text-md md:text-lg font-semibold mb-2 text-foreground">
                Ações do Pedido:
              </h3>
              <OrderStatusCardButtons
                orderId={pedido.id}
                status={pedido.status}
                onStatusUpdate={onStatusUpdate}
              />
            </div>
          )}
          {pedido.status === "DELIVERED" && (
            <div className="mb-5 p-3 bg-green-600/10 text-green-700 rounded-md border border-green-600/30">
              <p className="text-xs md:text-sm">Este pedido já foi entregue.</p>
            </div>
          )}

          <div className="space-y-5">
            <OrderDetailSection title="Cliente e Entrega">
              <p>
                <strong className="text-foreground">Nome:</strong>{" "}
                {displayName || "Cliente não identificado"}
              </p>
              <p>
                <strong className="text-foreground">Telefone:</strong>
                {displayPhone || "(Não disponível)"}
              </p>
              {pedido.isDelivery && pedido.address ? (
                <>
                  <h3 className="text-md md:text-lg font-semibold mt-3 mb-1 text-foreground">
                    Endereço de Entrega
                  </h3>
                  <p>
                    {pedido.address.street}, {pedido.address.number}
                  </p>
                  {pedido.address.reference && (
                    <p>
                      <strong>Complemento:</strong> {pedido.address.reference}
                    </p>
                  )}
                  <p>
                    <strong>Bairro:</strong>{" "}
                    {pedido.address.locality?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Cidade:</strong> {pedido.address.city} -{" "}
                    {pedido.address.state}
                  </p>
                  {pedido.address.zipCode && (
                    <p>
                      <strong>CEP:</strong> {pedido.address.zipCode}
                    </p>
                  )}
                  {pedido.address.observation && (
                    <p>
                      <strong>Obs. Endereço:</strong>{" "}
                      {pedido.address.observation}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-2">
                  <strong className="text-foreground">Modalidade:</strong>{" "}
                  Retirada no local
                </p>
              )}
            </OrderDetailSection>

            <OrderDetailSection title="Itens">
              {pedido.items.length > 0 ? (
                <ul className="space-y-3">
                  {pedido.items.map((item) => (
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
                              &nbsp;&nbsp;├ 1/2: {item.HalfHalf.firstHalf.name}
                            </p>
                            <p>
                              &nbsp;&nbsp;└ 1/2: {item.HalfHalf.secondHalf.name}
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
                                {extraItem.quantity}x {extraItem.extra.name} (+
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
            </OrderDetailSection>

            <OrderDetailSection title="Pagamento e Totais">
              <p>
                <strong className="text-foreground">Forma de Pagamento:</strong>{" "}
                {pedido.paymentMethod.replace("_", " ")}
              </p>
              {pedido.paymentMethod === "CASH" &&
                pedido.requiresChange &&
                pedido.changeFor != null && (
                  <p>
                    <strong className="text-foreground">Troco para:</strong>{" "}
                    {currencyFormat(pedido.changeFor)}
                  </p>
                )}
              {pedido.isDelivery &&
                pedido.deliveryFee != null &&
                pedido.deliveryFee > 0 && (
                  <p>
                    <strong className="text-foreground">
                      Taxa de Entrega:
                    </strong>{" "}
                    {currencyFormat(pedido.deliveryFee)}
                  </p>
                )}
              <p className="text-lg md:text-xl font-bold mt-3 text-primary">
                Total do Pedido:{" "}
                {currencyFormat(
                  pedido.total +
                    (pedido.isDelivery ? pedido.deliveryFee || 0 : 0)
                )}
              </p>
            </OrderDetailSection>

            <OrderDetailSection title="Horário do Pedido">
              <p>
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "medium",
                  timeStyle: "medium",
                }).format(new Date(pedido.createdAt))}
              </p>
            </OrderDetailSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPanel;
