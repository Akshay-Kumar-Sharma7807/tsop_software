const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  date: { type: String, required: true },
  tm: { type: String, enum: ['yes', 'no', 'in progress'], default: 'no' },
  dm: { type: String, enum: ['yes', 'no', 'in progress'], default: 'no' },
  adm: { type: String, enum: ['yes', 'no', 'in progress'], default: 'no' },
  members: { type: Number, default: 0 },
  totalGoal: { type: Number, required: true },
  sessionsDone: { type: Number, default: 0 },
  newMembers: { type: Number, default: 0 },
  centerFeedbackMeetings: { type: Number, default: 0 },
});

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tac: { type: String, default: '', trim: true },
    domain: { type: String, default: '', trim: true },
    meetings: [meetingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
