const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 1. Create Departments
  const departments = [
    {
      name: 'Roads & Transport',
      code: 'ROAD',
      description: 'Responsible for road maintenance, traffic signals, and transport infrastructure.',
      categories: ['road_issue', 'traffic', 'encroachment']
    },
    {
      name: 'Water & Sanitation',
      code: 'WATER',
      description: 'Handles water supply, drainage, and sewage management.',
      categories: ['water_supply', 'drainage']
    },
    {
      name: 'Electricity & Lighting',
      code: 'POWER',
      description: 'Manages street lights and public electricity issues.',
      categories: ['electricity', 'street_light']
    },
    {
      name: 'Waste Management',
      code: 'WASTE',
      description: 'Handles garbage collection and urban cleanliness.',
      categories: ['garbage', 'pollution']
    }
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept
    });
  }
  console.log('Departments seeded.');

  // 2. Create Users
  const users = [
    {
      name: 'Admin User',
      email: 'admin@civicsetu.com',
      phone: '9876543210',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    },
    {
      name: 'Supervisor User',
      email: 'supervisor@civicsetu.com',
      phone: '9876543211',
      password: hashedPassword,
      role: 'supervisor',
      departmentName: 'Roads & Transport',
      isVerified: true
    },
    {
      name: 'Staff User',
      email: 'staff@civicsetu.com',
      phone: '9876543212',
      password: hashedPassword,
      role: 'staff',
      departmentName: 'Roads & Transport',
      assignedArea: 'Ward 15, Ranchi',
      isVerified: true
    },
    {
      name: 'Citizen User',
      email: 'citizen@example.com',
      phone: '9876543213',
      password: hashedPassword,
      role: 'citizen',
      isVerified: true
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
  }
  console.log('Users seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
