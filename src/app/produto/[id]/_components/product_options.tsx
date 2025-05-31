import { Size } from "@prisma/client";
import currencyFormat from "@/helpers/currency-format";
import OptionsTitle from "./options_title";

interface ProductOptionsProps {
  sizes: Size[];
  selectedSize: string;
  onSizeChange: (sizeId: string) => void;
}

const ProductOptions = ({
  sizes,
  selectedSize,
  onSizeChange,
}: ProductOptionsProps) => {
  return (
    <div className="mt-4">
      <OptionsTitle title="Selecione o tamanho" />
      <div className="flex gap-2 p-4 justify-center">
        {sizes.map((size) => (
          <button
            key={size.id}
            className={`p-2 border rounded ${
              selectedSize === size.id ? "bg-primary text-white" : ""
            }`}
            onClick={() => onSizeChange(size.id)}
          >
            {size.name} - {currencyFormat(size.price)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductOptions;
