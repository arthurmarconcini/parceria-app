import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OrderStatusCard from "./_components/OrderStatusCard";
import { Status } from "@prisma/client";

const status: Status[] = [
  "PENDING",
  "IN_PREPARATION",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELED",
];

const Dashboard = async () => {
  const session = await auth();

  const orders = await db.order.findMany({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    },
    include: {
      items: true,
      user: {
        include: {
          addresses: true,
        },
      },
    },
  });

  if (!session || !session.user || session.user.role === "CLIENT") {
    return redirect("/");
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-2xl font-bold mt-16">Gerenciador de pedidos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          {status.map((status) => {
            const filteredOrders = orders.filter(
              (order) => order.status === status
            );

            return (
              <OrderStatusCard
                key={status}
                status={status}
                orders={filteredOrders}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
