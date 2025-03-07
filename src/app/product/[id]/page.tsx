import { db } from "@/app/_lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductAdditionals from "./_components/product_additional";

interface ProductProps {
  params: Promise<{ id: string }>;
}

const Product = async ({ params }: ProductProps) => {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      Extras: true,
    },
  });

  if (!product) {
    return notFound();
  }

  return (
    <div>
      <div className="flex gap-4 justify-between items-center p-4">
        <Image
          src={
            product.imageUrl ||
            `https://img.freepik.com/psd-gratuitas/modelo-de-midia-social-de-hamburguer-quente-e-picante_505751-2886.jpg?t=st=1741020839~exp=1741024439~hmac=066195a75d87fd588f3d2ff7fe7f4f25546e4a76e51c713e79a9bcc60faf7c01&w=740`
          }
          alt={product.name}
          width={64}
          height={64}
          className="object-contain rounded-sm"
        />
        <div className="flex-1">
          <h1 className="text-lg font-bold ">{product.name}</h1>
          <h2 className=" ">Pao, carne, queijo e salada</h2>

          <span>{product.price}</span>
        </div>
      </div>
      <ProductAdditionals product={product} />
    </div>
  );
};

export default Product;
