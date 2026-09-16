const express = require('express');
const router = express.Router();

const destinationRoutes = require('./destination.routes');

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

router.use('/destinations', destinationRoutes);


module.exports = router;
