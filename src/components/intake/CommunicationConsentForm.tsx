import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { IntakeFormValues } from '@/lib/intakeSchema';

const CommunicationConsentForm: React.FC = () => {
  const { control, watch } = useFormContext<IntakeFormValues>();
  const needsInterpreter = watch('communicationPreferences.needsInterpreter');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Communication Preferences & Consents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="communicationPreferences.preferredMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Communication Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Text">Text</SelectItem>
                  <SelectItem value="Mail">Mail</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="communicationPreferences.languagePreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language Preference</FormLabel>
              <FormControl>
                <Input placeholder="e.g., English, Spanish" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="communicationPreferences.needsInterpreter"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Do you need an interpreter?</FormLabel>
              </div>
            </FormItem>
          )}
        />
        {needsInterpreter && (
          <FormField
            control={control}
            name="communicationPreferences.interpreterLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interpreter Language</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Spanish, Mandarin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={control}
          name="communicationPreferences.bestTimeToCall"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Best Time to Call</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 9 AM - 5 PM EST" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="communicationPreferences.timeZone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Zone</FormLabel>
              <FormControl>
                <Input placeholder="e.g., EST, PST" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="communicationPreferences.communicationNotes"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Communication Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any other notes regarding communication" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h4 className="font-medium mt-6">Consents and Agreements</h4>
      <div className="space-y-4">
        <FormField
          control={control}
          name="consents.attorneyClientAgreement.signed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I agree to the Attorney-Client Agreement</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="consents.privacyPolicy.accepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I accept the Privacy Policy</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="consents.backgroundCheck.authorized"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I authorize a background check</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="consents.documentSharing.authorized"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I authorize document sharing with relevant parties</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default CommunicationConsentForm;
