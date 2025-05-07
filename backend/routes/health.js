const express = require('express');
const router = express.Router();

/**
 * Simple health check endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running properly' });
});

module.exports = router;
