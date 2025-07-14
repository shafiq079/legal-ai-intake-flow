const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String },
  type: { type: String, enum: ['Meeting', 'Court', 'Deadline', 'Other'], default: 'Other' },
  date: { type: Date, required: true },
  location: { type: String }, // Added location field
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' }, // Optional reference to a Case
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }, // Optional reference to a Client
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', eventSchema);
