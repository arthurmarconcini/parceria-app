import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import currencyFormat from "@/helpers/currency-format";
import { LocalityWithCity, GuestAddressState } from "./CheckoutClient";

interface GuestAddressFormProps {
  guestAddress: GuestAddressState;
  setGuestAddress: (value: React.SetStateAction<GuestAddressState>) => void;
  localities: LocalityWithCity[];
  isLoadingLocalities: boolean;
}

export const GuestAddressForm = ({
  guestAddress,
  setGuestAddress,
  localities,
  isLoadingLocalities,
}: GuestAddressFormProps) => {
  const handleGuestAddressChange = (
    field: keyof GuestAddressState,
    value: string
  ) => {
    setGuestAddress((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Endereço de Entrega</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={guestAddress.street}
                onChange={(e) =>
                  handleGuestAddressChange("street", e.target.value)
                }
                required
              />
            </div>
            <div className="col-span-1 space-y-1">
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={guestAddress.number}
                onChange={(e) =>
                  handleGuestAddressChange("number", e.target.value)
                }
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="locality">Bairro</Label>
            <Select
              name="localityId"
              value={guestAddress.localityId}
              onValueChange={(value) =>
                handleGuestAddressChange("localityId", value)
              }
              required
              disabled={isLoadingLocalities}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingLocalities
                      ? "Carregando bairros..."
                      : "Selecione o bairro"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {localities.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name} (+{currencyFormat(loc.deliveryFee)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="reference">Referência (opcional)</Label>
            <Input
              id="reference"
              value={guestAddress.reference}
              onChange={(e) =>
                handleGuestAddressChange("reference", e.target.value)
              }
              placeholder="Ex: Perto da padaria"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
