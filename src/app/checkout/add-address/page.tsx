import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { redirect } from "next/navigation";

export default function AddAddressPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Adicionar Endereço</h1>
      <form
        action={async (formData) => {
          "use server";
          const street = formData.get("street") as string;
          const number = formData.get("number") as string;
          const city = formData.get("city") as string;
          const state = formData.get("state") as string;
          const zipCode = formData.get("zipCode") as string;

          // Simulação de salvamento (sem Prisma)
          console.log("Novo endereço fictício:", {
            street,
            number,
            city,
            state,
            zipCode,
          });

          redirect("/checkout");
        }}
      >
        <div className="space-y-4">
          <div>
            <Label>Rua</Label>
            <Input name="street" required />
          </div>
          <div>
            <Label>Número</Label>
            <Input name="number" required />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input name="city" />
          </div>
          <div>
            <Label>Estado</Label>
            <Input name="state" />
          </div>
          <div>
            <Label>CEP</Label>
            <Input name="zipCode" required />
          </div>
          <Button type="submit">Salvar Endereço</Button>
        </div>
      </form>
    </div>
  );
}
