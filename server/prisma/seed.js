require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DAY = 86_400_000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const agentPass = await bcrypt.hash('agent123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartseason.dev' },
    update: {},
    create: {
      name: 'Admin Coordinator',
      email: 'admin@smartseason.dev',
      password: adminPass,
      role: 'ADMIN',
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@smartseason.dev' },
    update: {},
    create: {
      name: 'Alex Agent',
      email: 'agent@smartseason.dev',
      password: agentPass,
      role: 'AGENT',
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: 'brianna@smartseason.dev' },
    update: {},
    create: {
      name: 'Brianna Field',
      email: 'brianna@smartseason.dev',
      password: agentPass,
      role: 'AGENT',
    },
  });

  await prisma.fieldLog.deleteMany();
  await prisma.field.deleteMany();

  const f1 = await prisma.field.create({
    data: {
      name: 'North Plot A',
      cropType: 'Maize',
      plantingDate: daysAgo(20),
      stage: 'GROWING',
      assignedAgentId: agent.id,
    },
  });

  const f2 = await prisma.field.create({
    data: {
      name: 'South Plot B',
      cropType: 'Beans',
      plantingDate: daysAgo(75),
      stage: 'GROWING',
      assignedAgentId: agent.id,
    },
  });

  const f3 = await prisma.field.create({
    data: {
      name: 'Greenhouse 1',
      cropType: 'Tomato',
      plantingDate: daysAgo(10),
      stage: 'PLANTED',
      assignedAgentId: agent2.id,
    },
  });

  const f4 = await prisma.field.create({
    data: {
      name: 'East Field',
      cropType: 'Wheat',
      plantingDate: daysAgo(120),
      stage: 'HARVESTED',
      assignedAgentId: agent2.id,
    },
  });

  const f5 = await prisma.field.create({
    data: {
      name: 'West Field',
      cropType: 'Sorghum',
      plantingDate: daysAgo(45),
      stage: 'READY',
      assignedAgentId: agent.id,
    },
  });

  await prisma.fieldLog.createMany({
    data: [
      {
        fieldId: f1.id,
        agentId: agent.id,
        stageBefore: 'PLANTED',
        stageAfter: 'GROWING',
        note: 'Seedlings emerged, looking healthy.',
      },
      {
        fieldId: f2.id,
        agentId: agent.id,
        stageBefore: 'PLANTED',
        stageAfter: 'GROWING',
        note: 'Delayed germination due to low rainfall.',
      },
      {
        fieldId: f5.id,
        agentId: agent.id,
        stageBefore: 'GROWING',
        stageAfter: 'READY',
        note: 'Grain heads fully formed.',
      },
      {
        fieldId: f4.id,
        agentId: agent2.id,
        stageBefore: 'READY',
        stageAfter: 'HARVESTED',
        note: 'Harvest completed, yield good.',
      },
    ],
  });

  console.log('Seed complete.');
  console.log('  Admin: admin@smartseason.dev / admin123');
  console.log('  Agent: agent@smartseason.dev / agent123');
  console.log('  Agent: brianna@smartseason.dev / agent123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
