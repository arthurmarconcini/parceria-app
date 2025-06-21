import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GuestInfoFormProps {
  guestName: string;
  setGuestName: (value: string) => void;
  guestPhone: string;
  setGuestPhone: (value: string) => void;
}

export const GuestInfoForm = ({
  guestName,
  setGuestName,
  guestPhone,
  setGuestPhone,
}: GuestInfoFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Seus Dados</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="guestName">Nome</Label>
          <Input
            id="guestName"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Seu nome completo"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="guestPhone">Celular (WhatsApp)</Label>
          <Input
            id="guestPhone"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            type="tel"
            placeholder="(00) 00000-0000"
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};
