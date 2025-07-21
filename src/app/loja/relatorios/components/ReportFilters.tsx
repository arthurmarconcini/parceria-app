"use client";

import { Dispatch, SetStateAction } from "react";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PaymentMethod, Status } from "@prisma/client";
import { translateStatus } from "@/helpers/translate-status";

interface ReportFiltersProps {
  date: DateRange | undefined;
  setDate: Dispatch<SetStateAction<DateRange | undefined>>;
  status: string;
  setStatus: Dispatch<SetStateAction<string>>;
  paymentMethod: string;
  setPaymentMethod: Dispatch<SetStateAction<string>>;
  onApplyFilters: () => void;
  isPending: boolean;
}

const ReportFilters = ({
  date,
  setDate,
  status,
  setStatus,
  paymentMethod,
  setPaymentMethod,
  onApplyFilters,
  isPending,
}: ReportFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-lg">
      <div className="grid gap-2 flex-1 w-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                    {format(date.to, "LLL dd, y", { locale: ptBR })}
                  </>
                ) : (
                  format(date.from, "LLL dd, y", { locale: ptBR })
                )
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              autoFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Select
        value={status || "todos"}
        onValueChange={(e) => (e === "todos" ? setStatus("") : setStatus(e))}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os Status</SelectItem>
          {Object.values(Status).map((s) => (
            <SelectItem key={s} value={s}>
              {translateStatus(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
        <SelectTrigger className="w-full md:w-[220px]">
          <SelectValue placeholder="Forma de Pagamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas as Formas</SelectItem>
          {Object.values(PaymentMethod).map((pm) => (
            <SelectItem key={pm} value={pm}>
              {pm}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={onApplyFilters}
        disabled={isPending}
        className="w-full md:w-auto"
      >
        {isPending ? "Aplicando..." : "Aplicar Filtros"}
      </Button>
    </div>
  );
};

export default ReportFilters;
