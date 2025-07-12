import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface SummaryReport {
  clientGrowth: { value: string; period: string };
  caseResolution: { value: string; description: string };
  revenue: { value: string; period: string };
}

const fetchSummaryReports = async (): Promise<SummaryReport> => {
  const response = await fetch('/api/reports/summary');
  if (!response.ok) {
    throw new Error('Failed to fetch summary reports');
  }
  return response.json();
};

export default function Reports() {
  const { data: summary, isLoading, isError, error } = useQuery<SummaryReport>({
    queryKey: ['summaryReports'],
    queryFn: fetchSummaryReports,
  });

  if (isLoading) return <div>Loading reports...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  if (!summary) return <div>No summary data available.</div>;
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance insights and data analytics</p>
        </div>
        <Button variant="legal">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="legal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Client Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold">+23%</p>
              <p className="text-sm text-muted-foreground">vs last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="legal-card">
          <CardHeader>
            <CardTitle>Case Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold">87%</p>
              <p className="text-sm text-muted-foreground">Success rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="legal-card">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold">$45,230</p>
              <p className="text-sm text-muted-foreground">This month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="legal-card">
        <CardHeader>
          <CardTitle>Case Analytics</CardTitle>
          <CardDescription>Detailed breakdown of your legal practice performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded">
            <p className="text-muted-foreground">Chart visualization would go here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}