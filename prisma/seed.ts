// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Limpar as tabelas existentes (opcional, cuidado ao usar em produção)
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Dados das categorias
  const categories = [
    { name: "Pizzas" },
    { name: "Hambúrgueres" },
    { name: "Bebidas" },
    { name: "Sobremesas" },
    { name: "Saladas" },
  ];

  // Inserir categorias e produtos
  for (const categoryData of categories) {
    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
      },
    });

    // Produtos por categoria
    const products = Array.from({ length: 5 }, (_, index) => ({
      name: `${categoryData.name.slice(0, -1)} ${index + 1}`, // Remove 's' do plural e adiciona número
      price: parseFloat((10 + index * 5).toFixed(2)), // Preços fictícios: 10, 15, 20, 25, 30
      categoryId: category.id,
      discount: index === 0 ? 2.0 : null, // Apenas o primeiro produto tem desconto
      imageUrl: `https://img.freepik.com/psd-gratuitas/modelo-de-midia-social-de-hamburguer-quente-e-picante_505751-2886.jpg?t=st=1741020839~exp=1741024439~hmac=066195a75d87fd588f3d2ff7fe7f4f25546e4a76e51c713e79a9bcc60faf7c01&w=740`, // URL fictícia
    }));

    await prisma.product.createMany({
      data: products,
    });
  }

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao executar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
