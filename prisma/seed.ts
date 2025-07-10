import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes para evitar duplicatas, respeitando a ordem das dependências
  console.log("Iniciando a limpeza do banco de dados...");
  await prisma.orderExtra.deleteMany();
  await prisma.extra.deleteMany();
  await prisma.size.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log("Limpeza concluída.");

  // --- CRIAÇÃO DAS CATEGORIAS ---
  console.log("Criando categorias...");
  const burgerCategory = await prisma.category.create({
    data: { name: "Hambúrgueres" },
  });

  const pizzaCategory = await prisma.category.create({
    data: { name: "Pizzas" },
  });

  const dishCategory = await prisma.category.create({
    data: { name: "Pratos" },
  });

  const drinkCategory = await prisma.category.create({
    data: { name: "Bebidas" },
  });
  console.log("Categorias criadas com sucesso!");

  // --- CRIAÇÃO DOS PRODUTOS E ADICIONAIS ---
  console.log("Criando produtos e adicionais...");

  // --- Hambúrgueres ---
  const burgersData = [
    {
      name: "Parceria Clássico",
      description:
        "A combinação perfeita de pão brioche, nosso suculento blend de 120g, queijo prato derretido e um toque do nosso molho secreto. O clássico que nunca erra!",
      price: 28.9,
    },
    {
      name: "Salada Burger",
      description:
        "Leveza e sabor se encontram aqui! Blend de 120g, queijo, alface fresquinha, tomate em rodelas e nossa maionese verde artesanal no pão de brioche.",
      price: 30.9,
    },
    {
      name: "Bacon Burger",
      description:
        "Para os amantes de bacon! Fatias crocantes de bacon sobre um blend de 120g, queijo cheddar cremoso e pão macio. Uma explosão de sabor defumado.",
      price: 32.9,
    },
    {
      name: "Ovo Burger",
      description:
        "Reforçado e delicioso! Nosso blend de 120g com queijo, presunto, e um ovo perfeitamente frito para completar essa obra de arte no pão de brioche.",
      price: 31.9,
    },
    {
      name: "Tudo Burger",
      description:
        "O nome já diz tudo! Um exagero de sabor com blend de 120g, queijo, presunto, bacon, ovo, salada e o que mais você tiver direito. Prepare-se!",
      price: 38.9,
    },
    {
      name: "Duplo Cheddar",
      description:
        "O dobro de sabor! Duas carnes de 120g, o dobro de queijo cheddar, e nosso molho especial em um pão de brioche que aguenta o desafio.",
      price: 39.9,
    },
    {
      name: "Catupiry Especial",
      description:
        "Cremosidade sem igual! Nosso blend de 120g coberto com uma generosa camada de Catupiry original, bacon crocante e cebola caramelizada.",
      price: 34.9,
    },
    {
      name: "Gourmet da Casa",
      description:
        "Uma experiência única! Blend de 120g, queijo brie, rúcula, geleia de pimenta e maionese de alho em um pão australiano. Inesquecível.",
      price: 37.9,
    },
  ];

  const burgerExtras = [
    { name: "Queijo Mussarela", price: 3.0 },
    { name: "Queijo Cheddar Fatia", price: 3.5 },
    { name: "Queijo Cheddar Molho", price: 4.5 },
    { name: "Catupiry", price: 4.0 },
    { name: "Presunto", price: 2.5 },
    { name: "Bacon", price: 5.0 },
    { name: "Ovo", price: 3.0 },
    { name: "Salada", price: 2.0 },
    { name: "Carne 120g", price: 8.0 },
  ];

  for (const burger of burgersData) {
    await prisma.product.create({
      data: {
        ...burger,
        categoryId: burgerCategory.id,
        imageUrl: "s3://parceria-app-imagens-de-produtos/Burguer.jpg",
        Extras: {
          create: burgerExtras,
        },
      },
    });
  }
  console.log("Hambúrgueres e seus adicionais criados.");

  // --- Pizzas ---
  const pizzasData = [
    {
      name: "Margherita",
      description:
        "A realeza das pizzas: molho de tomate fresco, mussarela de primeira, manjericão e um fio de azeite. Simplesmente divina!",
    },
    {
      name: "Calabresa",
      description:
        "A favorita da galera! Fatias de calabresa artesanal sobre um mar de mussarela e rodelas de cebola que dão o toque final.",
    },
    {
      name: "Quatro Queijos",
      description:
        "Uma sinfonia de sabores com mussarela, provolone, parmesão e o toque cremoso do Catupiry. Para quem ama queijo sem moderação.",
    },
    {
      name: "Frango com Catupiry",
      description:
        "A combinação que o brasileiro ama! Frango desfiado e temperado, coberto com o autêntico e cremoso Catupiry.",
    },
    {
      name: "Portuguesa",
      description:
        "Uma viagem a Portugal em cada fatia. Presunto, ovos, cebola, azeitonas e pimentão sobre uma base de mussarela generosa.",
    },
    {
      name: "Pepperoni",
      description:
        "Intensa e levemente picante. Fatias de pepperoni de alta qualidade espalhadas sobre queijo mussarela derretido. Um clássico com atitude.",
    },
  ];

  const pizzaExtras = [
    { name: "Queijo", price: 5.0 },
    { name: "Bacon", price: 6.0 },
    { name: "Queijo Cheddar Molho", price: 6.5 },
    { name: "Catupiry", price: 6.0 },
    { name: "Presunto", price: 4.0 },
    { name: "Calabresa", price: 5.0 },
    { name: "Ovo", price: 3.5 },
  ];

  const pizzaSizes = [
    { name: "Média", price: 45.0 },
    { name: "Grande", price: 55.0 },
    { name: "Gigante", price: 65.0 },
  ];

  for (const pizza of pizzasData) {
    await prisma.product.create({
      data: {
        ...pizza,
        categoryId: pizzaCategory.id,
        isHalfHalf: true,
        price: null,
        imageUrl:
          "s3://parceria-app-imagens-de-produtos/0mHUxYlJbETkQaYzsUsG7-pizza_quatro_queijos.jpg",
        Extras: {
          create: pizzaExtras,
        },
        Size: {
          create: pizzaSizes,
        },
      },
    });
  }
  console.log("Pizzas e seus adicionais/tamanhos criados.");

  // --- Pratos ---
  await prisma.product.create({
    data: {
      name: "Batata Frita 250g",
      description:
        "A porção perfeita para um! Batatas selecionadas, fritas na hora, crocantes por fora e macias por dentro. Impossível resistir.",
      price: 18.0,
      categoryId: dishCategory.id,
      imageUrl: "s3://parceria-app-imagens-de-produtos/Batata.jpg",
    },
  });

  await prisma.product.create({
    data: {
      name: "Batata Frita 400g",
      description:
        "Para dividir com a galera (ou não!). Uma generosa porção de batatas douradas e crocantes, perfeitas para acompanhar qualquer pedido.",
      price: 26.0,
      categoryId: dishCategory.id,
      imageUrl: "s3://parceria-app-imagens-de-produtos/Batata.jpg",
    },
  });
  console.log("Pratos criados.");

  // --- Bebidas ---
  await prisma.product.create({
    data: {
      name: "Coca-Cola",
      description:
        "A clássica que todo mundo ama, geladinha para refrescar. Lata 350ml.",
      price: 6.0,
      categoryId: drinkCategory.id,
      imageUrl: "s3://parceria-app-imagens-de-produtos/Refrigerante.jpg",
    },
  });

  await prisma.product.create({
    data: {
      name: "Guaraná Antarctica",
      description:
        "O sabor autêntico do Brasil para acompanhar seu pedido. Lata 350ml.",
      price: 5.5,
      categoryId: drinkCategory.id,
      imageUrl: "s3://parceria-app-imagens-de-produtos/Refrigerante.jpg",
    },
  });

  await prisma.product.create({
    data: {
      name: "Heineken 600ml",
      description:
        "Uma cerveja premium de qualidade mundial, perfeitamente gelada para momentos especiais.",
      price: 15.0,
      categoryId: drinkCategory.id,
      imageUrl: "s3://parceria-app-imagens-de-produtos/Cerveja.jpg",
    },
  });

  await prisma.product.create({
    data: {
      name: "Brahma 600ml",
      description:
        "A cerveja número 1 do Brasil, com a cremosidade e o sabor que você já conhece.",
      price: 12.0,
      categoryId: drinkCategory.id,
      imageUrl: "s3://parceria-app-imagens-de-produtos/Cerveja.jpg",
    },
  });

  await prisma.product.create({
    data: {
      name: "Suco de Laranja Natural",
      description:
        "Feito na hora com laranjas frescas para um sabor cítrico e revigorante. 500ml.",
      price: 9.0,
      categoryId: drinkCategory.id,
      imageUrl: "s3://parceria-app-imagens-de-produtos/Refrigerante.jpg",
    },
  });

  await prisma.product.create({
    data: {
      name: "Suco de Abacaxi com Hortelã",
      description:
        "A combinação tropical e refrescante que vai te surpreender. 500ml.",
      price: 9.5,
      categoryId: drinkCategory.id,
      imageUrl: "s3://parceria-app-imagens-de-produtos/Refrigerante.jpg",
    },
  });
  console.log("Bebidas criadas.");

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Ocorreu um erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
