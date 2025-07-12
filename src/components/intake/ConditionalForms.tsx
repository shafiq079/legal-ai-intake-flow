import React from 'react';
import { useFormContext } from 'react-hook-form';
import { IntakeFormValues } from '@/lib/intakeSchema';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const ImmigrationInfoForm: React.FC = () => {
  const { control } = useFormContext<IntakeFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Immigration Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="immigrationInfo.currentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Status</FormLabel>
              <FormControl>
                <Input placeholder="e.g., H1B, Green Card, Citizen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="immigrationInfo.visaType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visa Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., F1, J1, B2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="immigrationInfo.visaExpiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visa Expiry Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
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
          control={control}
          name="immigrationInfo.arrivalDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arrival Date (U.S.)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="immigrationInfo.portOfEntry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port of Entry</FormLabel>
              <FormControl>
                <Input placeholder="e.g., JFK, LAX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h4 className="font-medium mt-6">Family Information (Spouse)</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="immigrationInfo.spouse.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spouse's Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="immigrationInfo.spouse.citizenship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spouse's Citizenship</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="immigrationInfo.spouse.immigrationStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spouse's Immigration Status</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="immigrationInfo.spouse.dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spouse's Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="immigrationInfo.spouse.marriageDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marriage Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="immigrationInfo.spouse.marriageLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marriage Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Children and Parents can be added similarly using useFieldArray */}
      <p className="text-sm text-muted-foreground mt-4">Additional fields for children, parents, travel history, and immigration history can be added here.</p>
    </div>
  );
};

const CriminalHistoryForm: React.FC = () => {
  const { control, watch } = useFormContext<IntakeFormValues>();
  const hasArrestHistory = watch('criminalHistory.hasArrestHistory');
  const hasConvictions = watch('criminalHistory.hasConvictions');
  const hasPendingCharges = watch('criminalHistory.hasPendingCharges');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Criminal History</h3>
      <FormField
        control={control}
        name="criminalHistory.hasArrestHistory"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Do you have any arrest history?</FormLabel>
            </div>
          </FormItem>
        )}
      />
      {hasArrestHistory && (
        <div className="space-y-4 pl-8 border-l-2 border-gray-200">
          <p className="text-sm text-muted-foreground">Please provide details of your arrests.</p>
          {/* Dynamic fields for arrests can be added here using useFieldArray */}
          <FormField
            control={control}
            name="criminalHistory.arrests.0.date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arrest Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="criminalHistory.arrests.0.charges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Charges</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., DUI, Assault" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={control}
        name="criminalHistory.hasConvictions"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Do you have any convictions?</FormLabel>
            </div>
          </FormItem>
        )}
      />
      {hasConvictions && (
        <div className="space-y-4 pl-8 border-l-2 border-gray-200">
          <p className="text-sm text-muted-foreground">Please provide details of your convictions.</p>
          {/* Dynamic fields for convictions can be added here using useFieldArray */}
          <FormField
            control={control}
            name="criminalHistory.convictions.0.date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conviction Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="criminalHistory.convictions.0.charge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Charge</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Grand Theft Auto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={control}
        name="criminalHistory.hasPendingCharges"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Do you have any pending charges?</FormLabel>
            </div>
          </FormItem>
        )}
      />
      {hasPendingCharges && (
        <div className="space-y-4 pl-8 border-l-2 border-gray-200">
          <p className="text-sm text-muted-foreground">Please provide details of your pending charges.</p>
          {/* Dynamic fields for pending charges can be added here using useFieldArray */}
          <FormField
            control={control}
            name="criminalHistory.pendingCharges.0.charge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Charge</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Misdemeanor Assault" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

const FinancialInfoForm: React.FC = () => {
  const { control } = useFormContext<IntakeFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Financial Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="financialInfo.annualIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Income</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 75000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="financialInfo.employmentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Status</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Employed, Unemployed, Self-employed" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="financialInfo.employer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employer</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tech Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="financialInfo.jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="financialInfo.employmentDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Duration</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 5 years" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h4 className="font-medium mt-6">Assets</h4>
      <p className="text-sm text-muted-foreground">Please list your significant assets (e.g., properties, bank accounts, investments).</p>
      {/* Dynamic fields for assets can be added here using useFieldArray */}
      <FormField
        control={control}
        name="financialInfo.assets.0.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Asset Type</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Real Estate, Savings Account" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="financialInfo.assets.0.value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Value</FormLabel>
            <FormControl>
              <Input type="number" placeholder="e.g., 250000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h4 className="font-medium mt-6">Liabilities</h4>
      <p className="text-sm text-muted-foreground">Please list your significant liabilities (e.g., mortgages, credit card debts, loans).</p>
      {/* Dynamic fields for liabilities can be added here using useFieldArray */}
      <FormField
        control={control}
        name="financialInfo.liabilities.0.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Liability Type</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Mortgage, Student Loan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="financialInfo.liabilities.0.amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input type="number" placeholder="e.g., 150000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h4 className="font-medium mt-6">Banking Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="financialInfo.bankingInfo.bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="financialInfo.bankingInfo.accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Checking, Savings" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="financialInfo.bankingInfo.routingNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Routing Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="financialInfo.bankingInfo.accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number (Last 4 digits)</FormLabel>
              <FormControl>
                <Input placeholder="XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

const ConditionalForms: React.FC = () => {
  const { watch } = useFormContext<IntakeFormValues>();
  const caseType = watch('caseInfo.caseType');

  return (
    <>
      {caseType === 'Immigration' && <ImmigrationInfoForm />}
      {caseType === 'Criminal' && <CriminalHistoryForm />}
      {caseType === 'Civil' && <FinancialInfoForm />}
      {caseType === 'Business' && <FinancialInfoForm />}
    </>
  );
};

export default ConditionalForms;
