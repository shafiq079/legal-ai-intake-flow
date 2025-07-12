import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { IntakeFormValues } from '@/lib/intakeSchema';

const MedicalInfoForm: React.FC = () => {
  const { control, watch } = useFormContext<IntakeFormValues>();
  const hasDisabilities = watch('medicalInfo.hasDisabilities');
  const hasMentalHealthHistory = watch('medicalInfo.mentalHealthHistory.hasHistory');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Medical Information</h3>
      <FormField
        control={control}
        name="medicalInfo.hasDisabilities"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Do you have any disabilities?</FormLabel>
            </div>
          </FormItem>
        )}
      />
      {hasDisabilities && (
        <div className="space-y-4 pl-8 border-l-2 border-gray-200">
          <p className="text-sm text-muted-foreground">Please describe your disabilities and any accommodations needed.</p>
          <FormField
            control={control}
            name="medicalInfo.disabilities.0.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Disability Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Physical, Cognitive" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="medicalInfo.disabilities.0.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe your disability" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="medicalInfo.disabilities.0.accommodationsNeeded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accommodations Needed</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Wheelchair access, Sign language interpreter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={control}
        name="medicalInfo.mentalHealthHistory.hasHistory"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Do you have a mental health history?</FormLabel>
            </div>
          </FormItem>
        )}
      />
      {hasMentalHealthHistory && (
        <div className="space-y-4 pl-8 border-l-2 border-gray-200">
          <p className="text-sm text-muted-foreground">Please provide details about your mental health history and current treatment.</p>
          <FormField
            control={control}
            name="medicalInfo.mentalHealthHistory.details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe your mental health history" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="medicalInfo.mentalHealthHistory.currentTreatment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Are you currently undergoing treatment?</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default MedicalInfoForm;
