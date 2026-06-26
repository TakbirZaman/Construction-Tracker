export const logger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 500 ? '\x1b[31m'
      : res.statusCode >= 400 ? '\x1b[33m'
      : res.statusCode >= 300 ? '\x1b[36m'
      : '\x1b[32m';
    console.log(`${color}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms\x1b[0m`);
  });
  next();
};

export const errorHandler = (err, req, res, next) => {
  console.error('\x1b[31m[ERROR]\x1b[0m', err.message);
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry - record already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist' });
  }
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Value violates check constraint' });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};

export const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
};
