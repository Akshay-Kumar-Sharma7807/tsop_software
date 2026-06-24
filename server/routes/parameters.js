const express = require('express');
const router  = express.Router();
const Parameter = require('../models/Parameter');

// GET /api/parameters — list all (optionally filter enabled only)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.enabled === 'true' ? { enabled: true } : {};
    const params = await Parameter.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(params);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/parameters — create new parameter
router.post('/', async (req, res) => {
  try {
    // Auto-assign next order number
    const last = await Parameter.findOne().sort({ order: -1 });
    req.body.order = last ? last.order + 1 : 0;
    const param = await Parameter.create(req.body);
    res.status(201).json(param);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/parameters/reorder — bulk update order indices
router.put('/reorder', async (req, res) => {
  try {
    // body: [{ _id, order }]
    const ops = (req.body || []).map(({ _id, order }) =>
      Parameter.findByIdAndUpdate(_id, { order })
    );
    await Promise.all(ops);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/parameters/:id — update parameter
router.put('/:id', async (req, res) => {
  try {
    const updated = await Parameter.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Parameter not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/parameters/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Parameter.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Parameter not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
