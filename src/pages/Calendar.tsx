import { Calendar as CalendarIcon, Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

interface Event {
  id: string;
  title: string;
  time: string;
  type: string;
  date: string;
}

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
}

const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch('/api/calendar/events');
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

const fetchDeadlines = async (): Promise<Deadline[]> => {
  const response = await fetch('/api/calendar/deadlines');
  if (!response.ok) {
    throw new Error('Failed to fetch deadlines');
  }
  return response.json();
};

export default function Calendar() {
  const { data: events, isLoading: isLoadingEvents, isError: isErrorEvents, error: errorEvents } = useQuery<Event[]>({ 
    queryKey: ['calendarEvents'],
    queryFn: fetchEvents,
  });

  const { data: upcomingDeadlines, isLoading: isLoadingDeadlines, isError: isErrorDeadlines, error: errorDeadlines } = useQuery<Deadline[]>({ 
    queryKey: ['upcomingDeadlines'],
    queryFn: fetchDeadlines,
  });

  if (isLoadingEvents || isLoadingDeadlines) return <div>Loading calendar data...</div>;
  if (isErrorEvents || isErrorDeadlines) return <div>Error: {errorEvents?.message || errorDeadlines?.message}</div>;

  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const todaysEvents = events?.filter(event => event.date === today) || [];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage your schedule and deadlines</p>
        </div>
        <Button variant="legal">
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No events scheduled for today</p>
                  </div>
                ) : (
                  todaysEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-4 p-3 rounded border">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.time}</p>
                      </div>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="legal-card">
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines?.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No upcoming deadlines</p>
                  </div>
                ) : (
                  upcomingDeadlines?.map(deadline => (
                    <div key={deadline.id} className={`p-3 rounded border-l-4 ${getPriorityColor(deadline.priority)}`}>
                      <p className="font-medium">{deadline.title}</p>
                      <p className="text-sm text-muted-foreground">Due: {deadline.dueDate}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}