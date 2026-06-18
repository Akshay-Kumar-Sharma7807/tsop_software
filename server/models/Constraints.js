const mongoose = require('mongoose');

const constraintsSchema = new mongoose.Schema({
  // Used to enforce singleton — only one document ever
  singleton: { type: Boolean, default: true, unique: true },

  minCompletionPct: {
    value: { type: Number, default: 30 },
    enabled: { type: Boolean, default: true },
  },
  tmRequired: {
    enabled: { type: Boolean, default: true },
  },
  dmRequired: {
    enabled: { type: Boolean, default: true },
  },
  admRequired: {
    enabled: { type: Boolean, default: true },
  },
  minTotalMembers: {
    value: { type: Number, default: 5 },
    enabled: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model('Constraints', constraintsSchema);
