const mongoose = require('mongoose');

const IntakeLinkSchema = new mongoose.Schema({
  linkId: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    // Example intake types, can be expanded
    enum: ['Immigration', 'Criminal', 'Family', 'Civil', 'Other'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired', 'abandoned'],
    default: 'pending',
  },
  draftData: {
    type: Object,
    default: {},
  },
  finalData: {
    type: Object,
    default: {},
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: false,
  },
}, { timestamps: true });

// Index for quick lookup by linkId and for expiration
IntakeLinkSchema.index({ linkId: 1 });
IntakeLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('IntakeLink', IntakeLinkSchema);
