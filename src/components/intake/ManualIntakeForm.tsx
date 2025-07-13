import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intakeSchema, IntakeFormValues } from '@/lib/intakeSchema';
import PersonalInfoForm from './PersonalInfoForm';
import ContactInfoForm from './ContactInfoForm';
import CaseInfoForm from './CaseInfoForm';
import ConditionalForms from './ConditionalForms';
import DocumentUploadForm from './DocumentUploadForm';
import MedicalInfoForm from './MedicalInfoForm';
import CommunicationConsentForm from './CommunicationConsentForm';
import { IntakeDocumentType } from '@/lib/requiredDocuments';

interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  category: string;
}

interface UploadedFileState {
  id: string;
  file: File;
  documentName: string; // e.g., "Passport", "Police Report"
  documentType: string; // e.g., "Identity", "Legal"
  isUploaded: boolean; // True if successfully uploaded to Cloudinary (after final submission)
}

interface ManualIntakeFormProps {
  onBack: () => void;
  intakeData: any; // Add intakeData prop
  intakeType: IntakeDocumentType;
  onFormSubmit: (data: IntakeFormValues) => void;
  intakeId: string;
}

const ManualIntakeForm: React.FC<ManualIntakeFormProps> = ({ onBack, intakeData, intakeType, onFormSubmit, intakeId }) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFileState[]>([]);

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      personalInfo: {
        firstName: intakeData?.extractedData?.personalInfo?.firstName || '',
        lastName: intakeData?.extractedData?.personalInfo?.lastName || '',
        middleName: intakeData?.extractedData?.personalInfo?.middleName || '',
        preferredName: intakeData?.extractedData?.personalInfo?.preferredName || '',
        dateOfBirth: intakeData?.extractedData?.personalInfo?.dateOfBirth || '',
        placeOfBirth: intakeData?.extractedData?.personalInfo?.placeOfBirth || '',
        nationality: intakeData?.extractedData?.personalInfo?.nationality || '',
        maritalStatus: intakeData?.extractedData?.personalInfo?.maritalStatus || undefined,
        ssn: intakeData?.extractedData?.personalInfo?.ssn || '',
        gender: intakeData?.extractedData?.personalInfo?.gender || '',
        occupation: intakeData?.extractedData?.personalInfo?.occupation || '',
        employer: intakeData?.extractedData?.personalInfo?.employer || '',
        annualIncome: intakeData?.extractedData?.personalInfo?.annualIncome || undefined,
      },
      contactInfo: {
        email: intakeData?.extractedData?.contactInfo?.email || '',
        phone: intakeData?.extractedData?.contactInfo?.phone || '',
        alternatePhone: intakeData?.extractedData?.contactInfo?.alternatePhone || '',
        currentAddress: {
          street: intakeData?.extractedData?.contactInfo?.currentAddress?.street || '',
          city: intakeData?.extractedData?.contactInfo?.currentAddress?.city || '',
          state: intakeData?.extractedData?.contactInfo?.currentAddress?.state || '',
          zipCode: intakeData?.extractedData?.contactInfo?.currentAddress?.zipCode || '',
          country: intakeData?.extractedData?.contactInfo?.currentAddress?.country || '',
          residencyDuration: intakeData?.extractedData?.contactInfo?.currentAddress?.residencyDuration || '',
          isMailingAddress: intakeData?.extractedData?.contactInfo?.currentAddress?.isMailingAddress || false,
        },
        mailingAddress: {
          street: intakeData?.extractedData?.contactInfo?.mailingAddress?.street || '',
          city: intakeData?.extractedData?.contactInfo?.mailingAddress?.city || '',
          state: intakeData?.extractedData?.contactInfo?.mailingAddress?.state || '',
          zipCode: intakeData?.extractedData?.contactInfo?.mailingAddress?.zipCode || '',
          country: intakeData?.extractedData?.contactInfo?.mailingAddress?.country || '',
        },
        previousAddresses: intakeData?.extractedData?.contactInfo?.previousAddresses || [],
        emergencyContact: {
          name: intakeData?.extractedData?.contactInfo?.emergencyContact?.name || '',
          relationship: intakeData?.extractedData?.contactInfo?.emergencyContact?.relationship || '',
          phone: intakeData?.extractedData?.contactInfo?.emergencyContact?.phone || '',
          email: intakeData?.extractedData?.contactInfo?.emergencyContact?.email || '',
          address: intakeData?.extractedData?.contactInfo?.emergencyContact?.address || '',
        },
      },
      caseInfo: {
        caseType: intakeData?.extractedData?.caseInfo?.caseType || intakeType || 'Other',
        subCaseType: intakeData?.extractedData?.caseInfo?.subCaseType || '',
        urgency: intakeData?.extractedData?.caseInfo?.urgency || undefined,
        description: intakeData?.extractedData?.caseInfo?.description || '',
        detailedDescription: intakeData?.extractedData?.caseInfo?.detailedDescription || '',
        desiredOutcome: intakeData?.extractedData?.caseInfo?.desiredOutcome || '',
        status: intakeData?.extractedData?.caseInfo?.status || '',
        priority: intakeData?.extractedData?.caseInfo?.priority || '',
        assignedLawyer: intakeData?.extractedData?.caseInfo?.assignedLawyer || '',
        referralSource: intakeData?.extractedData?.caseInfo?.referralSource || '',
        previousLegalIssues: intakeData?.extractedData?.caseInfo?.previousLegalIssues || [],
        currentLegalProceedings: intakeData?.extractedData?.caseInfo?.currentLegalProceedings || [],
        importantDates: intakeData?.extractedData?.caseInfo?.importantDates || [],
      },
      immigrationInfo: {
        currentStatus: intakeData?.extractedData?.immigrationInfo?.currentStatus || '',
        visaType: intakeData?.extractedData?.immigrationInfo?.visaType || '',
        visaExpiryDate: intakeData?.extractedData?.immigrationInfo?.visaExpiryDate || '',
        i94Number: intakeData?.extractedData?.immigrationInfo?.i94Number || '',
        arrivalDate: intakeData?.extractedData?.immigrationInfo?.arrivalDate || '',
        portOfEntry: intakeData?.extractedData?.immigrationInfo?.portOfEntry || '',
        spouse: {
          name: intakeData?.extractedData?.immigrationInfo?.spouse?.name || '',
          citizenship: intakeData?.extractedData?.immigrationInfo?.spouse?.citizenship || '',
          immigrationStatus: intakeData?.extractedData?.immigrationInfo?.spouse?.immigrationStatus || '',
          dateOfBirth: intakeData?.extractedData?.immigrationInfo?.spouse?.dateOfBirth || '',
          marriageDate: intakeData?.extractedData?.immigrationInfo?.spouse?.marriageDate || '',
          marriageLocation: intakeData?.extractedData?.immigrationInfo?.spouse?.marriageLocation || '',
        },
        children: intakeData?.extractedData?.immigrationInfo?.children || [],
        parents: intakeData?.extractedData?.immigrationInfo?.parents || [],
        travelHistory: intakeData?.extractedData?.immigrationInfo?.travelHistory || [],
        immigrationHistory: intakeData?.extractedData?.immigrationInfo?.immigrationHistory || [],
      },
      criminalHistory: {
        hasArrestHistory: intakeData?.extractedData?.criminalHistory?.hasArrestHistory || false,
        arrests: intakeData?.extractedData?.criminalHistory?.arrests || [],
        hasConvictions: intakeData?.extractedData?.criminalHistory?.hasConvictions || false,
        convictions: intakeData?.extractedData?.criminalHistory?.convictions || [],
        hasPendingCharges: intakeData?.extractedData?.criminalHistory?.hasPendingCharges || false,
        pendingCharges: intakeData?.extractedData?.criminalHistory?.pendingCharges || [],
      },
      financialInfo: {
        annualIncome: intakeData?.extractedData?.financialInfo?.annualIncome || undefined,
        employmentStatus: intakeData?.extractedData?.financialInfo?.employmentStatus || '',
        employer: intakeData?.extractedData?.financialInfo?.employer || '',
        jobTitle: intakeData?.extractedData?.financialInfo?.jobTitle || '',
        employmentDuration: intakeData?.extractedData?.financialInfo?.employmentDuration || '',
        assets: intakeData?.extractedData?.financialInfo?.assets || [],
        liabilities: intakeData?.extractedData?.financialInfo?.liabilities || [],
        bankingInfo: {
          bankName: intakeData?.extractedData?.financialInfo?.bankingInfo?.bankName || '',
          accountType: intakeData?.extractedData?.financialInfo?.bankingInfo?.accountType || '',
          routingNumber: intakeData?.extractedData?.financialInfo?.bankingInfo?.routingNumber || '',
          accountNumber: intakeData?.extractedData?.financialInfo?.bankingInfo?.accountNumber || '',
        },
      },
      documents: intakeData?.documents || [],
      medicalInfo: {
        hasDisabilities: intakeData?.extractedData?.medicalInfo?.hasDisabilities || false,
        disabilities: intakeData?.extractedData?.medicalInfo?.disabilities || [],
        mentalHealthHistory: {
          hasHistory: intakeData?.extractedData?.medicalInfo?.mentalHealthHistory?.hasHistory || false,
          details: intakeData?.extractedData?.medicalInfo?.mentalHealthHistory?.details || '',
          currentTreatment: intakeData?.extractedData?.medicalInfo?.mentalHealthHistory?.currentTreatment || false,
        },
      },
      communicationPreferences: {
        preferredMethod: intakeData?.extractedData?.communicationPreferences?.preferredMethod || undefined,
        languagePreference: intakeData?.extractedData?.communicationPreferences?.languagePreference || '',
        needsInterpreter: intakeData?.extractedData?.communicationPreferences?.needsInterpreter || false,
        interpreterLanguage: intakeData?.extractedData?.communicationPreferences?.interpreterLanguage || '',
        bestTimeToCall: intakeData?.extractedData?.communicationPreferences?.bestTimeToCall || '',
        timeZone: intakeData?.extractedData?.communicationPreferences?.timeZone || '',
        communicationNotes: intakeData?.extractedData?.communicationPreferences?.communicationNotes || '',
      },
      consents: {
        attorneyClientAgreement: {
          signed: intakeData?.extractedData?.consents?.attorneyClientAgreement?.signed || false,
          signedDate: intakeData?.extractedData?.consents?.attorneyClientAgreement?.signedDate || '',
          signedBy: intakeData?.extractedData?.consents?.attorneyClientAgreement?.signedBy || '',
        },
        privacyPolicy: {
          accepted: intakeData?.extractedData?.consents?.privacyPolicy?.accepted || false,
          acceptedDate: intakeData?.extractedData?.consents?.privacyPolicy?.acceptedDate || '',
        },
        backgroundCheck: {
          authorized: intakeData?.extractedData?.consents?.backgroundCheck?.authorized || false,
          authorizedDate: intakeData?.extractedData?.consents?.backgroundCheck?.authorizedDate || '',
        },
        documentSharing: {
          authorized: intakeData?.extractedData?.consents?.documentSharing?.authorized || false,
          authorizedDate: intakeData?.extractedData?.consents?.documentSharing?.authorizedDate || '',
        },
      },
    },
  });

  useEffect(() => {
    console.log("ManualIntakeForm: current intakeType", intakeType);
    form.setValue('documents', uploadedDocuments.map(doc => ({
      name: doc.documentName,
      type: doc.documentType,
      category: doc.documentType,
    })), { shouldValidate: true });
  }, [uploadedDocuments, form, intakeType]);

  const onSubmit = async (data: IntakeFormValues) => {
    console.log('Submitting form data from ManualIntakeForm:', data);

    // Upload documents to Cloudinary first if there are any
    const uploadedDocumentDetails: { name: string; url: string; type: string; category: string; uploadDate: string; }[] = [];

    if (uploadedDocuments.length > 0) {
      const formData = new FormData();
      uploadedDocuments.forEach((docState, index) => {
        formData.append(`documents`, docState.file); // 'documents' is the field name expected by Multer for multiple files
        formData.append(`documentNames[${index}]`, docState.documentName);
        formData.append(`documentTypes[${index}]`, docState.documentType);
      });

      try {
        const response = await axios.post(`/api/documents/upload-intake/${intakeId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data && response.data.documents) {
          response.data.documents.forEach((uploadedDoc: any) => {
            uploadedDocumentDetails.push({
              name: uploadedDoc.name,
              url: uploadedDoc.url,
              type: uploadedDoc.type,
              category: uploadedDoc.category,
              uploadDate: uploadedDoc.uploadDate,
            });
          });
          toast.success(`All documents uploaded successfully!`);
        } else {
          throw new Error('Upload response missing document URLs');
        }
      } catch (error) {
        console.error('Error uploading documents:', error);
        toast.error(`Failed to upload documents. Please try again.`);
        return; // Stop submission if document upload fails
      }
    }

    // Update the form data with the uploaded document URLs
    data.documents = uploadedDocumentDetails;

    onFormSubmit(data); // Pass the complete form data to the parent component
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-4">
      <Card className="w-full max-w-2xl flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient-primary">
            <FileText className="h-6 w-6" /> Smart Manual Intake
          </CardTitle>
          <CardDescription>
            Fill out the form below to provide your legal intake information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto pb-4">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PersonalInfoForm />
              <ContactInfoForm />
              <CaseInfoForm intakeType={intakeType} />
              <ConditionalForms />
              <DocumentUploadForm intakeType={intakeType} onDocumentsChange={setUploadedDocuments} />
              <MedicalInfoForm />
              <CommunicationConsentForm />
              <Button type="submit" variant="legal" className="w-full mt-auto">
                Submit Intake
              </Button>
            </form>
          </FormProvider>
          <Button variant="outline" className="w-full" onClick={onBack}>
            Back to Intake Options
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualIntakeForm;
