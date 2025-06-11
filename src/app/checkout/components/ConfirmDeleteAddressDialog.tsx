import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";

interface ConfirmDeleteAddressDialogProps {
  handleDeleteAddress: (addressId: string) => void;
  addressId: string;
  open: boolean;
  modalOpen: (open: boolean) => void;
}

const ConfirmDeleteAddressDialog = ({
  handleDeleteAddress,
  addressId,
  open,
  modalOpen,
}: ConfirmDeleteAddressDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={modalOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={"link"}
          size="icon"
          className="size-4 cursor-pointer"
          onClick={() => modalOpen}
        >
          <Trash2Icon className=" text-black " />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja excluir esse endereço?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o
            endereço.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteAddress(addressId)}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteAddressDialog;
