// 404 for any route that didn't match.
export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// Central error handler. asyncHandler forwards rejected promises here.
// Client errors (4xx) carry an `err.status`; anything else is a 500 and logged.
export function errorHandler(err, req, res, next) {
  // Malformed ObjectId or schema validation → client error, not a 500.
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'invalid id' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || 'Internal server error' });
}
