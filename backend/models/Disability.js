const mongoose = require('mongoose');

const disabilitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  accommodationsNeeded: {
    type: String,
    required: true,
  },
});

module.exports = disabilitySchema;
