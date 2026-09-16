// Runs when a request doesn't match any route we've defined. Must be
// registered AFTER all real routes in app.js.
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFound;
