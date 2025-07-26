"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

// Função auxiliar para formatar um número para o padrão de moeda BRL.
const format = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Função auxiliar para converter a string de moeda de volta para um número.
const parse = (value: string): number => {
  // Remove todos os caracteres não numéricos para obter apenas os dígitos.
  const onlyNumbers = value.replace(/[^\d]/g, "");
  if (!onlyNumbers) return 0;
  // Converte os dígitos para um número, considerando os dois últimos como centavos.
  return Number(onlyNumbers) / 100;
};

// A interface agora usa o tipo padrão do React para os atributos do input,
// removendo a dependência do tipo não exportado 'InputProps'.
export interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value?: number | null;
  onChange?: (value: number | null) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value: externalValue, onChange, onBlur, ...props }, ref) => {
    // Estado interno para armazenar o valor formatado como string (ex: "R$ 12,34").
    const [internalValue, setInternalValue] = React.useState<string>(() =>
      typeof externalValue === "number" ? format(externalValue) : ""
    );

    // Efeito para sincronizar o estado interno quando o valor externo (do formulário) muda.
    React.useEffect(() => {
      const numericValue = parse(internalValue);
      if (typeof externalValue === "number" && externalValue !== numericValue) {
        setInternalValue(format(externalValue));
      }
      // Limpa o input se o valor externo for nulo ou indefinido.
      if (externalValue === null || externalValue === undefined) {
        setInternalValue("");
      }
    }, [externalValue, internalValue]);

    // Manipulador para o evento onChange do input.
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: inputValue } = e.target;

      // Limpa a entrada para conter apenas dígitos.
      const digitsOnly = inputValue.replace(/\D/g, "");

      if (digitsOnly === "") {
        setInternalValue("");
        onChange?.(null); // Propaga null se o campo estiver vazio.
        return;
      }

      // Converte os dígitos para número e formata como moeda.
      const asNumber = Number(digitsOnly) / 100;
      setInternalValue(format(asNumber));

      // Propaga a mudança com o valor numérico puro.
      onChange?.(asNumber);
    };

    // Manipulador para o evento onBlur do input.
    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Garante que o valor esteja formatado corretamente ao sair do campo.
      if (internalValue) {
        const numericValue = parse(internalValue);
        setInternalValue(format(numericValue));
        onChange?.(numericValue);
      }
      // Propaga o evento onBlur, se existir.
      onBlur?.(e);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={internalValue}
        onChange={handleOnChange}
        onBlur={handleOnBlur}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
