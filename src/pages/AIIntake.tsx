import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Mic, FileText } from 'lucide-react';
import VoiceIntake from '@/components/intake/VoiceIntake';
import ManualIntake from '@/components/intake/ManualIntake';
import ExtractedDataDisplay from '@/components/intake/ExtractedDataDisplay';
import AdminIntakeLinkManager from '@/components/intake/AdminIntakeLinkManager'; // Import the new component

export default function AIIntake() {
  const { intakeId } = useParams<{ intakeId: string }>();
  const [intakeMode, setIntakeMode] = useState<'voice' | 'manual' | null>(null);
  const [isIntakeComplete, setIsIntakeComplete] = useState(false);
  const [finalExtractedData, setFinalExtractedData] = useState<any>(null);

  // Fetch intake details if intakeId is present
  const { data: intakeDetails, isLoading: isLoadingIntake, error: intakeError } = useQuery({
    queryKey: ['intake', intakeId],
    queryFn: async () => {
      if (!intakeId) return null;
      const response = await axios.get(`/api/intake/${intakeId}`);
      // If intake is already completed, set completion state and data
      if (response.data.status === 'completed' && response.data.extractedData) {
        setIsIntakeComplete(true);
        setFinalExtractedData(response.data.extractedData);
      }
      return response.data;
    },
    enabled: !!intakeId, // Only run if intakeId is present
  });

  if (intakeId) {
    // Client-facing intake page
    if (isLoadingIntake) return <div>Loading intake session...</div>;
    if (intakeError) return <div>Error loading intake session: {intakeError.message}</div>;
    if (!intakeDetails) return <div>Intake session not found or invalid.</div>;

    if (isIntakeComplete && finalExtractedData) {
      return (
        <div className="flex-1 p-6">
          <ExtractedDataDisplay extractedData={finalExtractedData} intakeType={intakeDetails.intakeType} />
        </div>
      );
    }

    if (!intakeMode) {
      return (
        <div className="flex-1 p-6 flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to Your Legal Intake</CardTitle>
              <CardDescription>
                Please select how you would like to proceed with your intake for a <span className="font-semibold text-primary">{intakeDetails.intakeType}</span> case.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button
                className="h-20 text-lg flex items-center justify-center gap-3"
                onClick={() => setIntakeMode('voice')}
              >
                <Mic className="h-6 w-6" /> AI-Powered Voice Intake
              </Button>
              <Button
                className="h-20 text-lg flex items-center justify-center gap-3"
                onClick={() => setIntakeMode('manual')}
                variant="outline"
              >
                <FileText className="h-6 w-6" /> Smart Manual Form Intake
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Render selected intake mode component
    return (
      <div className="flex-1 p-6">
        {intakeMode === 'voice' && (
          <VoiceIntake
            intakeId={intakeId}
            intakeType={intakeDetails.intakeType}
            onComplete={(data) => {
              console.log('Voice intake completed with data:', data);
              setIsIntakeComplete(true);
              setFinalExtractedData(data);
              toast.success("Voice intake completed!");
            }}
          />
        )}
        {intakeMode === 'manual' && (
          <ManualIntake
            intakeId={intakeId}
            intakeType={intakeDetails.intakeType}
            onComplete={(data) => {
              console.log('Manual intake completed with data:', data);
              setIsIntakeComplete(true);
              setFinalExtractedData(data);
              toast.success("Manual intake completed!");
            }}
          />
        )}
      </div>
    );
  }

  // Admin-facing link generation/management page
  return <AdminIntakeLinkManager />;
}
