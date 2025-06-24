"use client";

import Image from "next/image";
import currencyFormat from "@/helpers/currency-format";
import { Product, Size } from "@prisma/client"; // Usaremos um tipo mais genérico aqui

interface ProductImageAndInfoProps {
  product: Pick<
    Product,
    "imageUrl" | "name" | "description" | "price" | "discount"
  > & {
    // Incluir a categoria para determinar se é pizza e se o preço deve ser exibido
    category?: { name: string }; // Opcional, mas útil
    Size?: Size[]; // Para verificar se há tamanhos e não exibir preço fixo
  };
  isPizzaCategory: boolean; // Adicionado para lógica de exibição de preço
}

const ProductImageAndInfo = ({
  product,
  isPizzaCategory,
}: ProductImageAndInfoProps) => {
  // Não exibe preço fixo se for pizza ou se tiver tamanhos configuráveis
  const shouldDisplayFixedPrice =
    !isPizzaCategory &&
    (!product.Size || product.Size.length === 0) &&
    product.price !== null;

  return (
    <>
      <div className="relative h-64 w-full md:h-80">
        <Image
          src={
            product.imageUrl ||
            "https://img.freepik.com/fotos-gratis/hamburguer-enorme-com-carne-frita-e-legumes_140725-971.jpg"
          }
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="space-y-3 p-4">
        <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}
        {shouldDisplayFixedPrice && (
          <p className="text-xl font-semibold text-primary">
            {currencyFormat(
              product.price! * (1 - (product.discount || 0) / 100)
            )}
            {product.discount && product.discount > 0 && (
              <span className="ml-2 text-sm line-through text-muted-foreground">
                {currencyFormat(product.price!)}
              </span>
            )}
          </p>
        )}
      </div>
    </>
  );
};

export default ProductImageAndInfo;
