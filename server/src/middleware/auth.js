const { verifyJWT } = require('../utils/jwt');
const prisma = require('../config/db');

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token || extractBearer(req);
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const payload = verifyJWT(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return res.status(401).json({ error: 'User no longer exists' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

function extractBearer(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

module.exports = { requireAuth, requireRole };
