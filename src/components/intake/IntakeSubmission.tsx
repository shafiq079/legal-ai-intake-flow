import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  category: string;
}

interface IntakeSubmissionProps {
  intakeId: string;
  onSubmissionSuccess: () => void;
  extractedData: ExtractedField[];
  formData: any; // Add formData prop to receive complete form data
}

const IntakeSubmission: React.FC<IntakeSubmissionProps> = ({ intakeId, onSubmissionSuccess, extractedData, formData }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(event.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.info("Please select files to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('documents', selectedFiles[i]);
    }
    formData.append('intakeId', intakeId);

    try {
      // Assuming a new endpoint for document uploads specific to intake
      const response = await axios.post(`/api/documents/upload-intake/${intakeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Documents uploaded successfully!");
      // You might want to update a state here to show uploaded documents
    } catch (error: any) {
      console.error("Error uploading documents:", error);
      toast.error(error.response?.data?.message || "Failed to upload documents.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitIntake = async () => {
    // Check for required consents
    const attorneyClientAgreementSigned = formData.consents?.attorneyClientAgreement?.signed;
    const privacyPolicyAccepted = formData.consents?.privacyPolicy?.accepted;
    const backgroundCheckAuthorized = formData.consents?.backgroundCheck?.authorized;
    const documentSharingAuthorized = formData.consents?.documentSharing?.authorized;

    if (!attorneyClientAgreementSigned || !privacyPolicyAccepted || !backgroundCheckAuthorized || !documentSharingAuthorized) {
      toast.error("Please agree to all terms and conditions before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      // This endpoint will finalize the intake and potentially create a client
      const response = await axios.post(`/api/intake/${intakeId}/complete`);
      toast.success(response.data.message || "Intake submitted successfully!");
      onSubmissionSuccess(); // Callback to parent to indicate completion
    } catch (error: any) {
      console.error("Error submitting intake:", error);
      toast.error(error.response?.data?.message || "Failed to submit intake.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-500" /> Intake Complete!
        </CardTitle>
        <CardDescription>
          Please review the extracted information and upload any supporting documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="documents">Upload Supporting Documents</Label>
          <Input
            id="documents"
            type="file"
            multiple
            onChange={handleFileChange}
            className="file:text-primary file:bg-primary-foreground file:border-primary"
          />
          <Button
            onClick={handleUpload}
            disabled={!selectedFiles || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isUploading ? "Uploading..." : "Upload Documents"}
          </Button>
        </div>

        <Button
          onClick={handleSubmitIntake}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {isSubmitting ? "Submitting..." : "Finalize & Submit Intake"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default IntakeSubmission;