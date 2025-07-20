"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Suponha que você tenha dados fetched (ex.: de um hook)
const mockData = [
  // Substitua por dados reais
  {
    period: "Janeiro 2025",
    totalOrders: 150,
    revenue: 4500,
    topStatus: "Entregue",
  },
  // Mais linhas...
];

export default function ReportTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Período</TableHead>
          <TableHead>Total de Pedidos</TableHead>
          <TableHead>Receita Total (R$)</TableHead>
          <TableHead>Status Mais Comum</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.period}</TableCell>
            <TableCell>{row.totalOrders}</TableCell>
            <TableCell>{row.revenue.toFixed(2)}</TableCell>
            <TableCell>{row.topStatus}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
