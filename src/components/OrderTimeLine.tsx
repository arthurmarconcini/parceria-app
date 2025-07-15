"use client";

import { useEffect, useState } from "react";
import { Order, Status } from "@prisma/client";
import Pusher from "pusher-js";
import { Check, Package, CookingPot, Bike, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { translateStatus } from "@/helpers/translate-status";

interface OrderTimelineProps {
  initialOrder: Order;
}

const statusOrder: Status[] = [
  "PENDING",
  "IN_PREPARATION",
  "IN_TRANSIT",
  "DELIVERED",
];

const statusIcons: Record<Status, React.ElementType> = {
  PENDING: Package,         
  IN_PREPARATION: CookingPot,  
  IN_TRANSIT: Bike,         
  DELIVERED: Check, 
  CANCELED: XCircle,        
};

export const OrderTimeline = ({ initialOrder }: OrderTimelineProps) => {
  const [currentOrder, setCurrentOrder] = useState(initialOrder);

  useEffect(() => {
    if (typeof window !== "undefined") {
     
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });

      const channel = pusher.subscribe("pedidos");

      channel.bind("status-atualizado", (updatedOrder: Order) => {
        
        if (updatedOrder.id === currentOrder.id) {
          setCurrentOrder(updatedOrder);
        }
      });

      
      channel.bind("novo-pedido", (newOrder: Order) => {
        if (newOrder.id === currentOrder.id) {
          setCurrentOrder(newOrder);
        }
      });

      
      return () => {
        channel.unbind_all(); 
        pusher.unsubscribe("pedidos"); 
        pusher.disconnect();
      };
    }
  }, [currentOrder.id]); 

  
  const getStatusIndex = (status: Status) => statusOrder.indexOf(status);
  const currentStatusIndex = getStatusIndex(currentOrder.status);

  return (
    <div className="bg-card p-6 rounded-lg shadow-md mt-6 w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4 text-foreground">Acompanhamento do Pedido</h2>
      {currentOrder.status === "CANCELED" ? (
        
        <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-300 rounded-md text-red-700">
          <XCircle size={24} />
          <p className="font-semibold">
            Seu pedido foi <span className="uppercase">CANCELADO</span>.
          </p>
        </div>
      ) : (
        
        <div className="space-y-4">
          {statusOrder.map((status, index) => {
            const Icon = statusIcons[status]; 
            const isCompleted = index <= currentStatusIndex; 
            const isActive = index === currentStatusIndex; 

            return (
              <div key={status} className="flex items-center gap-4">
                <div
                  className={cn(
                    "relative flex items-center justify-center size-8 rounded-full transition-colors duration-500",
                    isCompleted
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground",  
                    isActive && "animate-pulse" 
                  )}
                >
                  <Icon size={20} />
                  
                  {index < statusOrder.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-10 -mt-0.5",
                        isCompleted && index < currentStatusIndex
                          ? "bg-primary" 
                          : "bg-muted-foreground/30" 
                      )}
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "font-semibold",
                      isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {translateStatus(status)} 
                  </span>
                  {isActive && (
                    <span className="text-sm text-primary">
                      {status === "PENDING" && "Aguardando confirmação..."}
                      {status === "IN_PREPARATION" && "Seu pedido está sendo preparado!"}
                      {status === "IN_TRANSIT" && "Seu pedido saiu para entrega!"}
                      {status === "DELIVERED" && "Seu pedido foi entregue!"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};