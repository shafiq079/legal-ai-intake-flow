import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Intake {
  _id: string;
  intakeType: string;
  status: string;
  createdAt: string;
  extractedData: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
      middleName?: string;
      preferredName?: string;
      email?: string;
      phone?: string;
      alternatePhone?: string;
      dateOfBirth?: string;
      placeOfBirth?: string;
      nationality?: string;
      maritalStatus?: string;
      ssn?: string;
      gender?: string;
      occupation?: string;
      employer?: string;
      annualIncome?: number;
    };
    contactInfo?: {
      email?: string;
      phone?: string;
      alternatePhone?: string;
      currentAddress?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        residencyDuration?: string;
        isMailingAddress?: boolean;
      };
      mailingAddress?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      };
      previousAddresses?: Array<{
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        fromDate?: string;
        toDate?: string;
      }>;
      emergencyContact?: {
        name?: string;
        relationship?: string;
        phone?: string;
        email?: string;
        address?: string;
      };
    };
    caseInfo?: {
      caseType?: string;
      subCaseType?: string;
      urgency?: string;
      description?: string;
      detailedDescription?: string;
      desiredOutcome?: string;
      status?: string;
      priority?: string;
      assignedLawyer?: string;
      referralSource?: string;
      previousLegalIssues?: Array<{
        caseType?: string;
        description?: string;
        outcome?: string;
        date?: string;
        attorney?: string;
        court?: string;
      }>;
      currentLegalProceedings?: Array<{
        caseNumber?: string;
        court?: string;
        description?: string;
        status?: string;
        nextHearing?: string;
      }>;
      importantDates?: Array<{
        title?: string;
        date?: string;
        type?: string;
        notes?: string;
      }>;
    };
    immigrationInfo?: {
      currentStatus?: string;
      visaType?: string;
      visaExpiryDate?: string;
      i94Number?: string;
      arrivalDate?: string;
      portOfEntry?: string;
      spouse?: {
        name?: string;
        citizenship?: string;
        immigrationStatus?: string;
        dateOfBirth?: string;
        marriageDate?: string;
        marriageLocation?: string;
      };
      children?: Array<{
        name?: string;
        dateOfBirth?: string;
        placeOfBirth?: string;
        citizenship?: string;
        immigrationStatus?: string;
        relationship?: string;
      }>;
      parents?: Array<{
        name?: string;
        dateOfBirth?: string;
        placeOfBirth?: string;
        citizenship?: string;
        immigrationStatus?: string;
        isDeceased?: boolean;
      }>;
      travelHistory?: Array<{
        country?: string;
        purpose?: string;
        departureDate?: string;
        returnDate?: string;
        duration?: string;
      }>;
      immigrationHistory?: Array<{
        status?: string;
        fromDate?: string;
        toDate?: string;
        notes?: string;
      }>;
    };
    criminalHistory?: {
      hasArrestHistory?: boolean;
      arrests?: Array<{
        date?: string;
        charges?: string;
        location?: string;
        outcome?: string;
        details?: string;
      }>;
      hasConvictions?: boolean;
      convictions?: Array<{
        date?: string;
        charge?: string;
        sentence?: string;
        location?: string;
        completed?: boolean;
      }>;
      hasPendingCharges?: boolean;
      pendingCharges?: Array<{
        charge?: string;
        court?: string;
        nextHearing?: string;
        attorney?: string;
      }>;
    };
    financialInfo?: {
      annualIncome?: number;
      employmentStatus?: string;
      employer?: string;
      jobTitle?: string;
      employmentDuration?: string;
      assets?: Array<{
        type?: string;
        value?: number;
        description?: string;
      }>;
      liabilities?: Array<{
        type?: string;
        amount?: number;
        creditor?: string;
        monthlyPayment?: number;
      }>;
      bankingInfo?: {
        bankName?: string;
        accountType?: string;
        routingNumber?: string;
        accountNumber?: string;
      };
    };
    documents?: Array<{
      name?: string;
      url?: string;
      type?: string;
      category?: string;
      uploadDate?: string;
      expiryDate?: string;
      isVerified?: boolean;
      notes?: string;
    }>;
    medicalInfo?: {
      hasDisabilities?: boolean;
      disabilities?: Array<{
        type?: string;
        description?: string;
        accommodationsNeeded?: string;
      }>;
      mentalHealthHistory?: {
        hasHistory?: boolean;
        details?: string;
        currentTreatment?: boolean;
      };
    };
    communicationPreferences?: {
      preferredMethod?: string;
      languagePreference?: string;
      needsInterpreter?: boolean;
      interpreterLanguage?: string;
      bestTimeToCall?: string;
      timeZone?: string;
      communicationNotes?: string;
    };
    consents?: {
      attorneyClientAgreement?: {
        signed?: boolean;
        signedDate?: string;
        signedBy?: string;
      };
      privacyPolicy?: {
        accepted?: boolean;
        acceptedDate?: string;
      };
      backgroundCheck?: {
        authorized?: boolean;
        authorizedDate?: string;
      };
      documentSharing?: {
        authorized?: boolean;
        authorizedDate?: string;
      };
    };
  };
}

const fetchIntakeDetails = async (intakeId: string) => {
  const response = await axios.get(`/api/intake/single/${intakeId}`);
  if (!response.data) {
    throw new Error('Intake not found');
  }
  return response.data;
};

const renderField = (label: string, value: any) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value === 'boolean') {
    return (
      <p className="text-sm">
        <span className="font-medium">{label}:</span> {value ? 'Yes' : 'No'}
      </p>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return (
      <div className="text-sm">
        <span className="font-medium">{label}:</span>
        <ul className="list-disc list-inside ml-4">
          {value.map((item, index) => (
            <li key={index}>{JSON.stringify(item)}</li>
          ))}
        </ul>
      </div>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="text-sm">
        <span className="font-medium">{label}:</span>
        <div className="ml-4 space-y-1">
          {Object.entries(value).map(([key, val]) => renderField(key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()), val))}
        </div>
      </div>
    );
  }
  return (
    <p className="text-sm">
      <span className="font-medium">{label}:</span> {String(value)}
    </p>
  );
};

export default function IntakeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: intake, isLoading, isError, error } = useQuery<Intake>({
    queryKey: ['intakeDetails', id],
    queryFn: () => fetchIntakeDetails(id!),
    enabled: !!id,
  });

  const queryClient = useQueryClient();

  const convertToCaseMutation = useMutation({
    mutationFn: async (intakeId: string) => {
      const response = await axios.post(`/api/intake/${intakeId}/convert-to-case`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Intake converted to case successfully!");
      queryClient.invalidateQueries({ queryKey: ['intakeDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['allIntakes'] });
      navigate(`/cases/${data.caseId}`); // Navigate to the new case details page
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to convert intake to case.");
    },
  });

  const handleConvertToCase = () => {
    if (id) {
      convertToCaseMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading intake details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full text-red-500">
        <p className="text-lg">Error: {error?.message}</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <p className="text-lg text-muted-foreground">No intake data found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const { extractedData } = intake;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">
            Intake Details: {extractedData?.personalInfo?.firstName} {extractedData?.personalInfo?.lastName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Intake Type: {intake.intakeType} | Status: {intake.status} | Submitted: {new Date(intake.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Intakes
        </Button>
        <Button
          onClick={handleConvertToCase}
          disabled={convertToCaseMutation.isPending}
          className="ml-2"
        >
          {convertToCaseMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Convert to Case
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extractedData?.personalInfo && (
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField('First Name', extractedData.personalInfo.firstName)}
              {renderField('Last Name', extractedData.personalInfo.lastName)}
              {renderField('Middle Name', extractedData.personalInfo.middleName)}
              {renderField('Preferred Name', extractedData.personalInfo.preferredName)}
              {renderField('Email', extractedData.personalInfo.email)}
              {renderField('Phone', extractedData.personalInfo.phone)}
              {renderField('Alternate Phone', extractedData.personalInfo.alternatePhone)}
              {renderField('Date of Birth', extractedData.personalInfo.dateOfBirth)}
              {renderField('Place of Birth', extractedData.personalInfo.placeOfBirth)}
              {renderField('Nationality', extractedData.personalInfo.nationality)}
              {renderField('Marital Status', extractedData.personalInfo.maritalStatus)}
              {renderField('SSN', extractedData.personalInfo.ssn)}
              {renderField('Gender', extractedData.personalInfo.gender)}
              {renderField('Occupation', extractedData.personalInfo.occupation)}
              {renderField('Employer', extractedData.personalInfo.employer)}
              {renderField('Annual Income', extractedData.personalInfo.annualIncome)}
            </CardContent>
          </Card>
        )}

        {extractedData?.contactInfo && (
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField('Email', extractedData.contactInfo.email)}
              {renderField('Phone', extractedData.contactInfo.phone)}
              {renderField('Alternate Phone', extractedData.contactInfo.alternatePhone)}
              {extractedData.contactInfo.currentAddress && renderField('Current Address', extractedData.contactInfo.currentAddress)}
              {extractedData.contactInfo.mailingAddress && renderField('Mailing Address', extractedData.contactInfo.mailingAddress)}
              {extractedData.contactInfo.previousAddresses && renderField('Previous Addresses', extractedData.contactInfo.previousAddresses)}
              {extractedData.contactInfo.emergencyContact && renderField('Emergency Contact', extractedData.contactInfo.emergencyContact)}
            </CardContent>
          </Card>
        )}

        {extractedData?.caseInfo && (
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField('Case Type', extractedData.caseInfo.caseType)}
              {renderField('Sub-Case Type', extractedData.caseInfo.subCaseType)}
              {renderField('Urgency', extractedData.caseInfo.urgency)}
              {renderField('Description', extractedData.caseInfo.description)}
              {renderField('Detailed Description', extractedData.caseInfo.detailedDescription)}
              {renderField('Desired Outcome', extractedData.caseInfo.desiredOutcome)}
              {renderField('Status', extractedData.caseInfo.status)}
              {renderField('Priority', extractedData.caseInfo.priority)}
              {renderField('Assigned Lawyer', extractedData.caseInfo.assignedLawyer)}
              {renderField('Referral Source', extractedData.caseInfo.referralSource)}
              {extractedData.caseInfo.previousLegalIssues && renderField('Previous Legal Issues', extractedData.caseInfo.previousLegalIssues)}
              {extractedData.caseInfo.currentLegalProceedings && renderField('Current Legal Proceedings', extractedData.caseInfo.currentLegalProceedings)}
              {extractedData.caseInfo.importantDates && renderField('Important Dates', extractedData.caseInfo.importantDates)}
            </CardContent>
          </Card>
        )}

        {extractedData?.immigrationInfo && (
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Immigration Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField('Current Status', extractedData.immigrationInfo.currentStatus)}
              {renderField('Visa Type', extractedData.immigrationInfo.visaType)}
              {renderField('Visa Expiry Date', extractedData.immigrationInfo.visaExpiryDate)}
              {renderField('I-94 Number', extractedData.immigrationInfo.i94Number)}
              {renderField('Arrival Date', extractedData.immigrationInfo.arrivalDate)}
              {renderField('Port of Entry', extractedData.immigrationInfo.portOfEntry)}
              {extractedData.immigrationInfo.spouse && renderField('Spouse', extractedData.immigrationInfo.spouse)}
              {extractedData.immigrationInfo.children && renderField('Children', extractedData.immigrationInfo.children)}
              {extractedData.immigrationInfo.parents && renderField('Parents', extractedData.immigrationInfo.parents)}
              {extractedData.immigrationInfo.travelHistory && renderField('Travel History', extractedData.immigrationInfo.travelHistory)}
              {extractedData.immigrationInfo.immigrationHistory && renderField('Immigration History', extractedData.immigrationInfo.immigrationHistory)}
            </CardContent>
          </Card>
        )}

        {extractedData?.criminalHistory && (
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Criminal History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField('Has Arrest History', extractedData.criminalHistory.hasArrestHistory)}
              {extractedData.criminalHistory.arrests && renderField('Arrests', extractedData.criminalHistory.arrests)}
              {renderField('Has Convictions', extractedData.criminalHistory.hasConvictions)}
              {extractedData.criminalHistory.convictions && renderField('Convictions', extractedData.criminalHistory.convictions)}
              {renderField('Has Pending Charges', extractedData.criminalHistory.hasPendingCharges)}
              {extractedData.criminalHistory.pendingCharges && renderField('Pending Charges', extractedData.criminalHistory.pendingCharges)}
            </CardContent>
          </Card>
        )}

        {extractedData?.financialInfo && (
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField('Annual Income', extractedData.financialInfo.annualIncome)}
              {renderField('Employment Status', extractedData.financialInfo.employmentStatus)}
              {renderField('Employer', extractedData.financialInfo.employer)}
              {renderField('Job Title', extractedData.financialInfo.jobTitle)}
              {renderField('Employment Duration', extractedData.financialInfo.employmentDuration)}
              {extractedData.financialInfo.assets && renderField('Assets', extractedData.financialInfo.assets)}
              {extractedData.financialInfo.liabilities && renderField('Liabilities', extractedData.financialInfo.liabilities)}
              {extractedData.financialInfo.bankingInfo && renderField('Banking Information', extractedData.financialInfo.bankingInfo)}
            </CardContent>
          </Card>
        )}

        {extractedData?.documents && extractedData.documents.length > 0 && (
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField('Uploaded Documents', extractedData.documents)}
            </CardContent>
          </Card>
        )}

        {extractedData?.medicalInfo && (
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField('Has Disabilities', extractedData.medicalInfo.hasDisabilities)}
              {extractedData.medicalInfo.disabilities && renderField('Disabilities', extractedData.medicalInfo.disabilities)}
              {extractedData.medicalInfo.mentalHealthHistory && renderField('Mental Health History', extractedData.medicalInfo.mentalHealthHistory)}
            </CardContent>
          </Card>
        )}

        {extractedData?.communicationPreferences && (
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField('Preferred Method', extractedData.communicationPreferences.preferredMethod)}
              {renderField('Language Preference', extractedData.communicationPreferences.languagePreference)}
              {renderField('Needs Interpreter', extractedData.communicationPreferences.needsInterpreter)}
              {renderField('Interpreter Language', extractedData.communicationPreferences.interpreterLanguage)}
              {renderField('Best Time to Call', extractedData.communicationPreferences.bestTimeToCall)}
              {renderField('Time Zone', extractedData.communicationPreferences.timeZone)}
              {renderField('Communication Notes', extractedData.communicationPreferences.communicationNotes)}
            </CardContent>
          </Card>
        )}

        {extractedData?.consents && (
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Consents and Agreements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {extractedData.consents.attorneyClientAgreement && renderField('Attorney-Client Agreement', extractedData.consents.attorneyClientAgreement)}
              {extractedData.consents.privacyPolicy && renderField('Privacy Policy', extractedData.consents.privacyPolicy)}
              {extractedData.consents.backgroundCheck && renderField('Background Check', extractedData.consents.backgroundCheck)}
              {extractedData.consents.documentSharing && renderField('Document Sharing', extractedData.consents.documentSharing)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
