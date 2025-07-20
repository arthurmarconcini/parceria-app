"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportFilters() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("all");

  const handleGenerate = () => {
    // Lógica para disparar query com filtros (ex.: chamar hook ou API)
    console.log("Gerando relatório com filtros:", {
      startDate,
      endDate,
      status,
    });
  };

  return (
    <div className="flex gap-4 mb-6">
      <Input
        type="date"
        placeholder="Data inicial"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <Input
        type="date"
        placeholder="Data final"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="delivered">Entregue</SelectItem>
          {/* Adicione mais status conforme o schema Prisma */}
        </SelectContent>
      </Select>
      <Button onClick={handleGenerate}>Gerar Relatório</Button>
    </div>
  );
}
