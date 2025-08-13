"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import type { DetailedOrder } from "./GestorClient";
import currencyFormat from "@/helpers/currency-format";

interface PrintOrderReceiptProps {
  order: DetailedOrder | null;
}

const PrintOrderReceipt = ({ order }: PrintOrderReceiptProps) => {
  const kitchenRef = useRef<HTMLDivElement>(null);
  const expeditionRef = useRef<HTMLDivElement>(null);

  const handlePrintKitchen = useReactToPrint({
    contentRef: kitchenRef,
    documentTitle: `Cozinha_Pedido_${order?.orderNumber || "N/A"}`,
  });

  const handlePrintExpedition = useReactToPrint({
    contentRef: expeditionRef,
    documentTitle: `Expedicao_Pedido_${order?.orderNumber || "N/A"}`,
  });

  if (!order) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Selecione um pedido para ver as opções de impressão.
      </div>
    );
  }

  const ReceiptContent = ({ type }: { type: "kitchen" | "expedition" }) => {
    const customerName =
      (order.isGuestOrder ? order.guestName : order.user?.name) || "N/A";

    return (
      <div className="p-3 text-xs font-mono text-black bg-white">
        {" "}
        {/* Estilos base para impressão */}
        <div className="text-center mb-2">
          <h1 className="text-lg font-bold uppercase">Parceria Delivery</h1>
          <h2 className="text-md font-semibold border-y border-dashed border-black py-1 my-1">
            VIA {type === "kitchen" ? "COZINHA" : "EXPEDIÇÃO"}
          </h2>
        </div>
        <div className="text-xs">
          <p>
            <strong>Pedido:</strong> #{order.orderNumber.split("-")[3]}{" "}
            <span className="text-gray-600">({order.id.substring(0, 8)})</span>
          </p>
          <p>
            <strong>Data/Hora:</strong>{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "medium",
            }).format(new Date(order.createdAt))}
          </p>
          <p>
            <strong>Cliente:</strong> {customerName.toUpperCase()}
          </p>

          {order.isDelivery && type === "expedition" && order.address && (
            <>
              <hr className="my-1 border-dashed border-black" />
              <p className="font-semibold">ENTREGA:</p>
              <p>
                {order.address.street}, {order.address.number}
              </p>
              {order.address.reference && <p>Ref: {order.address.reference}</p>}
              <p>Bairro: {order.address.locality?.name || "Não informado"}</p>
            </>
          )}
          {!order.isDelivery && type === "expedition" && (
            <p className="font-semibold mt-1">MODALIDADE: RETIRADA NO LOCAL</p>
          )}
        </div>
        {type === "expedition" && (
          <>
            <hr className="my-1 border-dashed border-black" />
            <div className="text-xs">
              <p>
                <strong>Pagamento:</strong>{" "}
                {order.paymentMethod.replace("_", " ")}
              </p>
              {order.paymentMethod === "CASH" &&
                order.requiresChange &&
                order.changeFor != null && (
                  <p>
                    <strong>Troco para:</strong>{" "}
                    {currencyFormat(order.changeFor)}
                  </p>
                )}
            </div>
          </>
        )}
        <hr className="my-2 border-t-2 border-dashed border-black" />
        <table className="w-full text-xs my-1">
          <thead>
            <tr className="border-b border-dashed border-black">
              <th className="text-left font-bold pb-1">QTD</th>
              <th className="text-left font-bold pb-1">ITEM</th>
              {type === "expedition" && (
                <th className="text-right font-bold pb-1">VALOR</th>
              )}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-dashed border-gray-400 last:border-b-0"
              >
                <td className="py-1 pr-1 align-top">{item.quantity}x</td>
                <td className="py-1">
                  {item.HalfHalf ? (
                    <div>
                      <span className="font-semibold uppercase">
                        Pizza tamanho: {item.Size?.name}
                      </span>
                      <div className="pl-2 text-[10px] text-gray-700">
                        <div>&raquo; 1/2: {item.HalfHalf.firstHalf.name}</div>
                        <div>&raquo; 1/2: {item.HalfHalf.secondHalf.name}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="font-semibold">
                      {item.product.name}
                      {item.Size && ` (${item.Size.name})`}
                    </span>
                  )}
                  {item.orderExtras && item.orderExtras.length > 0 && (
                    <div className="pl-2 text-[10px] text-gray-700">
                      <span className="font-medium">Adicionais:</span>
                      {item.orderExtras.map((extra) => (
                        <div key={extra.extra.id}>
                          &nbsp;&nbsp;+ {extra.quantity}x {extra.extra.name}
                          {type === "expedition" &&
                            ` (${currencyFormat(
                              extra.priceAtTime * extra.quantity
                            )})`}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.observation && (
                    <div className="pl-1 italic text-gray-600 text-[10px]">
                      Obs: {item.observation}
                    </div>
                  )}
                </td>
                {type === "expedition" && (
                  <td className="text-right py-1 align-top">
                    {currencyFormat(
                      item.priceAtTime * item.quantity +
                        item.orderExtras.reduce(
                          (acc, cur) => acc + cur.priceAtTime * cur.quantity,
                          0
                        )
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {type === "expedition" && (
          <>
            <hr className="my-2 border-t-2 border-dashed border-black" />
            <div className="text-xs mt-1 space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal Itens:</span>
                <span>
                  {currencyFormat(
                    order.items.reduce(
                      (sum, item) =>
                        sum +
                        item.priceAtTime * item.quantity +
                        item.orderExtras.reduce(
                          (acc, cur) => acc + cur.priceAtTime * cur.quantity,
                          0
                        ),
                      0
                    )
                  )}
                </span>
              </div>
              {order.isDelivery && order.deliveryFee != null && (
                <div className="flex justify-between">
                  <span>Taxa de Entrega:</span>
                  <span>{currencyFormat(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm mt-1">
                <span>TOTAL A PAGAR:</span>
                <span>
                  {currencyFormat(
                    order.total +
                      (order.isDelivery ? order.deliveryFee || 0 : 0)
                  )}
                </span>
              </div>
            </div>
          </>
        )}
        <hr className="my-2 border-dashed border-black" />
        <p className="text-center text-xs mt-1">Obrigado pela preferência!</p>
        <p className="text-center text-[10px] text-gray-500">
          Parceria Delivery - {new Date().getFullYear()}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <button
          onClick={handlePrintKitchen}
          className="text-xs flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={!order}
        >
          <Printer className="mr-1.5" size={16} />
          Cozinha
        </button>
        <button
          onClick={handlePrintExpedition}
          className="text-xs flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          disabled={!order}
        >
          <Printer className="mr-1.5" size={16} />
          Expedição
        </button>
      </div>

      <div style={{ display: "none" }}>
        {order && (
          <>
            <div ref={kitchenRef}>
              <ReceiptContent type="kitchen" />
            </div>
            <div ref={expeditionRef}>
              <ReceiptContent type="expedition" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PrintOrderReceipt;
