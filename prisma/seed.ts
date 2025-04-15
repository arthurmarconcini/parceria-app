import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Limpar o banco de dados antes de popular (opcional)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.extra.deleteMany();
  await prisma.size.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Criar categorias
  const pizzaCategory = await prisma.category.create({
    data: { name: "Pizzas" },
  });
  const burgerCategory = await prisma.category.create({
    data: { name: "Hambúrgueres" },
  });
  const drinkCategory = await prisma.category.create({
    data: { name: "Bebidas" },
  });

  // Pizzas com tamanhos P, M, G
  const pizzas = [
    {
      name: "Pizza de Calabresa",
      categoryId: pizzaCategory.id,
      isHalfHalf: true,
      sizes: [
        { name: "P", price: 35.0 },
        { name: "M", price: 45.0 },
        { name: "G", price: 55.0 },
      ],
    },
    {
      name: "Pizza Margherita",
      categoryId: pizzaCategory.id,
      isHalfHalf: true,
      sizes: [
        { name: "P", price: 33.0 },
        { name: "M", price: 43.0 },
        { name: "G", price: 53.0 },
      ],
    },
    {
      name: "Pizza Quatro Queijos",
      categoryId: pizzaCategory.id,
      isHalfHalf: true,
      sizes: [
        { name: "P", price: 38.0 },
        { name: "M", price: 48.0 },
        { name: "G", price: 58.0 },
      ],
    },
    {
      name: "Pizza Pepperoni",
      categoryId: pizzaCategory.id,
      isHalfHalf: true,
      sizes: [
        { name: "P", price: 36.0 },
        { name: "M", price: 46.0 },
        { name: "G", price: 56.0 },
      ],
    },
    {
      name: "Pizza Frango com Catupiry",
      categoryId: pizzaCategory.id,
      isHalfHalf: true,
      sizes: [
        { name: "P", price: 37.0 },
        { name: "M", price: 47.0 },
        { name: "G", price: 57.0 },
      ],
    },
  ];

  // Hambúrgueres (preço único, sem tamanhos)
  const burgers = [
    { name: "X-Burger", categoryId: burgerCategory.id, price: 18.0 },
    { name: "X-Salada", categoryId: burgerCategory.id, price: 20.0 },
    { name: "X-Bacon", categoryId: burgerCategory.id, price: 22.0 },
    { name: "X-Tudo", categoryId: burgerCategory.id, price: 25.0 },
    {
      name: "Hambúrguer Artesanal",
      categoryId: burgerCategory.id,
      price: 28.0,
    },
  ];

  // Bebidas (preço único, sem tamanhos)
  const drinks = [
    { name: "Coca-Cola 350ml", categoryId: drinkCategory.id, price: 6.0 },
    {
      name: "Guaraná Antarctica 350ml",
      categoryId: drinkCategory.id,
      price: 5.5,
    },
    { name: "Fanta Laranja 350ml", categoryId: drinkCategory.id, price: 5.5 },
    { name: "Suco de Laranja 500ml", categoryId: drinkCategory.id, price: 8.0 },
    { name: "Água Mineral 500ml", categoryId: drinkCategory.id, price: 4.0 },
  ];

  // Adicionais (extras)
  const extras = [
    { name: "Queijo Extra", price: 5.0 }, // Para pizzas ou hambúrgueres
    { name: "Bacon", price: 6.0 }, // Para hambúrgueres ou pizzas
    { name: "Catupiry Extra", price: 6.5 }, // Para pizzas
    { name: "Pepperoni Extra", price: 7.0 }, // Para pizzas
    { name: "Alface e Tomate", price: 3.0 }, // Para hambúrgueres
  ];

  // Popular Pizzas
  const createdPizzas = [];
  for (const pizza of pizzas) {
    const createdPizza = await prisma.product.create({
      data: {
        name: pizza.name,
        categoryId: pizza.categoryId,
        isHalfHalf: pizza.isHalfHalf,
        imageUrl:
          "https://img.freepik.com/fotos-gratis/pizza-pizza-cheia-de-tomates-salame-e-azeitonas_140725-1200.jpg?t=st=1744671528~exp=1744675128~hmac=2643592523d49468d3cb30d93a38b0d730f46a123231bdfb056ac5f21a387154&w=740",
        Size: {
          create: pizza.sizes.map((size) => ({
            name: size.name,
            price: size.price,
          })),
        },
      },
    });
    createdPizzas.push(createdPizza);
  }

  // Popular Hambúrgueres
  const createdBurgers = [];
  for (const burger of burgers) {
    const createdBurger = await prisma.product.create({
      data: {
        name: burger.name,
        price: burger.price,
        categoryId: burger.categoryId,
        imageUrl:
          "https://img.freepik.com/fotos-gratis/hamburguer-de-vista-frontal-em-um-carrinho_141793-15542.jpg?t=st=1744671528~exp=1744675128~hmac=e38d7ee5daf2bdcf8944c7b81c1914f08c6eff6d87911c7eceea11f0e45c9ccd&w=996",
      },
    });
    createdBurgers.push(createdBurger);
  }

  // Popular Bebidas
  for (const drink of drinks) {
    await prisma.product.create({
      data: {
        name: drink.name,
        price: drink.price,
        categoryId: drink.categoryId,
        imageUrl:
          "https://img.freepik.com/vetores-gratis/anuncio-de-refrigerante-de-limao-realista_52683-8100.jpg?t=st=1744671528~exp=1744675128~hmac=ab9dcde6a181f7fbe26ad34e64d095447713e0747c9e2a8e698ed402deedfe1d&w=740",
      },
    });
  }

  // Popular Extras (associados a produtos específicos)
  await prisma.extra.create({
    data: {
      name: extras[0].name, // Queijo Extra
      price: extras[0].price,
      productId: createdPizzas[0].id, // Associado à Pizza de Calabresa
    },
  });

  await prisma.extra.create({
    data: {
      name: extras[1].name, // Bacon
      price: extras[1].price,
      productId: createdBurgers[2].id, // Associado ao X-Bacon
    },
  });

  await prisma.extra.create({
    data: {
      name: extras[2].name, // Catupiry Extra
      price: extras[2].price,
      productId: createdPizzas[4].id, // Associado à Pizza Frango com Catupiry
    },
  });

  await prisma.extra.create({
    data: {
      name: extras[3].name, // Pepperoni Extra
      price: extras[3].price,
      productId: createdPizzas[3].id, // Associado à Pizza Pepperoni
    },
  });

  await prisma.extra.create({
    data: {
      name: extras[4].name, // Alface e Tomate
      price: extras[4].price,
      productId: createdBurgers[1].id, // Associado ao X-Salada
    },
  });

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
