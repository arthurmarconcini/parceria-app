"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressWithLocality } from "./ProfileClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { archiveAddressAction } from "../actions/PerfilActions";
import { toast } from "sonner";
import { Home, Trash2 } from "lucide-react";
import { useTransition } from "react";

interface AddressCardProps {
  address: AddressWithLocality;
  onSetDefault: (addressId: string) => void;
  onAddressDeleted: (deletedAddressId: string) => void;
}

export const AddressCard = ({
  address,
  onSetDefault,
  onAddressDeleted,
}: AddressCardProps) => {
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    // Renomeado de handleDelete
    startTransition(async () => {
      // Chamar a nova action de arquivamento
      const result = await archiveAddressAction(address.id);
      if (result.success && result.archivedAddressId) {
        toast.success("Endereço arquivado com sucesso!");
        onAddressDeleted(result.archivedAddressId); // A função no pai ainda remove da lista da UI
      } else {
        toast.error(result.error || "Falha ao arquivar o endereço.");
      }
    });
  };

  return (
    <Card className={address.isDefault ? "border-primary" : ""}>
      <CardHeader className="flex flex-row justify-between items-start pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span>
            {address.street}, {address.number}
          </span>
        </CardTitle>
        {address.isDefault && <Badge>Padrão</Badge>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {address.locality?.name}, {address.city} - {address.state}
        </p>
        <div className="flex justify-end items-center gap-2 mt-4">
          {!address.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startTransition(() => onSetDefault(address.id))}
              disabled={isPending}
            >
              Tornar Padrão
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleArchive}
            disabled={isPending}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
