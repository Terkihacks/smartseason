const { z } = require('zod');
const prisma = require('../config/db');
const { withStatus, isForwardStage, STAGE_ORDER } = require('../utils/status');

const createSchema = z.object({
  name: z.string().min(1).max(100),
  cropType: z.string().min(1).max(100),
  plantingDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date'),
  assignedAgentId: z.string().nullable().optional(),
  stage: z.enum(STAGE_ORDER).optional(),
});

const stageSchema = z.object({
  stage: z.enum(STAGE_ORDER),
  note: z.string().max(1000).optional(),
});

const noteSchema = z.object({
  note: z.string().min(1).max(1000),
});

const assignSchema = z.object({
  agentId: z.string().nullable(),
});

async function ensureAgentOwnsField(fieldId, agentId) {
  const field = await prisma.field.findUnique({ where: { id: fieldId } });
  if (!field) return { error: 'Field not found', status: 404 };
  if (field.assignedAgentId !== agentId) return { error: 'Forbidden', status: 403 };
  return { field };
}

async function listFields(req, res) {
  const where = req.user.role === 'ADMIN' ? {} : { assignedAgentId: req.user.id };
  const fields = await prisma.field.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      assignedAgent: { select: { id: true, name: true, email: true } },
    },
  });
  res.json({ fields: fields.map(withStatus) });
}

async function getField(req, res) {
  const field = await prisma.field.findUnique({
    where: { id: req.params.id },
    include: {
      assignedAgent: { select: { id: true, name: true, email: true } },
      logs: {
        orderBy: { createdAt: 'desc' },
        include: { agent: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!field) return res.status(404).json({ error: 'Field not found' });

  if (req.user.role === 'AGENT' && field.assignedAgentId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({ field: withStatus(field) });
}

async function createField(req, res) {
  const data = createSchema.parse(req.body);

  if (data.assignedAgentId) {
    const agent = await prisma.user.findUnique({ where: { id: data.assignedAgentId } });
    if (!agent || agent.role !== 'AGENT') {
      return res.status(400).json({ error: 'assignedAgentId must reference an AGENT user' });
    }
  }

  const field = await prisma.field.create({
    data: {
      name: data.name,
      cropType: data.cropType,
      plantingDate: new Date(data.plantingDate),
      stage: data.stage || 'PLANTED',
      assignedAgentId: data.assignedAgentId || null,
    },
    include: { assignedAgent: { select: { id: true, name: true, email: true } } },
  });

  res.status(201).json({ field: withStatus(field) });
}

async function updateStage(req, res) {
  const { stage, note } = stageSchema.parse(req.body);

  if (req.user.role === 'AGENT') {
    const check = await ensureAgentOwnsField(req.params.id, req.user.id);
    if (check.error) return res.status(check.status).json({ error: check.error });
  }

  const current = await prisma.field.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ error: 'Field not found' });

  if (stage === current.stage) {
    return res.status(400).json({ error: 'Stage unchanged' });
  }
  if (!isForwardStage(current.stage, stage)) {
    return res.status(400).json({
      error: `Stage can only move forward (${STAGE_ORDER.join(' → ')})`,
    });
  }

  const [updated] = await prisma.$transaction([
    prisma.field.update({
      where: { id: req.params.id },
      data: { stage },
      include: { assignedAgent: { select: { id: true, name: true, email: true } } },
    }),
    prisma.fieldLog.create({
      data: {
        fieldId: req.params.id,
        agentId: req.user.id,
        stageBefore: current.stage,
        stageAfter: stage,
        note: note || null,
      },
    }),
  ]);

  res.json({ field: withStatus(updated) });
}

async function addNote(req, res) {
  const { note } = noteSchema.parse(req.body);

  if (req.user.role === 'AGENT') {
    const check = await ensureAgentOwnsField(req.params.id, req.user.id);
    if (check.error) return res.status(check.status).json({ error: check.error });
  } else {
    const field = await prisma.field.findUnique({ where: { id: req.params.id } });
    if (!field) return res.status(404).json({ error: 'Field not found' });
  }

  const log = await prisma.fieldLog.create({
    data: { fieldId: req.params.id, agentId: req.user.id, note },
    include: { agent: { select: { id: true, name: true, email: true } } },
  });

  res.status(201).json({ log });
}

async function assignField(req, res) {
  const { agentId } = assignSchema.parse(req.body);

  if (agentId) {
    const agent = await prisma.user.findUnique({ where: { id: agentId } });
    if (!agent || agent.role !== 'AGENT') {
      return res.status(400).json({ error: 'agentId must reference an AGENT user' });
    }
  }

  const field = await prisma.field.update({
    where: { id: req.params.id },
    data: { assignedAgentId: agentId },
    include: { assignedAgent: { select: { id: true, name: true, email: true } } },
  });

  res.json({ field: withStatus(field) });
}

async function deleteField(req, res) {
  await prisma.field.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}

module.exports = {
  listFields,
  getField,
  createField,
  updateStage,
  addNote,
  assignField,
  deleteField,
};
