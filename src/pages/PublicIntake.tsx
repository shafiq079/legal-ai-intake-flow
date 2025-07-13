import { useState, useEffect } from 'react';
import { Bot, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { toast } from 'sonner';

import ManualIntakeForm from '@/components/intake/ManualIntakeForm';
import IntakeSubmission from '@/components/intake/IntakeSubmission';
import VoiceIntake from '@/components/intake/VoiceIntake'; // Import the VoiceIntake component

interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  category: string;
}

// Helper function to determine category for extracted fields
const getCategoryForField = (field: string): string => {
  if (['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'nationality', 'maritalStatus', 'occupation', 'employer'].includes(field)) {
    return 'Personal Information';
  } else if (['caseType', 'description', 'urgency', 'desiredOutcome', 'previousLegalIssues', 'currentProceedings'].includes(field)) {
    return 'Case Information';
  } else if (['currentStatus', 'visaType', 'familyMembers', 'travelHistory'].includes(field)) {
    return 'Immigration Information';
  } else if (['hasHistory', 'details'].includes(field)) {
    return 'Criminal History';
  } else if (['annualIncome', 'employmentStatus', 'assets', 'liabilities'].includes(field)) {
    return 'Financial Information';
  } else if (['documentsNeeded', 'documentsAvailable'].includes(field)) {
    return 'Documents';
  } else if (['preferredMethod', 'language', 'needsInterpreter', 'bestTimeToCall'].includes(field)) {
    return 'Communication Preferences';
  } else if (['privacyPolicy', 'dataSharing', 'backgroundCheck'].includes(field)) {
    return 'Consents';
  } else {
    return 'Other';
  }
};

// Helper function to get display name for fields
const getFieldDisplayName = (field: string): string => {
  const displayNames: Record<string, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    dateOfBirth: 'Date of Birth',
    nationality: 'Nationality',
    maritalStatus: 'Marital Status',
    occupation: 'Occupation',
    employer: 'Employer',
    caseType: 'Case Type',
    description: 'Description',
    urgency: 'Urgency',
    desiredOutcome: 'Desired Outcome',
    previousLegalIssues: 'Previous Legal Issues',
    currentProceedings: 'Current Proceedings',
    currentStatus: 'Current Status',
    visaType: 'Visa Type',
    familyMembers: 'Family Members',
    travelHistory: 'Travel History',
    hasHistory: 'Has Criminal History',
    details: 'Details',
    annualIncome: 'Annual Income',
    employmentStatus: 'Employment Status',
    assets: 'Assets',
    liabilities: 'Liabilities',
    documentsNeeded: 'Documents Needed',
    documentsAvailable: 'Documents Available',
    preferredMethod: 'Preferred Method',
    language: 'Language',
    needsInterpreter: 'Needs Interpreter',
    bestTimeToCall: 'Best Time to Call',
    privacyPolicy: 'Privacy Policy',
    dataSharing: 'Data Sharing',
    backgroundCheck: 'Background Check',
  };
  return displayNames[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

export default function PublicIntake() {
  const { linkId } = useParams<{ linkId: string }>();

  type IntakeType = 'voice' | 'manual' | null;
  const [selectedIntakeType, setSelectedIntakeType] = useState<IntakeType>(null);

  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [isIntakeComplete, setIsIntakeComplete] = useState(false);
  const [manualFormData, setManualFormData] = useState<any>(null); // New state for manual form data

  const { data: intakeData, isLoading: isLoadingIntake, error: intakeError } = useQuery({
    queryKey: ['intake', linkId],
    queryFn: async () => {
      if (!linkId) return null;
      const response = await axios.get(`/api/intake/${linkId}`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data) {
        // Map backend extracted data to frontend ExtractedField interface
        if (data.extractedData) {
          const loadedFields: ExtractedField[] = Object.entries(data.extractedData).map(([key, value]) => ({
            field: key,
            value: value as string,
            confidence: 1, // Assuming 100% confidence for loaded data
            category: getCategoryForField(key),
          }));
          setExtractedFields(loadedFields);
        }
        setCompletionProgress(data.completionPercentage || 0);
        // Check if intake was already completed
        if (data.status === 'completed') {
          setIsIntakeComplete(true);
        }
      }
    },
    onError: (error) => {
      console.error('Error loading intake data:', error);
      toast.error('Failed to load previous intake data.');
    },
    enabled: !!linkId, // Only run query if linkId is available
  });

  const handleSubmissionSuccess = () => {
    toast.success("Intake finalized and submitted successfully!");
    // Optionally redirect or show a final success message
    // For now, we'll just disable further interaction
  };

  const handleManualFormSubmit = async (data: any) => {
    console.log("PublicIntake: Manual form submitted with data", data);
    setManualFormData(data); // Store the complete form data

    if (!linkId) {
      toast.error("Intake ID is missing. Cannot save manual form data.");
      return;
    }

    try {
      // API call to update the intake session with manual form data
      const response = await axios.put(`/api/intake/${linkId}/update-data`, data);
      if (response.data.success) {
        toast.success("Manual form data saved successfully!");
        // Optionally update extractedFields or other state based on backend response
        // For now, we'll just rely on manualFormData for IntakeSubmission
      } else {
        toast.error(response.data.message || "Failed to save manual form data.");
      }
    } catch (error: any) {
      console.error("Error saving manual form data:", error);
      toast.error(error.response?.data?.message || "Failed to save manual form data.");
    }
  };

  const handleVoiceIntakeComplete = (extractedData: any) => {
    console.log("Voice intake completed with data:", extractedData);
    // Update extracted fields from voice intake
    if (extractedData) {
      const newFields = Object.entries(extractedData).map(([key, value]) => ({
        field: key,
        value: value as string,
        confidence: 1, // Assuming 100% confidence for AI extracted data
        category: getCategoryForField(key),
      }));
      setExtractedFields(prev => {
        const updatedFields = new Map(prev.map(f => [f.field, f]));
        newFields.forEach(f => updatedFields.set(f.field, f));
        return Array.from(updatedFields.values());
      });
      setCompletionProgress(100); // Assuming voice intake completion means 100%
      setIsIntakeComplete(true);
      toast.success("Voice intake complete! Please review and submit.");
    }
  };

  if (isLoadingIntake) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading intake session...</p>
      </div>
    );
  }

  if (intakeError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full text-red-500">
        <p className="text-lg">Error: {intakeError.message}</p>
        <p className="text-sm">Please ensure the link is valid and not expired.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      {!selectedIntakeType && (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
          <h1 className="text-4xl font-bold text-gradient-primary mb-8">
            Welcome to Legal Intake
          </h1>
          <p className="text-lg text-muted-foreground mb-12 text-center max-w-2xl">
            Choose how you'd like to proceed with your legal intake. You can either speak with our AI assistant or fill out a smart form manually.
          </p>
          <div className="flex gap-8">
            <Card className="w-80 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedIntakeType('voice')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6" /> AI Voice Intake
                </CardTitle>
                <CardDescription>
                  Speak naturally with our AI assistant to provide your information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Guided conversation, speech-to-text, real-time data extraction.
                </p>
                <Button variant="legal" className="mt-4 w-full">Start AI Voice Intake</Button>
              </CardContent>
            </Card>
            <Card className="w-80 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedIntakeType('manual')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" /> Smart Manual Intake
                </CardTitle>
                <CardDescription>
                  Fill out a dynamic form at your own pace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dynamic forms, conditional logic, document upload with OCR.
                </p>
                <Button variant="legal" className="mt-4 w-full">Start Manual Intake</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedIntakeType && (
        <div className="flex flex-1 h-full">
          {/* Left Panel: Manual Intake Form */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 border-r">
            <ManualIntakeForm
              intakeData={intakeData} // Pass the entire intakeData object
              onBack={() => setSelectedIntakeType(null)}
              intakeType={intakeData?.intakeType || 'Other'}
              onFormSubmit={handleManualFormSubmit}
              intakeId={linkId || ''}
            />
          </div>

          {/* Right Panel: Voice Bot or Empty */}
          {selectedIntakeType === 'voice' && (
            <div className="flex-1 flex flex-col">
              <VoiceIntake
                intakeId={linkId || ''}
                intakeType={intakeData?.intakeType || 'Other'}
                onComplete={handleVoiceIntakeComplete}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}        
