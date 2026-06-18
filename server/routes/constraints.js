const express = require('express');
const router = express.Router();
const Constraints = require('../models/Constraints');

// GET /api/constraints
router.get('/', async (req, res) => {
  try {
    let constraints = await Constraints.findOne({ singleton: true });
    if (!constraints) {
      // Create default if none exists
      constraints = await Constraints.create({ singleton: true });
    }
    res.json(constraints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/constraints
router.put('/', async (req, res) => {
  try {
    const updated = await Constraints.findOneAndUpdate(
      { singleton: true },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
