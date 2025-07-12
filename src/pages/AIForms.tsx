import { FileText, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

interface Form {
  id: string;
  name: string;
  status: string;
  client: string;
}

const fetchForms = async (): Promise<Form[]> => {
  const response = await fetch('/api/forms');
  if (!response.ok) {
    throw new Error('Failed to fetch forms');
  }
  return response.json();
};

export default function AIForms() {
  const { data: forms, isLoading, isError, error } = useQuery<Form[]>({ 
    queryKey: ['forms'],
    queryFn: fetchForms,
  });

  if (isLoading) return <div>Loading forms...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  if (!forms) return <div>No forms found.</div>;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-primary">Legal Form Generator</h1>
        <p className="text-muted-foreground mt-1">AI-powered legal document generation</p>
      </div>

      <Card className="legal-card">
        <CardHeader>
          <CardTitle>Generated Forms</CardTitle>
          <CardDescription>Forms automatically generated from client intake data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forms.map(form => (
              <div key={form.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{form.name}</p>
                    <p className="text-sm text-muted-foreground">Client: {form.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={form.status === 'Ready' ? 'default' : 'secondary'}>
                    {form.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}