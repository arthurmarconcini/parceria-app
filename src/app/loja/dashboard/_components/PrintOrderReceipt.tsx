"use client";

import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";

// Assuming these types are generated from your Prisma schema
interface Order {
  id: string;
  orderNumber: string;
  user: { name: string };
  address: { street: string; number: string; locality: { name: string } };
  total: number;
  deliveryFee: number | null;
  status: string;
  createdAt: string;
  paymentMethod: string;
  requiresChange: boolean | null;
  changeFor: number | null;
  isDelivery: boolean;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  product: { name: string };
  quantity: number;
  priceAtTime: number;
  observation: string | null;
  size: { name: string } | null;
  orderExtras: OrderExtra[];
  halfHalf: HalfHalf | null;
}

interface OrderExtra {
  extra: { name: string };
  quantity: number;
  priceAtTime: number;
}

interface HalfHalf {
  firstHalf: { name: string };
  secondHalf: { name: string };
}

const PrintOrderReceipt = ({ orderId }: { orderId: string }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const kitchenRef = useRef<HTMLDivElement>(null);
  const expeditionRef = useRef<HTMLDivElement>(null);

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/orders/${orderId}`,
          {
            method: "GET",
          }
        );
        const data = await response.json();

        console.log("Received data:", data);
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Print handlers
  const handlePrintKitchen = useReactToPrint({
    contentRef: kitchenRef,
    documentTitle: `Kitchen_Order_${order?.orderNumber}`,
  });

  const handlePrintExpedition = useReactToPrint({
    contentRef: expeditionRef,
    documentTitle: `Expedition_Order_${order?.orderNumber}`,
  });

  if (loading) return <div>Carregando...</div>;
  if (!order) return <div>Pedido não encontrado</div>;

  const ReceiptContent = ({ type }: { type: "kitchen" | "expedition" }) => (
    <div className="p-4 text-sm font-mono">
      <h1 className="text-lg font-bold text-center">Parceria Delivery</h1>
      <h2 className="text-center">
        {type === "kitchen" ? "Cozinha" : "Expedição"}
      </h2>
      <div className="border-t border-b py-2 my-2">
        <p>Pedido: #{order.orderNumber}</p>
        <p>
          Data:{" "}
          {new Intl.DateTimeFormat("pt-BR").format(new Date(order.createdAt))}
        </p>
        {/* <p>Data: {Intl.format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p> */}
        <p>Cliente: {order.user.name}</p>
        {order.isDelivery && type === "expedition" && (
          <p>
            Endereço: {order.address.street}, {order.address.number} -{" "}
            {order.address.locality.name}
          </p>
        )}
        <p>Pagamento: {order.paymentMethod}</p>
        {order.requiresChange && order.changeFor && (
          <p>Troco para: R$ {order.changeFor.toFixed(2)}</p>
        )}
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Qtd</th>
            <th className="text-left">Item</th>
            <th className="text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.quantity}</td>
              <td>
                {item.product.name}
                {item.size && ` (${item.size.name})`}
                {item.halfHalf && (
                  <div className="ml-2">
                    - Meio: {item.halfHalf.firstHalf.name}
                    <br />- Meio: {item.halfHalf.secondHalf.name}
                  </div>
                )}
                {item.orderExtras.map((extra) => (
                  <div key={extra.extra.name} className="ml-2">
                    + {extra.quantity}x {extra.extra.name}
                  </div>
                ))}
                {item.observation && (
                  <div className="ml-2 italic">Obs: {item.observation}</div>
                )}
              </td>
              <td className="text-right">
                R$ {(item.priceAtTime * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t pt-2 mt-2">
        <p>Subtotal: R$ {order.total.toFixed(2)}</p>
        {order.deliveryFee && (
          <p>Taxa de entrega: R$ {order.deliveryFee.toFixed(2)}</p>
        )}
        <p className="font-bold">
          Total: R$ {(order.total + (order.deliveryFee || 0)).toFixed(2)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          onClick={handlePrintKitchen}
          className="text-sm flex items-center px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Printer className="mr-2" size={20} />
          Cozinha
        </button>
        <button
          onClick={handlePrintExpedition}
          className="text-sm flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Printer className="mr-2" size={20} />
          Expedição
        </button>
      </div>

      {/* Hidden printable content */}
      <div style={{ display: "none" }}>
        <div ref={kitchenRef}>
          <ReceiptContent type="kitchen" />
        </div>
        <div ref={expeditionRef}>
          <ReceiptContent type="expedition" />
        </div>
      </div>
    </div>
  );
};
export default PrintOrderReceipt;
