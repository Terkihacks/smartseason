const prisma = require('../config/db');
const { computeStatus } = require('../utils/status');

async function getDashboard(req, res) {
  const isAdmin = req.user.role === 'ADMIN';
  const where = isAdmin ? {} : { assignedAgentId: req.user.id };

  const fields = await prisma.field.findMany({
    where,
    include: {
      assignedAgent: { select: { id: true, name: true } },
    },
  });

  const summary = {
    total: fields.length,
    active: 0,
    atRisk: 0,
    completed: 0,
    byStage: { PLANTED: 0, GROWING: 0, READY: 0, HARVESTED: 0 },
  };

  for (const f of fields) {
    const s = computeStatus(f);
    if (s === 'ACTIVE') summary.active++;
    else if (s === 'AT_RISK') summary.atRisk++;
    else if (s === 'COMPLETED') summary.completed++;
    summary.byStage[f.stage]++;
  }

  let fieldsPerAgent = [];
  if (isAdmin) {
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { fields: true } },
      },
      orderBy: { name: 'asc' },
    });
    fieldsPerAgent = agents.map((a) => ({
      agentId: a.id,
      name: a.name,
      email: a.email,
      count: a._count.fields,
    }));
  }

  const recentLogs = await prisma.fieldLog.findMany({
    where: isAdmin ? {} : { field: { assignedAgentId: req.user.id } },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      field: { select: { id: true, name: true } },
      agent: { select: { id: true, name: true } },
    },
  });

  res.json({ summary, fieldsPerAgent, recentLogs });
}

module.exports = { getDashboard };
