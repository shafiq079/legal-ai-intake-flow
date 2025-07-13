import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { IntakeFormValues } from '@/lib/intakeSchema';
import { PlusCircledIcon, TrashIcon } from '@radix-ui/react-icons';

const MedicalInfoForm: React.FC = () => {
  const { control, watch } = useFormContext<IntakeFormValues>();
  const hasDisabilities = watch('medicalInfo.hasDisabilities');
  const hasMentalHealthHistory = watch('medicalInfo.mentalHealthHistory.hasHistory');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicalInfo.disabilities',
  });

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
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    // Clear disabilities when checkbox is unchecked
                    while (fields.length > 0) {
                      remove(0);
                    }
                  } else {
                    // Add one empty disability field if checked and no fields exist
                    if (fields.length === 0) {
                      append({ type: '', description: '', accommodationsNeeded: '' });
                    }
                  }
                }}
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
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 border p-4 rounded-md relative">
              <FormField
                control={control}
                name={`medicalInfo.disabilities.${index}.type`}
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
                name={`medicalInfo.disabilities.${index}.description`}
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
                name={`medicalInfo.disabilities.${index}.accommodationsNeeded`}
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
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
                className="absolute top-2 right-2"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ type: '', description: '', accommodationsNeeded: '' })}
            className="mt-2"
          >
            <PlusCircledIcon className="mr-2 h-4 w-4" /> Add Another Disability
          </Button>
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
