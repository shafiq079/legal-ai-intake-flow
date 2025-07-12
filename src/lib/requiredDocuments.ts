export const requiredDocuments = {
  Immigration: [
    { name: "Passport", description: "Primary identification document" },
    { name: "Visa (if applicable)", description: "Current visa or entry stamp" },
    { name: "Birth Certificate", description: "Proof of birth" },
    { name: "Marriage Certificate (if applicable)", description: "Proof of marital status" },
    { name: "Previous Immigration Applications", description: "Copies of past applications/petitions" },
  ],
  Criminal: [
    { name: "Police Report", description: "Official police report of the incident" },
    { name: "Arrest Warrant (if applicable)", description: "Copy of any arrest warrants" },
    { name: "Court Summons/Notices", description: "Any official court documents received" },
    { name: "Previous Conviction Records", description: "Records of past criminal history" },
  ],
  Family: [
    { name: "Marriage Certificate", description: "Proof of marriage" },
    { name: "Children's Birth Certificates", description: "For all minor children involved" },
    { name: "Divorce Decree (if applicable)", description: "Previous divorce judgments" },
    { name: "Financial Statements", description: "Bank statements, pay stubs, tax returns" },
  ],
  Civil: [
    { name: "Contract/Agreement", description: "Any relevant contracts or agreements" },
    { name: "Correspondence (Emails, Letters)", description: "Communications related to the dispute" },
    { name: "Demand Letter (if applicable)", description: "Any formal demand letters sent or received" },
    { name: "Evidence of Damages", description: "Photos, receipts, medical bills, etc." },
  ],
  Business: [
    { name: "Business Formation Documents", description: "Articles of Incorporation, LLC Agreement, etc." },
    { name: "Operating Agreements/Bylaws", description: "Internal governance documents" },
    { name: "Relevant Contracts", description: "Client, vendor, or partnership agreements" },
    { name: "Financial Records", description: "Balance sheets, income statements, tax returns" },
  ],
  Other: [
    { name: "Identification Document", description: "Any valid government-issued ID" },
    { name: "Relevant Correspondence", description: "Emails, letters, or other communications" },
    { name: "Any Supporting Documents", description: "Documents you believe are relevant to your case" },
  ],
};

export type IntakeDocumentType = keyof typeof requiredDocuments;

export interface RequiredDocument {
  name: string;
  description: string;
}
