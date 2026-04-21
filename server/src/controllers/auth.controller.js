const { z } = require('zod');
const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signJWT } = require('../utils/jwt');

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['ADMIN', 'AGENT']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hashed = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, password: hashed, role: data.role || 'AGENT' },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = signJWT({ sub: user.id, role: user.role });
  setAuthCookie(res, token);
  res.status(201).json({ user, token });
}

async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signJWT({ sub: user.id, role: user.role });
  setAuthCookie(res, token);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
}

async function logout(req, res) {
  res.clearCookie('token');
  res.json({ ok: true });
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, logout, me };
