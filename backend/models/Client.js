const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    preferredName: { type: String, trim: true },
    dateOfBirth: { type: String }, // Changed to String to match frontend input
    placeOfBirth: String,
    nationality: String,
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'] // PascalCase to match frontend
    },
    ssn: String, // Should be encrypted in production
    gender: String,
    occupation: String,
    employer: String,
    annualIncome: Number,
  },

  // Contact Information
  contactInfo: {
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    alternatePhone: String,
    currentAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      residencyDuration: String,
      isMailingAddress: { type: Boolean, default: false }
    },
    mailingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    previousAddresses: [{
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      fromDate: String, // Changed to String
      toDate: String // Changed to String
    }],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
      address: String
    }
  },
  
  // Legal Case Information
  caseInfo: {
    caseType: {
      type: String,
      enum: ['Immigration', 'Criminal', 'Civil', 'Family', 'Business', 'Other']
    },
    subCaseType: String,
    urgency: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
    },
    description: { type: String },
    detailedDescription: String,
    desiredOutcome: String,
    status: String,
    priority: String,
    assignedLawyer: String,
    referralSource: String,
    
    // Legal History
    previousLegalIssues: [{
      caseType: String,
      description: String,
      outcome: String,
      date: String,
      attorney: String,
      court: String
    }],
    
    // Current Legal Status
    currentLegalProceedings: [{
      caseNumber: String,
      court: String,
      description: String,
      status: String,
      nextHearing: String
    }],
    
    // Important Dates
    importantDates: [{
      title: String,
      date: String,
      type: String,
      notes: String,
    }]
  },
  
  // Immigration Specific Information
  immigrationInfo: {
    currentStatus: String,
    visaType: String,
    visaExpiryDate: String,
    i94Number: String,
    arrivalDate: String,
    portOfEntry: String,
    
    // Family Information
    spouse: {
      name: String,
      citizenship: String,
      immigrationStatus: String,
      dateOfBirth: String,
      marriageDate: String,
      marriageLocation: String
    },
    children: [{
      name: String,
      dateOfBirth: String,
      placeOfBirth: String,
      citizenship: String,
      immigrationStatus: String,
      relationship: String
    }],
    parents: [{
      name: String,
      dateOfBirth: String,
      placeOfBirth: String,
      citizenship: String,
      immigrationStatus: String,
      isDeceased: { type: Boolean, default: false }
    }],
    
    // Travel History
    travelHistory: [{
      country: String,
      purpose: String,
      departureDate: String,
      returnDate: String,
      duration: String
    }],
    
    // Immigration Timeline
    immigrationHistory: [{
      status: String,
      fromDate: String,
      toDate: String,
      notes: String
    }]
  },
  
  // Criminal History
  criminalHistory: {
    hasArrestHistory: { type: Boolean, default: false },
    arrests: [{
      date: String,
      charges: String,
      location: String,
      outcome: String,
      details: String
    }],
    hasConvictions: { type: Boolean },
    convictions: [{
      date: String,
      charge: String,
      sentence: String,
      location: String,
      completed: { type: Boolean, default: false }
    }],
    hasPendingCharges: { type: Boolean },
    pendingCharges: [{
      charge: String,
      court: String,
      nextHearing: String,
      attorney: String
    }]
  },
  
  // Financial Information
  financialInfo: {
    annualIncome: Number,
    employmentStatus: String,
    employer: String,
    jobTitle: String,
    employmentDuration: String,
    
    // Assets
    assets: [{
      type: String,
      value: Number,
      description: String
    }],
    
    // Liabilities
    liabilities: [{
      type: String,
      amount: Number,
      creditor: String,
      monthlyPayment: Number
    }],
    
    // Banking Information
    bankingInfo: {
      bankName: String,
      accountType: String,
      routingNumber: String,
      accountNumber: String // Should be encrypted in production
    }
  },
  
  // Documents
  documents: [{
    name: String,
    url: String,
    cloudinaryId: String,
    type: String,
    category: String,
    uploadDate: String,
    expiryDate: String,
    isVerified: { type: Boolean, default: false },
    notes: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Communication Preferences
  communicationPreferences: {
    preferredMethod: {
      type: String,
      enum: ['Email', 'Phone', 'Text', 'Mail'],
    },
    languagePreference: String,
    needsInterpreter: { type: Boolean, default: false },
    interpreterLanguage: String,
    bestTimeToCall: String,
    timeZone: String,
    communicationNotes: String
  },
  
  // Consent and Agreements
  consents: {
    attorneyClientAgreement: {
      signed: { type: Boolean, default: false },
      signedDate: String,
      signedBy: String
    },
    privacyPolicy: {
      accepted: { type: Boolean, default: false },
      acceptedDate: String
    },
    backgroundCheck: {
      authorized: { type: Boolean, default: false },
      authorizedDate: String
    },
    documentSharing: {
      authorized: { type: Boolean, default: false },
      authorizedDate: String
    }
  },
  
  // Medical Information
  medicalInfo: {
    hasDisabilities: { type: Boolean, default: false },
    disabilities: [{
      type: String,
      description: String,
      accommodationsNeeded: String
    }],
    mentalHealthHistory: {
      hasHistory: { type: Boolean, default: false },
      details: String,
      currentTreatment: { type: Boolean, default: false }
    }
  },
  
  // AI Processing Data
  aiExtractedData: {
    extractedFields: mongoose.Schema.Types.Mixed,
    confidenceScores: mongoose.Schema.Types.Mixed,
    processingDate: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isVerified: { type: Boolean, default: false }
  },
  
  // Internal Notes
  internalNotes: [{
    note: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now },
    isConfidential: { type: Boolean, default: false },
    category: String
  }],
  
  // Billing Information
  billingInfo: {
    hourlyRate: Number,
    retainerAmount: Number,
    paymentMethod: String,
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    invoices: [{
      invoiceNumber: String,
      amount: Number,
      date: String,
      status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue'],
      },
      description: String
    }]
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastContactDate: Date,
  nextFollowUpDate: Date,
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Update the updatedAt field before saving
clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better search performance
clientSchema.index({ 'personalInfo.email': 1 });
clientSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
clientSchema.index({ 'caseInfo.status': 1 });
clientSchema.index({ 'caseInfo.caseType': 1 });
clientSchema.index({ 'caseInfo.assignedLawyer': 1 });
clientSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Client', clientSchema);