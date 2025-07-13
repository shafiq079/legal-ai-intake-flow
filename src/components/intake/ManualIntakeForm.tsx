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
  extractedData?: ExtractedField[];
  intakeType: IntakeDocumentType; // Add intakeType prop
  onFormSubmit: (data: IntakeFormValues) => void; // New prop for form submission
  intakeId: string; // Add intakeId prop
}

const ManualIntakeForm: React.FC<ManualIntakeFormProps> = ({ onBack, extractedData, intakeType, onFormSubmit, intakeId }) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFileState[]>([]);

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
      },
      contactInfo: {
        email: '',
        phone: '',
        currentAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      },
      caseInfo: {
        caseType: 'Other',
        description: '',
      },
      documents: [], // Initialize documents as an empty array
    },
  });

  useEffect(() => {
    if (extractedData && extractedData.length > 0) {
      console.log("ManualIntakeForm: extractedData", extractedData);
      extractedData.forEach(field => {
        form.setValue(field.field as any, field.value, { shouldValidate: true });
      });
    }
  }, [extractedData, form]);

  useEffect(() => {
    console.log("ManualIntakeForm: current intakeType", intakeType);
    form.setValue('documents', uploadedDocuments.map(doc => ({
      name: doc.documentName, // Use the categorized name
      type: doc.documentType, // Use the categorized type
      category: doc.documentType, // Or a more specific category if available
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
              <CaseInfoForm />
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
