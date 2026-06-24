const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// GET /api/teams — all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: 1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/teams/:id — single team
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/teams — create team
router.post('/', async (req, res) => {
  try {
    const team = new Team(req.body);
    const saved = await team.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/teams/:id — update team (name, tac, or full meetings array)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Team not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/teams/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Team.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Team not found' });
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/teams/:id/meetings — add a meeting to a team
router.post('/:id/meetings', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    team.meetings.push(req.body);
    const saved = await team.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('POST /api/teams/:id/meetings error:', err);
    require('fs').writeFileSync('debug_error.txt', err.message + '\n' + JSON.stringify(err.errors || {}));
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/teams/:id/meetings/:meetingId — update a specific meeting
router.put('/:id/meetings/:meetingId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const meeting = team.meetings.id(req.params.meetingId);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    
    // Safely update subdocument properties including arrays
    meeting.set(req.body);
    
    const saved = await team.save();
    res.json(saved);
  } catch (err) {
    console.error('Error in PUT meeting:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/teams/:id/meetings/:meetingId
router.delete('/:id/meetings/:meetingId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    team.meetings.pull(req.params.meetingId);
    const saved = await team.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
