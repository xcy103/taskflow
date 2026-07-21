// Create an Error carrying an HTTP status, so controllers can `throw httpError(404, ...)`
// and asyncHandler forwards it to the central errorHandler with the right status.
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
