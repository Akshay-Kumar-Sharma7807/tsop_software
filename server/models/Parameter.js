const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  category: { type: String, default: 'General', trim: true },
  dataType: {
    type: String,
    enum: ['yesno', 'number', 'text', 'url'],
    default: 'text',
  },
  enabled:  { type: Boolean, default: true },
  required: { type: Boolean, default: false },
  order:    { type: Number, default: 0 },
  hint:     { type: String, default: '', trim: true },

  // yesno conditions
  yesIsGreen:     { type: Boolean, default: true },
  allowInProgress:{ type: Boolean, default: true },

  // number conditions (null = no threshold applied)
  redMax:    { type: Number, default: null },
  yellowMax: { type: Number, default: null },

  // text / url conditions
  filledIsGreen: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Parameter', parameterSchema);
