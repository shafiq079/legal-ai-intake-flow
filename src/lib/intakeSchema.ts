import { z } from 'zod';

export const intakeSchema = z.object({
  // Personal Information
  personalInfo: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    middleName: z.string().optional(),
    preferredName: z.string().optional(),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    placeOfBirth: z.string().optional(),
    nationality: z.string().optional(),
    maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed", "Separated"]).optional(),
    ssn: z.string().optional(), // Consider encryption for sensitive data
    gender: z.string().optional(),
    occupation: z.string().optional(),
    employer: z.string().optional(),
    annualIncome: z.number().optional(),
  }),

  // Contact Information
  contactInfo: z.object({
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    phone: z.string().min(1, "Phone number is required"),
    alternatePhone: z.string().optional(),
    currentAddress: z.object({
      street: z.string().min(1, "Street is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zipCode: z.string().min(1, "Zip Code is required"),
      country: z.string().min(1, "Country is required"),
      residencyDuration: z.string().optional(),
      isMailingAddress: z.boolean().optional(),
    }),
    mailingAddress: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    previousAddresses: z.array(z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    })).optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
    }).optional(),
  }),

  // Legal Case Information
  caseInfo: z.object({
    caseType: z.string().min(1, "Case type is required"),
    subCaseType: z.string().optional(),
    urgency: z.enum(["High", "Medium", "Low"]).optional(),
    description: z.string().min(1, "Case description is required"),
    detailedDescription: z.string().optional(),
    desiredOutcome: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    assignedLawyer: z.string().optional(),
    referralSource: z.string().optional(),
    previousLegalIssues: z.array(z.object({
      caseType: z.string().optional(),
      description: z.string().optional(),
      outcome: z.string().optional(),
      date: z.string().optional(),
      attorney: z.string().optional(),
      court: z.string().optional(),
    })).optional(),
    currentLegalProceedings: z.array(z.object({
      caseNumber: z.string().optional(),
      court: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      nextHearing: z.string().optional(),
    })).optional(),
    importantDates: z.array(z.object({
      title: z.string().optional(),
      date: z.string().optional(),
      type: z.string().optional(),
      notes: z.string().optional(),
    })).optional(),
  }),

  // Conditional: Immigration Specific
  immigrationInfo: z.object({
    currentStatus: z.string().optional(),
    visaType: z.string().optional(),
    visaExpiryDate: z.string().optional(),
    i94Number: z.string().optional(),
    arrivalDate: z.string().optional(),
    portOfEntry: z.string().optional(),
    spouse: z.object({
      name: z.string().optional(),
      citizenship: z.string().optional(),
      immigrationStatus: z.string().optional(),
      dateOfBirth: z.string().optional(),
      marriageDate: z.string().optional(),
      marriageLocation: z.string().optional(),
    }).optional(),
    children: z.array(z.object({
      name: z.string().optional(),
      dateOfBirth: z.string().optional(),
      placeOfBirth: z.string().optional(),
      citizenship: z.string().optional(),
      immigrationStatus: z.string().optional(),
      relationship: z.string().optional(),
    })).optional(),
    parents: z.array(z.object({
      name: z.string().optional(),
      dateOfBirth: z.string().optional(),
      placeOfBirth: z.string().optional(),
      citizenship: z.string().optional(),
      immigrationStatus: z.string().optional(),
      isDeceased: z.boolean().optional(),
    })).optional(),
    travelHistory: z.array(z.object({
      country: z.string().optional(),
      purpose: z.string().optional(),
      departureDate: z.string().optional(),
      returnDate: z.string().optional(),
      duration: z.string().optional(),
    })).optional(),
    immigrationHistory: z.array(z.object({
      status: z.string().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      notes: z.string().optional(),
    })).optional(),
  }).optional(),

  // Conditional: Criminal History
  criminalHistory: z.object({
    hasArrestHistory: z.boolean().optional(),
    arrests: z.array(z.object({
      date: z.string().optional(),
      charges: z.string().optional(),
      location: z.string().optional(),
      outcome: z.string().optional(),
      details: z.string().optional(),
    })).optional(),
    hasConvictions: z.boolean().optional(),
    convictions: z.array(z.object({
      date: z.string().optional(),
      charge: z.string().optional(),
      sentence: z.string().optional(),
      location: z.string().optional(),
      completed: z.boolean().optional(),
    })).optional(),
    hasPendingCharges: z.boolean().optional(),
    pendingCharges: z.array(z.object({
      charge: z.string().optional(),
      court: z.string().optional(),
      nextHearing: z.string().optional(),
      attorney: z.string().optional(),
    })).optional(),
  }).optional(),

  // Conditional: Financial Information
  financialInfo: z.object({
    annualIncome: z.number().optional(),
    employmentStatus: z.string().optional(),
    employer: z.string().optional(),
    jobTitle: z.string().optional(),
    employmentDuration: z.string().optional(),
    assets: z.array(z.object({
      type: z.string().optional(),
      value: z.number().optional(),
      description: z.string().optional(),
    })).optional(),
    liabilities: z.array(z.object({
      type: z.string().optional(),
      amount: z.number().optional(),
      creditor: z.string().optional(),
      monthlyPayment: z.number().optional(),
    })).optional(),
    bankingInfo: z.object({
      bankName: z.string().optional(),
      accountType: z.string().optional(),
      routingNumber: z.string().optional(),
      accountNumber: z.string().optional(), // encrypted
    }).optional(),
  }).optional(),

  // Documents (simplified for schema, actual handling will be in components)
  documents: z.array(z.object({
    name: z.string().optional(),
    url: z.string().optional(),
    type: z.string().optional(),
    category: z.string().optional(),
    uploadDate: z.string().optional(),
    expiryDate: z.string().optional(),
    isVerified: z.boolean().optional(),
    notes: z.string().optional(),
  })).optional(),

  // Medical Information
  medicalInfo: z.object({
    hasDisabilities: z.boolean().optional(),
    disabilities: z.array(z.object({
      type: z.string().optional(),
      description: z.string().optional(),
      accommodationsNeeded: z.string().optional(),
    })).optional(),
    mentalHealthHistory: z.object({
      hasHistory: z.boolean().optional(),
      details: z.string().optional(),
      currentTreatment: z.boolean().optional(),
    }).optional(),
  }).optional(),

  // Communication Preferences
  communicationPreferences: z.object({
    preferredMethod: z.enum(["Email", "Phone", "Text", "Mail"]).optional(),
    languagePreference: z.string().optional(),
    needsInterpreter: z.boolean().optional(),
    interpreterLanguage: z.string().optional(),
    bestTimeToCall: z.string().optional(),
    timeZone: z.string().optional(),
    communicationNotes: z.string().optional(),
  }).optional(),

  // Consent and Agreements
  consents: z.object({
    attorneyClientAgreement: z.object({
      signed: z.boolean().refine(val => val === true, {
        message: "You must agree to the Attorney-Client Agreement",
      }),
      signedDate: z.string().optional(),
      signedBy: z.string().optional(),
    }),
    privacyPolicy: z.object({
      accepted: z.boolean().refine(val => val === true, {
        message: "You must accept the Privacy Policy",
      }),
      acceptedDate: z.string().optional(),
    }),
    backgroundCheck: z.object({
      authorized: z.boolean().refine(val => val === true, {
        message: "You must authorize a background check",
      }),
      authorizedDate: z.string().optional(),
    }),
    documentSharing: z.object({
      authorized: z.boolean().refine(val => val === true, {
        message: "You must authorize document sharing",
      }),
      authorizedDate: z.string().optional(),
    }),
  }).refine(data => {
    return (
      data.attorneyClientAgreement.signed &&
      data.privacyPolicy.accepted &&
      data.backgroundCheck.authorized &&
      data.documentSharing.authorized
    );
  }, {
    message: "All consents must be checked to proceed.",
    path: ["consents"], // This path will show the error at the consents level
  }),
});

export type IntakeFormValues = z.infer<typeof intakeSchema>;
