const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: String,
  description: String,
  
  // File Information
  url: {
    type: String,
    required: true
  },
  cloudinaryId: String,
  mimeType: String,
  fileSize: Number, // in bytes
  
  // Document Classification
  type: {
    type: String,
    required: true,
    enum: [
      'passport', 'drivers-license', 'birth-certificate', 'marriage-certificate',
      'divorce-decree', 'social-security-card', 'tax-return', 'bank-statement',
      'pay-stub', 'employment-letter', 'lease-agreement', 'utility-bill',
      'insurance-policy', 'medical-record', 'court-document', 'contract',
      'legal-brief', 'affidavit', 'power-of-attorney', 'will', 'other'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['identity', 'immigration', 'financial', 'legal', 'medical', 'employment', 'housing', 'other']
  },
  
  // Associated Records
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  
  // AI Processing Results
  aiAnalysis: {
    isProcessed: {
      type: Boolean,
      default: false
    },
    processedDate: Date,
    extractedText: String,
    extractedData: mongoose.Schema.Types.Mixed,
    confidenceScores: {
      documentType: Number,
      dataExtraction: Number,
      overall: Number
    },
    detectedLanguage: String,
    ocrQuality: Number,
    flags: [{
      type: String,
      message: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }]
  },
  
  // Verification and Review
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationNotes: String,
    authenticity: {
      type: String,
      enum: ['authentic', 'questionable', 'fraudulent', 'unknown'],
      default: 'unknown'
    }
  },
  
  // Document Metadata
  expiryDate: Date,
  issueDate: Date,
  issuingAuthority: String,
  documentNumber: String,
  
  // Access Control
  isConfidential: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['public', 'internal', 'restricted', 'confidential'],
    default: 'internal'
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: String,
      enum: ['view', 'edit', 'download'],
      default: 'view'
    },
    sharedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  parentDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  versions: [{
    version: Number,
    url: String,
    cloudinaryId: String,
    uploadDate: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Document Notes and Comments
  notes: [{
    note: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],
  
  // Tags and Search
  tags: [String],
  keywords: [String], // Auto-generated from AI analysis
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'reviewed', 'approved', 'rejected'],
    default: 'uploaded'
  },
  
  // Upload Information
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploadSource: {
    type: String,
    enum: ['web-upload', 'email', 'mobile', 'scan', 'api'],
    default: 'web-upload'
  },
  
  // Legal Hold and Retention
  isOnLegalHold: {
    type: Boolean,
    default: false
  },
  legalHoldDate: Date,
  retentionDate: Date,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better search performance
documentSchema.index({ clientId: 1 });
documentSchema.index({ caseId: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ uploadDate: -1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ keywords: 1 });

// Text search index
documentSchema.index({
  name: 'text',
  description: 'text',
  'aiAnalysis.extractedText': 'text',
  tags: 'text',
  keywords: 'text'
});

module.exports = mongoose.model('Document', documentSchema);