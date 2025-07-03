import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { HorariosClient } from "./components/HorariosClient";
import { db } from "@/lib/prisma";

export default async function HorariosPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/loja");
  }

  const operatingHours = await db.operatingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  const settings = await db.storeSettings.findFirst();

  return (
    <div className="container mx-auto py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Horário de Funcionamento</h1>
          <p className="text-muted-foreground text-sm">
            Configure os dias e horários que sua loja aceitará pedidos.
          </p>
        </div>
      </div>

      <HorariosClient
        initialHours={operatingHours}
        initialSettings={settings}
      />
    </div>
  );
}
