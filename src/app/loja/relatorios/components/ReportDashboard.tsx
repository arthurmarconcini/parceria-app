import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import currencyFormat from "@/helpers/currency-format";

import { DollarSign, ShoppingCart } from "lucide-react";

interface ReportsDashboardProps {
  data: {
    totalAmount: number;
    totalOrders: number;
  };
}

const ReportsDashboard = ({ data }: ReportsDashboardProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Resumo do Período</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormat(data.totalAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vendas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsDashboard;
