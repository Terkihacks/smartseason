function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors?.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Unique constraint violated' });
  }

  console.error(err);
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

module.exports = { errorHandler, notFound };
