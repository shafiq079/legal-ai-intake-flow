const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Ready', 'Completed'], default: 'Draft' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }, // Reference to Client model
  content: { type: String }, // Actual form content (e.g., JSON, HTML, or a path to a file)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Form', formSchema);
