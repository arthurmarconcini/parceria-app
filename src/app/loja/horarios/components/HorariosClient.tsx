"use client";

import { OperatingHours, StoreSettings } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const weekDays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

interface HorariosClientProps {
  initialHours: OperatingHours[];
  initialSettings: StoreSettings | null;
}

export function HorariosClient({
  initialHours,
  initialSettings,
}: HorariosClientProps) {
  const [isPending, startTransition] = useTransition();

  // Inicializa o estado para todos os dias da semana
  const [hours, setHours] = useState<OperatingHours[]>(() =>
    weekDays.map((_, index) => {
      const existing = initialHours.find((h) => h.dayOfWeek === index);
      return (
        existing || {
          id: String(index),
          dayOfWeek: index,
          isOpen: false,
          openTime: "18:00",
          closeTime: "23:00",
        }
      );
    })
  );
  const [isTemporarilyClosed, setIsTemporarilyClosed] = useState(
    initialSettings?.isTemporarilyClosed ?? false
  );

  const handleHourChange = (
    day: number,
    field: "isOpen" | "openTime" | "closeTime",
    value: string | boolean
  ) => {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === day ? { ...h, [field]: value } : h))
    );
  };

  const handleSaveChanges = () => {
    startTransition(async () => {
      const promise = fetch("/api/store/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatingHours: hours, isTemporarilyClosed }),
      }).then((res) => {
        if (!res.ok) throw new Error("Falha ao salvar");
        return res.json();
      });

      toast.promise(promise, {
        loading: "Salvando alterações...",
        success: "Horários salvos com sucesso!",
        error: "Erro ao salvar alterações.",
      });
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fechamento Temporário</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Switch
            id="temporary-close"
            checked={isTemporarilyClosed}
            onCheckedChange={setIsTemporarilyClosed}
            aria-label="Fechar loja temporariamente"
          />
          <Label htmlFor="temporary-close" className="flex flex-col">
            <span className="font-medium">Fechar a loja agora</span>
            <span className="text-xs text-muted-foreground">
              Isso irá impedir novos pedidos, independentemente do horário.
            </span>
          </Label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário Semanal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hours.map((h, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center gap-4 p-3 border rounded-lg"
            >
              <Label className="w-full md:w-32 font-semibold">
                {weekDays[h.dayOfWeek]}
              </Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={h.isOpen}
                  onCheckedChange={(checked) =>
                    handleHourChange(h.dayOfWeek, "isOpen", checked)
                  }
                />
                <span className={h.isOpen ? "text-green-600" : "text-red-600"}>
                  {h.isOpen ? "Aberto" : "Fechado"}
                </span>
              </div>
              <div
                className={`flex items-center gap-2 flex-1 ${
                  !h.isOpen ? "opacity-50" : ""
                }`}
              >
                <Input
                  type="time"
                  value={h.openTime || ""}
                  disabled={!h.isOpen}
                  onChange={(e) =>
                    handleHourChange(h.dayOfWeek, "openTime", e.target.value)
                  }
                />
                <span>às</span>
                <Input
                  type="time"
                  value={h.closeTime || ""}
                  disabled={!h.isOpen}
                  onChange={(e) =>
                    handleHourChange(h.dayOfWeek, "closeTime", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}
