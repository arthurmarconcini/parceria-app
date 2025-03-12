import { Trash2Icon, MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "../../ui/button";

interface QuantityButtonProps {
  quantity: number;
}

const QuantityButton = ({ quantity }: QuantityButtonProps) => {
  return (
    <div className="rounded-md flex gap-2 items-center bg-neutral-100 ">
      {quantity === 1 ? (
        <Button size="icon" variant="ghost" className="text-destructive">
          <Trash2Icon size={18} />
        </Button>
      ) : (
        <Button size="icon" variant="ghost" className="text-chart-5">
          <MinusIcon size={18} strokeWidth={1.5} />
        </Button>
      )}
      <div className="text-sm w-3 text-center">{quantity}</div>

      <Button size="icon" variant="ghost" className="text-chart-5 ">
        <PlusIcon size={18} strokeWidth={1.5} />
      </Button>
    </div>
  );
};

export default QuantityButton;
