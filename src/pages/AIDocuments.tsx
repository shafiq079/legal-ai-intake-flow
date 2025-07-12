import { useState, useCallback } from 'react';
import { Upload, FileText, Check, AlertCircle, Brain, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string; // Changed to string to match backend mock
  status: 'processing' | 'completed' | 'error';
  extractedData?: Record<string, string>;
  confidence?: number;
  category?: string;
}

const fetchDocuments = async (): Promise<UploadedDocument[]> => {
  const response = await fetch('/api/documents');
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  return response.json();
};

const uploadDocument = async (file: File): Promise<UploadedDocument> => {
  const formData = new FormData();
  formData.append('document', file);

  // For simplicity, sending basic info. In a real app, you'd send the actual file.
  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      type: 'Unknown', // This will be detected by backend
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to upload document');
  }
  return response.json();
};

export default function AIDocuments() {
  const queryClient = useQueryClient();
  const { data: uploadedDocs, isLoading, isError, error } = useQuery<UploadedDocument[]>({ 
    queryKey: ['uploadedDocuments'],
    queryFn: fetchDocuments,
    refetchInterval: 5000, // Refetch every 5 seconds to check processing status
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploadedDocuments'] });
    },
  });

  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      uploadDocumentMutation.mutate(file);
    });
  }, [uploadDocumentMutation]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary legal-fade-in">
            AI Document Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload and analyze legal documents with AI-powered data extraction
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Area */}
          <Card className="legal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Smart Document Upload
              </CardTitle>
              <CardDescription>
                Upload legal documents for AI-powered analysis and data extraction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports PDF, DOC, DOCX, JPG, PNG up to 10MB
                </p>
                <Button
                  variant="legal"
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  Choose Files
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </div>

              {/* Supported Document Types */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Supported Document Types</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    'Passports & IDs',
                    'Bank Statements',
                    'Legal Contracts',
                    'Court Documents',
                    'Birth Certificates',
                    'Marriage Certificates',
                    'Medical Records',
                    'Employment Letters',
                  ].map((type) => (
                    <Badge key={type} variant="outline" className="justify-center">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Document Processing Queue</CardTitle>
              <CardDescription>
                Track the status of your uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedDocs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">{doc.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {doc.size} • {doc.uploadDate.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {doc.status === 'processing' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-warning rounded-full animate-pulse" />
                              <span className="text-sm text-warning">AI analyzing document...</span>
                            </div>
                            <Progress value={60} className="h-1" />
                          </div>
                        )}
                        
                        {doc.status === 'completed' && doc.extractedData && (
                          <div className="mt-2">
                            <Badge className={getStatusColor(doc.status)}>
                              <Check className="h-3 w-3 mr-1" />
                              Analysis Complete ({Math.round((doc.confidence || 0) * 100)}% confidence)
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {doc.status === 'completed' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </>
                        )}
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Latest Analysis */}
          {uploadedDocs.find(doc => doc.status === 'completed' && doc.extractedData) && (
            <Card className="legal-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-success" />
                  Latest Analysis
                </CardTitle>
                <CardDescription>
                  Extracted data from most recent document
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const latestDoc = uploadedDocs.find(doc => doc.status === 'completed' && doc.extractedData);
                  if (!latestDoc?.extractedData) return null;

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{latestDoc.name}</span>
                        <Badge variant="outline">{latestDoc.type}</Badge>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        {Object.entries(latestDoc.extractedData).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <Button variant="ai" size="sm" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Auto-fill Forms
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Processing Stats */}
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Processing Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Documents Processed</span>
                <span className="font-bold">{uploadedDocs.filter(d => d.status === 'completed').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Currently Processing</span>
                <span className="font-bold">{uploadedDocs.filter(d => d.status === 'processing').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Confidence</span>
                <span className="font-bold">
                  {uploadedDocs.filter(d => d.confidence).length > 0
                    ? Math.round(
                        uploadedDocs
                          .filter(d => d.confidence)
                          .reduce((acc, d) => acc + (d.confidence || 0), 0) /
                        uploadedDocs.filter(d => d.confidence).length * 100
                      ) + '%'
                    : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}