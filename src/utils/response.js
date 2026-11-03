class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    Object.assign(this, { status, code, details });
  }
}
function success(res, data, meta) {
  return res.json({ success: true, data, ...(meta ? { meta } : {}) });
}
module.exports = { AppError, success };
