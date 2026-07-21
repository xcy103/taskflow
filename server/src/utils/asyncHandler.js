// Wraps an async route handler so rejected promises reach Express's error
// middleware instead of hanging the request. (Express 4 doesn't catch these itself.)
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
