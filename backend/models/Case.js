const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  caseNumber: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  caseType: {
    type: String,
    required: true,
    enum: ['immigration', 'criminal', 'civil', 'family', 'business', 'personal-injury', 'real-estate', 'other']
  },
  subCaseType: String,
  status: {
    type: String,
    enum: ['open', 'in-progress', 'under-review', 'completed', 'closed', 'on-hold'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedLawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTeam: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['lead', 'associate', 'paralegal', 'assistant']
    },
    assignedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Case Timeline and Deadlines
  deadlines: [{
    title: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['court-hearing', 'filing-deadline', 'meeting', 'follow-up', 'other'],
      default: 'other'
    },
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
      },
      interval: Number // e.g., every 2 weeks
    }
  }],
  
  // Case Activities and Notes
  activities: [{
    type: {
      type: String,
      enum: ['note', 'call', 'email', 'meeting', 'document', 'hearing', 'filing', 'other'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    date: {
      type: Date,
      default: Date.now
    },
    duration: Number, // in minutes
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isConfidential: {
      type: Boolean,
      default: false
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  }],
  
  // Financial Information
  billing: {
    hourlyRate: Number,
    retainerAmount: Number,
    totalBilled: {
      type: Number,
      default: 0
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    outstanding: {
      type: Number,
      default: 0
    },
    billingMethod: {
      type: String,
      enum: ['hourly', 'flat-fee', 'contingency', 'retainer'],
      default: 'hourly'
    }
  },
  
  // Time Tracking
  timeEntries: [{
    date: {
      type: Date,
      required: true
    },
    hours: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    billable: {
      type: Boolean,
      default: true
    },
    rate: Number,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Case Outcome
  outcome: {
    result: {
      type: String,
      enum: ['won', 'lost', 'settled', 'dismissed', 'pending']
    },
    description: String,
    date: Date,
    financialResult: Number,
    notes: String
  },
  
  // Court Information
  courtInfo: {
    courtName: String,
    courtAddress: String,
    judgeName: String,
    caseNumber: String,
    filingDate: Date,
    jurisdiction: String
  },
  
  // Related Cases
  relatedCases: [{
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case'
    },
    relationship: {
      type: String,
      enum: ['appeal', 'related', 'consolidated', 'precedent']
    },
    notes: String
  }],
  
  // Case Tags and Categories
  tags: [String],
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedDate: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Auto-generate case number
caseSchema.pre('save', async function(next) {
  if (this.isNew && !this.caseNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.caseNumber = `CASE-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
caseSchema.index({ clientId: 1 });
caseSchema.index({ assignedLawyer: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ caseType: 1 });
caseSchema.index({ priority: 1 });
caseSchema.index({ caseNumber: 1 });
caseSchema.index({ createdAt: -1 });
caseSchema.index({ 'deadlines.date': 1 });

module.exports = mongoose.model('Case', caseSchema);