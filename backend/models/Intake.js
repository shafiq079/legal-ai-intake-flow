const mongoose = require('mongoose');

const intakeSchema = new mongoose.Schema({
  // Intake Link Information
  intakeType: {
    type: String,
    required: true,
    enum: ['Immigration', 'Criminal', 'Family', 'Civil', 'Business', 'Other'] // Define your intake types
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expirationDate: {
    type: Date,
    required: false // Can be optional if links don't expire
  },
  linkStatus: {
    type: String,
    enum: ['active', 'expired', 'submitted', 'disabled'],
    default: 'active'
  },
  // Session Information
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  
  // Intake Status
  status: {
    type: String,
    enum: ['started', 'in-progress', 'completed', 'abandoned', 'converted'],
    default: 'started'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Conversation Data
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'question', 'clarification', 'summary', 'data-extraction'],
      default: 'text'
    },
    metadata: {
      confidenceScore: Number,
      extractedData: mongoose.Schema.Types.Mixed,
      questionCategory: String,
      followUpRequired: Boolean
    }
  }],
  
  // AI Extracted Data
  extractedData: {
    personalInfo: {
      firstName: String,
      lastName: String,
      middleName: String,
      preferredName: String,
      dateOfBirth: String,
      placeOfBirth: String,
      nationality: String,
      maritalStatus: String,
      ssn: String,
      gender: String,
      occupation: String,
      employer: String,
      annualIncome: Number,
    },
    contactInfo: {
      email: String,
      phone: String,
      alternatePhone: String,
      currentAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        residencyDuration: String,
        isMailingAddress: Boolean,
      },
      mailingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      previousAddresses: [{
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        fromDate: String,
        toDate: String,
      }],
      emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
        email: String,
        address: String,
      },
    },
    caseInfo: {
      caseType: String,
      subCaseType: String,
      urgency: String,
      description: String,
      detailedDescription: String,
      desiredOutcome: String,
      status: String,
      priority: String,
      assignedLawyer: String,
      referralSource: String,
      previousLegalIssues: [{
        caseType: String,
        description: String,
        outcome: String,
        date: String,
        attorney: String,
        court: String,
      }],
      currentLegalProceedings: [{
        caseNumber: String,
        court: String,
        description: String,
        status: String,
        nextHearing: String,
      }],
      importantDates: [{
        title: String,
        date: String,
        type: String,
        notes: String,
      }],
    },
    immigrationInfo: {
      currentStatus: String,
      visaType: String,
      visaExpiryDate: String,
      i94Number: String,
      arrivalDate: String,
      portOfEntry: String,
      spouse: {
        name: String,
        citizenship: String,
        immigrationStatus: String,
        dateOfBirth: String,
        marriageDate: String,
        marriageLocation: String,
      },
      children: [{
        name: String,
        dateOfBirth: String,
        placeOfBirth: String,
        citizenship: String,
        immigrationStatus: String,
        relationship: String,
      }],
      parents: [{
        name: String,
        dateOfBirth: String,
        placeOfBirth: String,
        citizenship: String,
        immigrationStatus: String,
        isDeceased: Boolean,
      }],
      travelHistory: [{
        country: String,
        purpose: String,
        departureDate: String,
        returnDate: String,
        duration: String,
      }],
      immigrationHistory: [{
        status: String,
        fromDate: String,
        toDate: String,
        notes: String,
      }],
    },
    criminalHistory: {
      hasArrestHistory: Boolean,
      arrests: [{
        date: String,
        charges: String,
        location: String,
        outcome: String,
        details: String,
      }],
      hasConvictions: Boolean,
      convictions: [{
        date: String,
        charge: String,
        sentence: String,
        location: String,
        completed: Boolean,
      }],
      hasPendingCharges: Boolean,
      pendingCharges: [{
        charge: String,
        court: String,
        nextHearing: String,
        attorney: String,
      }],
    },
    financialInfo: {
      annualIncome: Number,
      employmentStatus: String,
      employer: String,
      jobTitle: String,
      employmentDuration: String,
      assets: [{
        type: String,
        value: Number,
        description: String,
      }],
      liabilities: [{
        type: String,
        amount: Number,
        creditor: String,
        monthlyPayment: Number,
      }],
      bankingInfo: {
        bankName: String,
        accountType: String,
        routingNumber: String,
        accountNumber: String,
      },
    },
    medicalInfo: {
      hasDisabilities: Boolean,
      disabilities: [{
        type: String,
        description: String,
        accommodationsNeeded: String,
      }],
      mentalHealthHistory: {
        hasHistory: Boolean,
        details: String,
        currentTreatment: Boolean,
      },
    },
    communicationPreferences: {
      preferredMethod: String,
      languagePreference: String,
      needsInterpreter: Boolean,
      interpreterLanguage: String,
      bestTimeToCall: String,
      timeZone: String,
      communicationNotes: String,
    },
    consents: {
      attorneyClientAgreement: {
        signed: Boolean,
        signedDate: String,
        signedBy: String,
      },
      privacyPolicy: {
        accepted: Boolean,
        acceptedDate: String,
      },
      backgroundCheck: {
        authorized: Boolean,
        authorizedDate: String,
      },
      documentSharing: {
        authorized: Boolean,
        authorizedDate: String,
      },
    },
  },
  // Documents uploaded during intake
  documents: [{
    name: { type: String, required: true },
    url: { type: String },
    type: { type: String },
    category: { type: String },
    uploadDate: { type: Date, default: Date.now },
  }],
  
  // AI Processing Metadata
  aiProcessing: {
    totalTokensUsed: Number,
    processingCost: Number,
    averageConfidenceScore: Number,
    lastProcessedAt: Date,
    
    // Field Confidence Scores
    confidenceScores: {
      personalInfo: Number,
      caseInfo: Number,
      immigrationInfo: Number,
      criminalHistory: Number,
      financialInfo: Number,
      overall: Number
    },
    
    // AI Flags and Alerts
    flags: [{
      type: {
        type: String,
        enum: ['incomplete-data', 'inconsistent-info', 'high-risk', 'requires-review']
      },
      message: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Missing Information
    missingFields: [{
      field: String,
      category: String,
      importance: {
        type: String,
        enum: ['required', 'recommended', 'optional']
      }
    }]
  },
  
  // Session Metadata
  sessionInfo: {
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    duration: Number, // in minutes
    totalMessages: {
      type: Number,
      default: 0
    },
    userAgent: String,
    ipAddress: String,
    referralSource: String,
    
    // Device Information
    deviceInfo: {
      isMobile: Boolean,
      browser: String,
      os: String,
      screenResolution: String
    }
  },
  
  // Quality Metrics
  qualityMetrics: {
    conversationFlow: Number, // 1-10 rating
    dataCompleteness: Number, // percentage
    userEngagement: Number, // based on message frequency/length
    satisfactionScore: Number, // if user provides feedback
    
    // Conversation Analysis
    conversationAnalysis: {
      averageResponseTime: Number, // seconds
      totalQuestions: Number,
      questionsAnswered: Number,
      clarificationsNeeded: Number,
      repeatedQuestions: Number
    }
  },
  
  // Follow-up Information
  followUp: {
    isRequired: {
      type: Boolean,
      default: false
    },
    reason: String,
    scheduledDate: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  
  // Conversion Tracking
  conversion: {
    isConverted: {
      type: Boolean,
      default: false
    },
    convertedDate: Date,
    convertedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    clientCreated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    caseCreated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case'
    }
  },
  
  // Review and Verification
  review: {
    isReviewed: {
      type: Boolean,
      default: false
    },
    reviewedDate: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewNotes: String,
    dataAccuracy: Number, // percentage
    requiresCorrections: Boolean,
    corrections: [String]
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
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update the updatedAt field and message count before saving
intakeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.sessionInfo.totalMessages = this.messages.length;
  
  // Calculate completion percentage based on extracted data
  let completedFields = 0;
  let totalFields = 0;
  
  // Count completed fields in extracted data
  const checkFields = (obj, path = '') => {
    for (const key in obj) {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          checkFields(obj[key], `${path}.${key}`);
        } else {
          completedFields++;
        }
      }
      totalFields++;
    }
  };
  
  if (this.extractedData) {
    checkFields(this.extractedData);
    this.completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }
  
  next();
});

// Create indexes for better performance
intakeSchema.index({ sessionId: 1 });
intakeSchema.index({ clientId: 1 });
intakeSchema.index({ status: 1 });
intakeSchema.index({ createdAt: -1 });
intakeSchema.index({ 'conversion.isConverted': 1 });
intakeSchema.index({ 'review.isReviewed': 1 });

module.exports = mongoose.model('Intake', intakeSchema);