import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ManualIntakeForm from '@/components/intake/ManualIntakeForm';
import { IntakeFormValues } from '@/lib/intakeSchema';
import { toast } from 'sonner';

const fetchIntakeDetails = async (intakeId: string) => {
  const response = await axios.get(`/api/intake/single/${intakeId}`);
  if (!response.data) {
    throw new Error('Intake not found');
  }
  return response.data;
};

export default function IntakeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: intakeData, isLoading, isError, error } = useQuery<any>({
    queryKey: ['intakeEdit', id],
    queryFn: () => fetchIntakeDetails(id!),
    enabled: !!id,
  });

  const handleFormSubmit = async (data: IntakeFormValues) => {
    if (!id) {
      toast.error("Intake ID is missing. Cannot update intake.");
      return;
    }
    try {
      const response = await axios.put(`/api/intake/${id}/update-data`, data);
      if (response.data.success) {
        toast.success("Intake updated successfully!");
        navigate('/clients'); // Navigate back to clients list after successful update
      } else {
        toast.error(response.data.message || "Failed to update intake.");
      }
    } catch (error: any) {
      console.error("Error updating intake:", error);
      toast.error(error.response?.data?.message || "Failed to update intake.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading intake for editing...</p>
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

  if (!intakeData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <p className="text-lg text-muted-foreground">No intake data found for editing.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gradient-primary">Edit Intake</h1>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Intakes
        </Button>
      </div>
      <ManualIntakeForm
        intakeData={intakeData}
        intakeType={intakeData.intakeType || 'Other'}
        onFormSubmit={handleFormSubmit}
        intakeId={id!}
        onBack={() => navigate(-1)} // Provide a back function for the form
      />
    </div>
  );
}
