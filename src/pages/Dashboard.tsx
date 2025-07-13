import { useState } from 'react';
import { Users, FolderOpen, FileText, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

const fetchStats = async () => {
  const response = await fetch('/api/dashboard/stats');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const fetchRecentIntakes = async () => {
  const response = await fetch('/api/dashboard/recent-intakes');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const fetchUpcomingDeadlines = async () => {
  const response = await fetch('/api/dashboard/upcoming-deadlines');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats, error: errorStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchStats,
  });

  const { data: recentIntakes, isLoading: isLoadingRecentIntakes, error: errorRecentIntakes } = useQuery({
    queryKey: ['recentIntakes'],
    queryFn: fetchRecentIntakes,
  });

  const { data: upcomingDeadlines, isLoading: isLoadingUpcomingDeadlines, error: errorUpcomingDeadlines } = useQuery({
    queryKey: ['upcomingDeadlines'],
    queryFn: fetchUpcomingDeadlines,
  });

  if (isLoadingStats || isLoadingRecentIntakes || isLoadingUpcomingDeadlines) {
    return <div>Loading dashboard data...</div>;
  }

  if (errorStats || errorRecentIntakes || errorUpcomingDeadlines) {
    return <div>Error loading dashboard data: {errorStats?.message || errorRecentIntakes?.message || errorUpcomingDeadlines?.message}</div>;
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'in-progress':
        return 'bg-primary/10 text-primary';
      case 'started':
        return 'bg-blue-500/10 text-blue-500'; // A new color for 'started'
      case 'abandoned':
        return 'bg-destructive/10 text-destructive';
      case 'converted':
        return 'bg-purple-500/10 text-purple-500'; // A new color for 'converted'
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return 'bg-destructive/10 text-destructive';
      case 'Medium':
        return 'bg-warning/10 text-warning';
      case 'Low':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-l-destructive bg-destructive/5';
      case 'Medium':
        return 'border-l-warning bg-warning/5';
      case 'Low':
        return 'border-l-success bg-success/5';
      default:
        return 'border-l-muted bg-muted/5';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary legal-fade-in">
            Welcome back, {user ? user.profile.firstName : ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your legal practice today.
          </p>
        </div>
        <Button variant="legal" className="legal-fade-in">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Reports
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats?.map((stat, index) => {
          let IconComponent;
          switch (stat.title) {
            case 'Total Clients':
              IconComponent = Users;
              break;
            case 'New Intakes':
              IconComponent = FileText;
              break;
            case 'Active Cases':
              IconComponent = FolderOpen;
              break;
            case 'Pending Documents':
              IconComponent = Clock;
              break;
            default:
              IconComponent = Users; // Default icon
          }
          return (
            <div key={stat.title} className="legal-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <StatsCard {...stat} icon={IconComponent} />
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Intakes */}
        <Card className="legal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Client Intakes
            </CardTitle>
            <CardDescription>
              Latest client intake submissions requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentIntakes.map((intake) => {
              console.log('Intake data in Dashboard.tsx:', intake);
              return (
                <div
                  key={intake.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{intake.clientName}</h4>
                      <Badge variant="outline">{intake.caseType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {intake.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(intake.urgency)}>
                      {intake.urgency}
                    </Badge>
                    <Badge className={getStatusColor(intake.status)}>
                      {intake.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
            <Button variant="outline" className="w-full mt-4">
              View All Intakes
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="legal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>
              Important dates and deadlines for your cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(deadline.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{deadline.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {deadline.type} • {deadline.date}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {deadline.priority}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="legal-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and workflows to streamline your practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="legal" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              New Client Intake
            </Button>
            <Button variant="ai" className="h-20 flex-col gap-2">
              <AlertCircle className="h-6 w-6" />
              AI Document Analysis
            </Button>
            <Button variant="secondary" className="h-20 flex-col gap-2">
              <FolderOpen className="h-6 w-6" />
              Create New Case
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}