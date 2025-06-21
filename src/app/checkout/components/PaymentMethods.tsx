import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentMethod } from "@prisma/client";

interface PaymentMethodsProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  requiresChange: boolean;
  setRequiresChange: (value: boolean) => void;
  changeFor: number | null;
  setChangeFor: (value: number | null) => void;
}

export const PaymentMethods = ({
  paymentMethod,
  setPaymentMethod,
  requiresChange,
  setRequiresChange,
  changeFor,
  setChangeFor,
}: PaymentMethodsProps) => {
  const handlePaymentMethodChange = (value: PaymentMethod) => {
    setPaymentMethod(value);
    if (value !== "CASH") setRequiresChange(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forma de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(val) =>
            handlePaymentMethodChange(val as PaymentMethod)
          }
          className="space-y-2"
        >
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="PIX" /> Pix
          </Label>
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="CREDIT_CARD" /> Cartão de Crédito
          </Label>
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="DEBIT_CARD" /> Cartão de Débito
          </Label>
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="CASH" /> Dinheiro
          </Label>
        </RadioGroup>
        {paymentMethod === "CASH" && (
          <div className="mt-4 space-y-4 p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <Checkbox
                id="requiresChange"
                checked={requiresChange}
                onCheckedChange={(checked) => setRequiresChange(!!checked)}
              />
              <Label htmlFor="requiresChange">Precisa de troco?</Label>
            </div>
            {requiresChange && (
              <Input
                value={changeFor || ""}
                onChange={(e) => setChangeFor(parseFloat(e.target.value))}
                type="number"
                placeholder="Troco para quanto?"
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
