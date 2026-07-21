// 404 for any route that didn't match.
export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// Central error handler. asyncHandler forwards rejected promises here.
// Client errors (4xx) carry an `err.status`; anything else is a 500 and logged.
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || 'Internal server error' });
}
