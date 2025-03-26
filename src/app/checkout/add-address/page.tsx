import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const isValidBrazilianZipCode = (zipCode: string): boolean => {
  const cleanedZipCode = zipCode.replace(/\D/g, ""); // Remove caracteres não numéricos
  const zipCodeRegex = /^[0-9]{8}$/; // 8 dígitos
  return zipCodeRegex.test(cleanedZipCode);
};

export default async function AddAddressPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

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

          if (!isValidBrazilianZipCode(zipCode)) {
            throw new Error(
              "CEP inválido. Deve conter 8 dígitos (ex.: 12345-678)."
            );
          }

          const normalizedZipCode = zipCode.replace(/\D/g, "");

          if (!session?.user?.id) {
            throw new Error("User not authenticated");
          }

          await db.$transaction([
            // Remove o status de padrão de todos os endereços existentes do usuário
            db.address.updateMany({
              where: {
                userId: session.user.id,
                isDefault: true,
              },
              data: {
                isDefault: false,
              },
            }),
            // Cria o novo endereço como padrão
            db.address.create({
              data: {
                street,
                number,
                city: city || undefined,
                state: state || undefined,
                zipCode: normalizedZipCode,
                userId: session.user.id,
                isDefault: true,
              },
            }),
          ]);

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
