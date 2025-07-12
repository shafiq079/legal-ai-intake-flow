import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ExtractedDataDisplayProps {
  extractedData: any;
  intakeType: string;
}

const renderField = (label: string, value: any) => {
  if (value === undefined || value === null || value === '') {
    return null; // Don't render empty fields
  }

  if (typeof value === 'boolean') {
    return (
      <div className="flex justify-between items-center py-2">
        <span className="font-medium text-muted-foreground">{label}:</span>
        <span className="text-right">{value ? 'Yes' : 'No'}</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return (
      <div className="py-2">
        <h4 className="font-semibold text-lg mb-2">{label}:</h4>
        {value.map((item, index) => (
          <div key={index} className="ml-4 border-l-2 pl-4 mb-2 last:mb-0">
            {Object.entries(item).map(([key, val]) => renderField(key, val))}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'object') {
    if (Object.keys(value).length === 0) return null;
    return (
      <div className="py-2">
        <h4 className="font-semibold text-lg mb-2">{label}:</h4>
        <div className="ml-4 border-l-2 pl-4">
          {Object.entries(value).map(([key, val]) => renderField(key, val))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-2">
      <span className="font-medium text-muted-foreground">{label}:</span>
      <span className="text-right break-all">{String(value)}</span>
    </div>
  );
};

const ExtractedDataDisplay: React.FC<ExtractedDataDisplayProps> = ({ extractedData, intakeType }) => {
  if (!extractedData || Object.keys(extractedData).length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Extracted Data Summary</CardTitle>
          <CardDescription>No data extracted yet for this {intakeType} intake.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Once the intake is complete, the extracted information will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Extracted Data Summary</CardTitle>
        <CardDescription>Review the information extracted for your {intakeType} intake.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(extractedData).map(([category, data], index) => (
          <div key={category}>
            <h3 className="text-xl font-bold capitalize mb-2">{category.replace(/([A-Z])/g, ' $1').trim()}</h3>
            {Object.entries(data as Record<string, any>).map(([field, value]) => renderField(field.replace(/([A-Z])/g, ' $1').trim(), value))}
            {index < Object.keys(extractedData).length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExtractedDataDisplay;
