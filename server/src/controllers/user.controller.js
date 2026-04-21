const prisma = require('../config/db');

async function listUsers(req, res) {
  const role = req.query.role;
  const where = role === 'AGENT' || role === 'ADMIN' ? { role } : {};
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { fields: true } },
    },
  });
  res.json({ users });
}

module.exports = { listUsers };
