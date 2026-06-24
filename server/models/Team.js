const mongoose = require('mongoose');

// Each meeting stores parameter values as { parameterId, value }
const paramValueSchema = new mongoose.Schema({
  parameterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parameter', required: true },
  value: { type: mongoose.Schema.Types.Mixed, default: null },
}, { _id: false });

const meetingSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, default: '', trim: true },
  tm: { type: String, enum: ['yes', 'no', 'in progress'], default: 'no' },
  tmName: { type: String, default: '', trim: true },
  dm: { type: String, enum: ['yes', 'no', 'in progress'], default: 'no' },
  dmName: { type: String, default: '', trim: true },
  adm: { type: String, enum: ['yes', 'no', 'in progress'], default: 'no' },
  admName: { type: String, default: '', trim: true },
  tac: { type: String, enum: ['yes', 'no'], default: 'no' },
  tacName: { type: String, default: '', trim: true },
  members: { type: Number, default: 0 },
  totalMembers: { type: Number, default: 0 },
  memberNames: [{ type: String, trim: true }],
  totalMemberNames: [{ type: String, trim: true }],
  totalGoal: { type: Number, required: true },
  sessionsDone: { type: Number, default: 0 },
  centerFeedbackMeetings: { type: Number, default: 0 },
  // Global parameters filled during this meeting
  parameters: { type: [paramValueSchema], default: [] },
});

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    domain: { type: String, default: '', trim: true },
    meetings: [meetingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
