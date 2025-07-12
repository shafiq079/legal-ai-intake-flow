import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, UploadCloud, CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { requiredDocuments, RequiredDocument, IntakeDocumentType } from '@/lib/requiredDocuments';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface UploadedFileState {
  id: string;
  file: File;
  documentName: string; // e.g., "Passport", "Police Report"
  documentType: string; // e.g., "Identity", "Legal"
  isUploaded: boolean; // True if successfully uploaded to Cloudinary (after final submission)
}

interface DocumentUploadFormProps {
  intakeType: IntakeDocumentType; // Passed from parent
  onDocumentsChange: (documents: UploadedFileState[]) => void; // Callback to pass data to parent
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ intakeType, onDocumentsChange }) => {
  const { control } = useFormContext(); // Still use form context for overall form state if needed
  const [selectedFiles, setSelectedFiles] = useState<UploadedFileState[]>([]);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const currentRequiredDocuments = requiredDocuments[intakeType] || [];

  useEffect(() => {
    // Inform parent about changes in selected files
    onDocumentsChange(selectedFiles);
  }, [selectedFiles, onDocumentsChange]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, docName: string, docType: string) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const newFileState: UploadedFileState = {
        id: `${docName}-${Date.now()}`,
        file: file,
        documentName: docName,
        documentType: docType,
        isUploaded: false,
      };

      setSelectedFiles(prev => {
        // Replace existing file for this document name, or add new
        const existingIndex = prev.findIndex(f => f.documentName === docName);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = newFileState;
          return updated;
        } else {
          return [...prev, newFileState];
        }
      });
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  const getDocumentStatus = (docName: string) => {
    return selectedFiles.some(f => f.documentName === docName) ? "uploaded" : "pending";
  };

  const handleDivClick = (docName: string) => {
    fileInputRefs.current[docName]?.click();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Required Documents for {intakeType} Intake</h3>
      <p className="text-sm text-muted-foreground">
        Please upload the following documents. Our AI will extract relevant data.
      </p>

      <div className="space-y-4">
        {currentRequiredDocuments.map((doc) => (
          <div
            key={doc.name}
            className="border p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleDivClick(doc.name)}
          >
            <div>
              <p className="font-medium">{doc.name}</p>
              <p className="text-sm text-muted-foreground">{doc.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {getDocumentStatus(doc.name) === "uploaded" ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Uploaded
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <UploadCloud className="h-4 w-4" /> Pending
                </Badge>
              )}
              <Input
              className="hidden"
                type="file"
                hidden 
                id={`upload-${doc.name}`}
                ref={el => (fileInputRefs.current[doc.name] = el)}
                onChange={(e) => handleFileChange(e, doc.name, doc.name)} // Simple mapping for now
              />
              <Label htmlFor={`upload-${doc.name}`} className="cursor-pointer">
                <Button type="button" variant="outline" size="sm"> {/* Removed onClick={(e) => e.stopPropagation()} */}
                  {getDocumentStatus(doc.name) === "uploaded" ? "Change File" : "Upload File"}
                </Button>
              </Label>
              {getDocumentStatus(doc.name) === "uploaded" && (
                <Button type="button" variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the div's click
                  handleRemoveFile(selectedFiles.find(f => f.documentName === doc.name)?.id || '');
                }}>
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="font-semibold">Files Ready for Submission:</h4>
          {selectedFiles.map(fileState => (
            <div key={fileState.id} className="flex items-center justify-between p-2 border rounded-md">
              <span className="text-sm">{fileState.documentName}: {fileState.file.name}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFile(fileState.id)}>
                <XCircle className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* This button is for the overall form submission, not individual file uploads */}
      {/* The actual submission logic will be in ManualIntakeForm or IntakeSubmission */}
    </div>
  );
};

export default DocumentUploadForm;