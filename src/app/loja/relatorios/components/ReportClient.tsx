"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Order, User } from "@prisma/client";
import { toast } from "sonner";
import { Printer } from "lucide-react";

import ReportFilters from "./ReportFilters";

import ReportTable from "./ReportTable";

import { Button } from "@/components/ui/button";

import { getAllOrdersForPrint, getReports } from "../actions/reportActions";
import ReportsDashboard from "./ReportDashboard";
import ReportsPagination from "./ReportPagination";
import PrintableReport from "./PrintableReport";

export type OrderWithUser = Order & { user: User | null };

type ReportData = {
  orders: OrderWithUser[];
  pagination: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
  dashboard: {
    totalAmount: number;
    totalOrders: number;
  };
};

interface ReportsClientProps {
  initialReportData: ReportData;
}

const ReportsClient = ({ initialReportData }: ReportsClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [reportData, setReportData] = useState<ReportData>(initialReportData);

  const [printData, setPrintData] = useState<OrderWithUser[]>([]);

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const componentToPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentToPrintRef,
    documentTitle: `Relatorio-${format(new Date(), "dd-MM-yyyy-HH-mm")}`,
    onBeforePrint: () => {
      return new Promise<void>((resolve) => {
        startTransition(async () => {
          try {
            const allOrders = await getAllOrdersForPrint({
              date,
              status,
              paymentMethod,
            });
            setPrintData(allOrders);
            resolve();
          } catch {
            toast.error("Erro ao preparar dados para impressão.");
            resolve();
          }
        });
      });
    },
    onAfterPrint: () => setPrintData([]),
  });

  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const statusParam = searchParams.get("status");
    const paymentMethodParam = searchParams.get("paymentMethod");

    setDate({
      from: from ? new Date(from) : new Date(),
      to: to ? new Date(to) : new Date(),
    });
    setStatus(statusParam || "");
    setPaymentMethod(paymentMethodParam || "");
  }, [searchParams]);

  const handleFetchReports = (page = 1) => {
    startTransition(async () => {
      try {
        const data = await getReports({
          date,
          status,
          paymentMethod,
          page,
          pageSize: 10,
        });
        setReportData(data);
      } catch {
        toast.error("Erro ao buscar relatórios.");
      }
    });
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (date?.from) params.set("from", date.from.toISOString());
    if (date?.to) params.set("to", date.to.toISOString());
    if (status) params.set("status", status);
    if (paymentMethod) params.set("paymentMethod", paymentMethod);
    router.push(`?${params.toString()}`);
    handleFetchReports(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold">Filtros</h2>
        <Button onClick={handlePrint} disabled={isPending}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Relatório
        </Button>
      </div>

      <ReportFilters
        date={date}
        setDate={setDate}
        status={status}
        setStatus={setStatus}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onApplyFilters={handleApplyFilters}
        isPending={isPending}
      />

      <ReportsDashboard data={reportData.dashboard} />

      <ReportTable orders={reportData.orders} isLoading={isPending} />

      <ReportsPagination
        pagination={reportData.pagination}
        onPageChange={handleFetchReports}
      />

      <div className="hidden">
        <PrintableReport
          ref={componentToPrintRef}
          orders={printData}
          filters={{ date, status, paymentMethod }}
        />
      </div>
    </div>
  );
};

export default ReportsClient;
