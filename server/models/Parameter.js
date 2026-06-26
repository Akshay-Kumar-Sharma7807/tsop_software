const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  category: { type: String, default: 'General', trim: true },
  enabled:  { type: Boolean, default: true },
  required: { type: Boolean, default: false },
  order:    { type: Number, default: 0 },
  hint:     { type: String, default: '', trim: true },
  domains:  [{ type: String }],
  teams:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
}, { timestamps: true });

module.exports = mongoose.model('Parameter', parameterSchema);
