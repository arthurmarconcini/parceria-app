import { getReports } from "./actions/reportActions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReportsClient from "./components/ReportClient";

export default async function ReportsPage() {
  const initialReportData = await getReports({});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Vendas</CardTitle>
        <CardDescription>
          Analise as vendas por data, status e forma de pagamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReportsClient initialReportData={initialReportData} />
      </CardContent>
    </Card>
  );
}
