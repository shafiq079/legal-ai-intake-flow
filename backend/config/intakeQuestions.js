const intakeQuestions = {
  Immigration: [
    { question: "What is your first name?", field: "personalInfo.firstName" },
    { question: "What is your last name?", field: "personalInfo.lastName" },
    { question: "What is your date of birth?", field: "personalInfo.dateOfBirth" },
    { question: "What is your current immigration status?", field: "immigrationInfo.currentStatus" },
    { question: "What type of visa do you currently hold, if any?", field: "immigrationInfo.visaType" },
    { question: "What is your visa expiry date?", field: "immigrationInfo.visaExpiryDate" },
    { question: "What is your I-94 number?", field: "immigrationInfo.i94Number" },
    { question: "When did you arrive in the US?", field: "immigrationInfo.arrivalDate" },
    { question: "What was your port of entry?", field: "immigrationInfo.portOfEntry" },
    { question: "Can you describe the immigration issue you are facing?", field: "caseInfo.description" },
    { question: "Are you seeking a specific type of immigration benefit, such as a green card or visa?", field: "caseInfo.desiredOutcome" },
    { question: "Do you have a spouse involved in this immigration matter? If so, what is their name, citizenship, and immigration status?", field: "immigrationInfo.spouse" },
    { question: "Do you have any children involved in this immigration matter? If so, please provide their names, dates of birth, and immigration status.", field: "immigrationInfo.children" },
    { question: "Have you had any previous interactions with immigration authorities or applied for any immigration benefits before? Please describe.", field: "immigrationInfo.immigrationHistory" },
    { question: "Can you provide your current street address, city, state, zip code, and country?", field: "contactInfo.currentAddress" },
    { question: "What is your email address?", field: "contactInfo.email" },
    { question: "What is your phone number?", field: "contactInfo.phone" },
  ],
  Criminal: [
    { question: "What is your first name?", field: "personalInfo.firstName" },
    { question: "What is your last name?", field: "personalInfo.lastName" },
    { question: "What is your date of birth?", field: "personalInfo.dateOfBirth" },
    { question: "What are the charges you are facing?", field: "criminalHistory.arrests" },
    { question: "When and where did the incident occur?", field: "caseInfo.incidentDetails" },
    { question: "Have you been arrested before? If so, please describe the date, charges, location, and outcome.", field: "criminalHistory.arrests" },
    { question: "Have you been convicted of any crimes in the past? If so, please describe the date, charge, sentence, and location.", field: "criminalHistory.convictions" },
    { question: "Do you have any pending charges? If so, please describe the charge, court, next hearing date, and attorney.", field: "criminalHistory.pendingCharges" },
    { question: "Do you have an attorney currently representing you for this matter?", field: "caseInfo.assignedLawyer" },
    { question: "Are there any pending court dates or legal proceedings related to this matter?", field: "caseInfo.currentLegalProceedings" },
    { question: "Can you provide a brief description of what happened?", field: "caseInfo.description" },
    { question: "What is your email address?", field: "contactInfo.email" },
    { question: "What is your phone number?", field: "contactInfo.phone" },
  ],
  Family: [
    { question: "What is your first name?", field: "personalInfo.firstName" },
    { question: "What is your last name?", field: "personalInfo.lastName" },
    { question: "What is your date of birth?", field: "personalInfo.dateOfBirth" },
    { question: "What type of family law matter are you dealing with (e.g., divorce, child custody, adoption)?", field: "caseInfo.caseType" },
    { question: "Are there any children involved in this matter? If so, please provide their names, dates of birth, and relationship to you.", field: "immigrationInfo.children" }, // Reusing children field from immigrationInfo for now
    { question: "Are you currently married or in a civil partnership?", field: "personalInfo.maritalStatus" },
    { question: "Can you describe the current situation and what outcome you are hoping for?", field: "caseInfo.description" },
    { question: "Have there been any previous court orders or agreements related to this family matter?", field: "caseInfo.previousLegalIssues" },
    { question: "What is your email address?", field: "contactInfo.email" },
    { question: "What is your phone number?", field: "contactInfo.phone" },
  ],
  Civil: [
    { question: "What is your first name?", field: "personalInfo.firstName" },
    { question: "What is your last name?", field: "personalInfo.lastName" },
    { question: "What is your date of birth?", field: "personalInfo.dateOfBirth" },
    { question: "What is the nature of the civil dispute (e.g., contract dispute, personal injury, property dispute)?", field: "caseInfo.caseType" },
    { question: "Who are the other parties involved in this dispute?", field: "caseInfo.otherParties" }, // This field is not directly in Intake model, needs AI to parse and put into description or a new array
    { question: "When did the events leading to this dispute occur?", field: "caseInfo.importantDates" }, // AI needs to parse date from this
    { question: "What is your desired outcome for this case?", field: "caseInfo.desiredOutcome" },
    { question: "Do you have any documents or evidence related to this dispute?", field: "documents" }, // AI needs to prompt for upload or note it
    { question: "What is your email address?", field: "contactInfo.email" },
    { question: "What is your phone number?", field: "contactInfo.phone" },
  ],
  Business: [
    { question: "What is your full name or the name of your business?", field: "personalInfo.fullName" }, // AI needs to parse if it's a person or business name
    { question: "What type of business entity is this (e.g., LLC, Corporation, Sole Proprietorship)?", field: "financialInfo.employmentStatus" }, // Reusing employmentStatus for business entity type
    { question: "What is the nature of the legal issue your business is facing (e.g., contract, intellectual property, litigation)?", field: "caseInfo.caseType" },
    { question: "Can you describe the background of the issue and what you hope to achieve?", field: "caseInfo.description" },
    { question: "Are there any specific contracts, agreements, or documents relevant to this matter?", field: "documents" }, // AI needs to prompt for upload or note it
    { question: "What is your email address?", field: "contactInfo.email" },
    { question: "What is your phone number?", field: "contactInfo.phone" },
  ],
  Other: [
    { question: "What is your first name?", field: "personalInfo.firstName" },
    { question: "What is your last name?", field: "personalInfo.lastName" },
    { question: "What is your date of birth?", field: "personalInfo.dateOfBirth" },
    { question: "Please describe the legal issue you are facing in as much detail as possible.", field: "caseInfo.description" },
    { question: "What outcome are you hoping to achieve?", field: "caseInfo.desiredOutcome" },
    { question: "What is the urgency of this matter (e.g., High, Medium, Low)?", field: "caseInfo.urgency" },
    { question: "What is your email address?", field: "contactInfo.email" },
    { question: "What is your phone number?", field: "contactInfo.phone" },
  ],
};

module.exports = intakeQuestions;