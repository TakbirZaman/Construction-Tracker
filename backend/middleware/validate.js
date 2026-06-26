export const validateId = (req, res, next) => {
  const id = req.params.id || req.params.projectId;
  if (id && (!Number.isInteger(Number(id)) || Number(id) <= 0)) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }
  next();
};

export const validateProjectId = (req, res, next) => {
  const id = req.params.projectId;
  if (id && (!Number.isInteger(Number(id)) || Number(id) <= 0)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }
  next();
};
