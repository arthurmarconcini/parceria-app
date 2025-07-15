import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import currencyFormat from "@/helpers/currency-format";
import { translateStatus } from "@/helpers/translate-status";
import { db } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderTimeline } from "@/components/OrderTimeLine";
 

interface ConfirmationPageProps {
  searchParams: {
    orderId?: string;
  };
}

export default async function OrderConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const { orderId } = searchParams;
  const session = await auth();

  if (!orderId) {
    return redirect("/");
  }

  const order = await db.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      address: {
        include: {
          locality: true,
        },
      },
      user: {
        select: {
          name: true,
          phone: true, 
        },
      },
    },
  });

  if (!order) {
    return redirect("/");
  }

  const displayName = order.isGuestOrder ? order.guestName : order.user?.name;
  const displayPhone = order.isGuestOrder ? order.guestPhone : order.user?.phone;

  
  const whatsappMessage = `Olá ${displayName || "!"}, seu pedido #${order.orderNumber} foi confirmado! Você pode acompanhar o status aqui: ${process.env.NEXT_PUBLIC_BASE_URL}/confirmacao?orderId=${order.id}`;
  const whatsappLink = `https://wa.me/55${displayPhone}?text=${encodeURIComponent(whatsappMessage)}`;


  return (
    <div className="container mx-auto flex flex-col items-center justify-center p-4 md:p-10 text-center">
      <CheckCircle2 size={64} className="text-green-600 mb-4" />
      <h1 className="text-3xl font-bold text-foreground">Pedido Confirmado!</h1>
      <p className="text-muted-foreground mt-2 text-lg">
        Obrigado, {displayName || "Cliente"}! Seu pedido foi recebido com
        sucesso.
      </p>

      
      <OrderTimeline initialOrder={order} />

      <Card className="mt-8 w-full max-w-lg text-left">
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pedido #{order.orderNumber}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Status Atual</h3>
            <Badge
              variant={order.status === "DELIVERED" ? "success" : "default"}
            >
              {translateStatus(order.status)}
            </Badge>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Endereço de Entrega
            </h3>
            <div className="text-sm text-muted-foreground">
              {order.address.street}, {order.address.number}
              <br />
              {order.address.locality?.name}, {order.address.city}
              {order.address.reference && <p className="text-xs text-muted-foreground/80 mt-0.5">Ref: {order.address.reference}</p>}
              {order.address.observation && <p className="text-xs text-muted-foreground/80 mt-0.5">Obs: {order.address.observation}</p>}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Pagamento</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {order.paymentMethod.replace("_", " ")}
                {order.paymentMethod === "CASH" &&
                  order.changeFor &&
                  ` (Troco para ${currencyFormat(order.changeFor)})`}
              </span>
              <span className="font-bold text-foreground">
                {currencyFormat(order.total + (order.deliveryFee || 0))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        {order.isGuestOrder && displayPhone && !session?.user && (
           <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-white" size="lg">
             <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
               Receber Atualizações no WhatsApp
             </a>
           </Button>
         )}
        {session?.user && (
          <Button asChild className="flex-1" size="lg">
            <Link href="/pedidos">Acompanhar Meus Pedidos</Link>
          </Button>
        )}
        <Button asChild variant="outline" className="flex-1" size="lg">
          <Link href="/">Voltar ao Cardápio</Link>
        </Button>
      </div>
    </div>
  );
}