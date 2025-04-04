import { Prisma } from "@prisma/client";
import OptionsTitle from "./options_title";

interface PizzaHalfHalfProps {
  productId: string;
  pizzas: Prisma.ProductGetPayload<{
    include: {
      Size: true;
    };
  }>[];
  firstHalf: string;
  secondHalf: string | null;
  onFirstHalfChange: (id: string) => void;
  onSecondHalfChange: (id: string | null) => void;
  selectedSize: string;
}

const PizzaHalfHalf = ({
  pizzas,
  firstHalf,
  secondHalf,
  onFirstHalfChange,
  onSecondHalfChange,
  selectedSize,
}: PizzaHalfHalfProps) => {
  return (
    <div>
      <OptionsTitle title="Selecione os sabores" />
      <div className="p-4">
        <select
          value={firstHalf}
          onChange={(e) => onFirstHalfChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {pizzas.map((pizza) => (
            <option key={pizza.id} value={pizza.id}>
              {pizza.name}
            </option>
          ))}
        </select>
        <select
          value={secondHalf || ""}
          onChange={(e) => onSecondHalfChange(e.target.value || null)}
          className="w-full p-2 mt-2 border rounded text-sm"
        >
          <option value="" className="text-sm font-bold font-sans">
            Selecione o segundo sabor (opcional)
          </option>
          {pizzas
            .filter((p) => p.id !== firstHalf) // Evita repetir o mesmo sabor
            .map((pizza) => {
              const size = pizza.Size.find(
                (size) => size.name === selectedSize
              );
              const price = size?.price ? `R$ ${size.price.toFixed(2)}` : "N/A"; // Exibe o preço ou "N/A" se não houver
              return (
                <option
                  className="text-sm font-bold font-sans"
                  key={pizza.id}
                  value={pizza.id}
                >
                  {`${pizza.name} - ${price}`}
                </option>
              );
            })}
        </select>
      </div>
    </div>
  );
};
export default PizzaHalfHalf;
