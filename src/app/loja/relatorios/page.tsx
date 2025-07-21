import { getReports } from "./actions/reportActions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReportsClient from "./components/ReportClient";

// A página de relatórios é um Server Component que busca os dados iniciais.
export default async function ReportsPage() {
  // Busca os relatórios do dia atual ao carregar a página.
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
        {/* O componente cliente recebe os dados iniciais e gerencia a interatividade. */}
        <ReportsClient initialReportData={initialReportData} />
      </CardContent>
    </Card>
  );
}
