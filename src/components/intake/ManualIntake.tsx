import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { IntakeFormValues, intakeSchema } from '@/lib/intakeSchema';
import { zodResolver } from "@hookform/resolvers/zod";

interface ManualIntakeProps {
  intakeId: string;
  intakeType: string;
  onComplete: (extractedData: any) => void;
}

type FormData = IntakeFormValues;

const ManualIntake: React.FC<ManualIntakeProps> = ({ intakeId, intakeType, onComplete }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalInfo: {},
      contactInfo: {},
      caseInfo: {},
      immigrationInfo: {},
      criminalHistory: {},
      financialInfo: {},
      medicalInfo: {},
      communicationPreferences: {},
      consents: {
        attorneyClientAgreement: { signed: false },
        privacyPolicy: { accepted: false },
        backgroundCheck: { authorized: false },
        documentSharing: { authorized: false },
      },
    },
  });

  const { data: intakeData, isLoading: isLoadingIntake } = useQuery({
    queryKey: ['intake', intakeId],
    queryFn: async () => {
      const response = await axios.get(`/api/intake/${intakeId}`);
      return response.data;
    },
    enabled: !!intakeId,
  });

  useEffect(() => {
    if (intakeData && intakeData.extractedData) {
      // Populate form with extracted data from the backend
      form.reset(intakeData.extractedData);
    }
  }, [intakeData, form]);

  const updateIntakeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put(`/api/intake/${intakeId}`, { extractedData: data });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Form data saved.');
      // Optionally, trigger onComplete if the form is considered complete
      // onComplete(data.extractedData);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to save form data.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: FormData) => {
    const isValid = await form.trigger(); // Manually trigger validation for all fields

    

    if (!isValid) {
      // This block will catch other validation errors if any
      toast.error("Please correct the errors in the form.");
      return;
    }

    updateIntakeMutation.mutate(data);
  };

  if (isLoadingIntake) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Smart Manual Form Intake</CardTitle>
          <CardDescription>Loading intake form...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Smart Manual Form Intake</CardTitle>
        <CardDescription>
          Fill out the form below for your <span className="font-semibold text-primary">{intakeType}</span> case.
          AI will assist with suggestions and validation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <FormField
              control={form.control}
              name="personalInfo.firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.preferredName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.placeOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Birth</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.ssn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SSN</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.employer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfo.annualIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Income</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-lg font-semibold mt-8">Contact Information</h3>
            <FormField
              control={form.control}
              name="contactInfo.alternatePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alternate Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo.currentAddress.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Address - Street</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo.currentAddress.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Address - City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo.currentAddress.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Address - State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo.currentAddress.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Address - Zip Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo.currentAddress.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Address - Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo.currentAddress.residencyDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Address - Residency Duration</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add more fields for mailingAddress, previousAddresses, emergencyContact */}

            <h3 className="text-lg font-semibold mt-8">Immigration Information</h3>
            <FormField
              control={form.control}
              name="immigrationInfo.currentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Status</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="immigrationInfo.visaType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visa Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="immigrationInfo.visaExpiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visa Expiry Date</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="immigrationInfo.i94Number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I-94 Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="immigrationInfo.arrivalDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arrival Date</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="immigrationInfo.portOfEntry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port of Entry</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add fields for spouse, children, parents, travelHistory, immigrationHistory */}

            <h3 className="text-lg font-semibold mt-8">Criminal History</h3>
            <FormField
              control={form.control}
              name="criminalHistory.hasArrestHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Has Arrest History?</FormLabel>
                  <FormControl>
                    <Input type="checkbox" {...field} checked={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="criminalHistory.hasConvictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Has Convictions?</FormLabel>
                  <FormControl>
                    <Input type="checkbox" {...field} checked={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="criminalHistory.hasPendingCharges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Has Pending Charges?</FormLabel>
                  <FormControl>
                    <Input type="checkbox" {...field} checked={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add fields for arrests, convictions, pendingCharges (arrays will need custom rendering) */}

            <h3 className="text-lg font-semibold mt-8">Financial Information</h3>
            <FormField
              control={form.control}
              name="financialInfo.annualIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Income</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="financialInfo.employmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Status</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="financialInfo.employer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="financialInfo.jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="financialInfo.employmentDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Duration</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add fields for assets, liabilities, bankingInfo */}

            <h3 className="text-lg font-semibold mt-8">Medical Information</h3>
            <FormField
              control={form.control}
              name="medicalInfo.hasDisabilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Has Disabilities?</FormLabel>
                  <FormControl>
                    <Input type="checkbox" {...field} checked={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add fields for disabilities, mentalHealthHistory */}

            <h3 className="text-lg font-semibold mt-8">Communication Preferences</h3>
            <FormField
              control={form.control}
              name="communicationPreferences.preferredMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Method</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="communicationPreferences.languagePreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language Preference</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="communicationPreferences.needsInterpreter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Needs Interpreter?</FormLabel>
                  <FormControl>
                    <Input type="checkbox" {...field} checked={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="communicationPreferences.interpreterLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interpreter Language</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="communicationPreferences.bestTimeToCall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Best Time to Call</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="communicationPreferences.timeZone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Zone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="communicationPreferences.communicationNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Communication Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-lg font-semibold mt-8">Consents</h3>
            <FormField
              control={form.control}
              name="consents.attorneyClientAgreement.signed"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input
                        type="checkbox"
                        id="attorneyClientAgreement"
                        name={field.name}
                        onBlur={field.onBlur}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label htmlFor="attorneyClientAgreement">I agree to the Attorney-Client Agreement</Label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consents.privacyPolicy.accepted"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input
                        type="checkbox"
                        id="privacyPolicy"
                        name={field.name}
                        onBlur={field.onBlur}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label htmlFor="privacyPolicy">I accept the Privacy Policy</Label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consents.backgroundCheck.authorized"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input
                        type="checkbox"
                        id="backgroundCheck"
                        name={field.name}
                        onBlur={field.onBlur}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label htmlFor="backgroundCheck">I authorize a background check</Label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consents.documentSharing.authorized"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input
                        type="checkbox"
                        id="documentSharing"
                        name={field.name}
                        onBlur={field.onBlur}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label htmlFor="documentSharing">I authorize document sharing with relevant parties</Label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={updateIntakeMutation.isLoading}>
              {updateIntakeMutation.isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                'Save Form'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ManualIntake;