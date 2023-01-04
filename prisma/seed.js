const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedUsers() {
  const email = "admin@foundation.ph";
  const hashedPassword = await bcrypt.hash("adminiscool", 10);

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

async function seedDetailCategories() {
  const parentCategories = [
    "Material",
    "Labor",
    "Sub-Contractors",
    "Permits and Licenses",
    "Operations",
  ];

  const subCategories = [
    { parent: "Labor", categories: ["Plumbing", "Installer", "Welder", "Electrician"] },
  ];

  await prisma.detailCategory.deleteMany({
    where: {
      id: {
        in: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    },
  });

  await prisma.detailCategory.createMany({
    data: [
      ...parentCategories.map((c, i) => {
        return { description: c, id: i + 1 };
      }),
    ],
  });

  subCategories.forEach(async (sc) => {
    const parent = await prisma.detailCategory.findFirst({
      where: {
        description: sc.parent,
      },
    });
    await prisma.detailCategory.createMany({
      data: [
        ...sc.categories.map((c, i) => {
          return {
            description: c,
            parentId: parent.id,
            id: i + 1 + parentCategories.length,
          };
        }),
      ],
    });
  });
}

async function seed() {
  await seedUsers();
  await seedDetailCategories();
  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
