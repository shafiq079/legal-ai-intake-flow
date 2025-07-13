import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Intake {
  _id: string;
  intakeType: string;
  status: string;
  createdAt: string;
  extractedData: {
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    caseInfo: {
      caseType: string;
      urgency: string;
    };
  };
}

const fetchIntakes = async (searchQuery: string, statusFilter: string, caseTypeFilter: string) => {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (statusFilter !== 'all') params.append('status', statusFilter);
  if (caseTypeFilter !== 'all') params.append('caseType', caseTypeFilter);

  const response = await fetch(`/api/intake?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [caseTypeFilter, setCaseTypeFilter] = useState('all');

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleNewClientIntake = async () => {
    try {
      const response = await fetch('/api/intake/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate new intake');
      }

      const data = await response.json();
      const { intakeId } = data;
      navigate(`/ai-intake/${intakeId}`);
    } catch (error: any) {
      console.error('Error initiating new client intake:', error.message);
      alert(`Error: ${error.message}`);
    }
  };


  const { data: intakes, isLoading, isError, error } = useQuery<Intake[]>({ 
    queryKey: ['intakes', searchQuery, statusFilter, caseTypeFilter],
    queryFn: () => fetchIntakes(searchQuery, statusFilter, caseTypeFilter),
  });

  if (isLoading) return <div>Loading intakes...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'in-progress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'abandoned':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'started':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const filteredIntakes = (intakes || []).filter(intake => {
    const clientName = `${intake.extractedData?.personalInfo?.firstName || ''} ${intake.extractedData?.personalInfo?.lastName || ''}`;
    const clientEmail = intake.extractedData?.personalInfo?.email || '';
    const caseType = intake.extractedData?.caseInfo?.caseType || '';

    const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         caseType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || intake.status === statusFilter;
    const matchesCaseType = caseTypeFilter === 'all' || caseType === caseTypeFilter;
    
    return matchesSearch && matchesStatus && matchesCaseType;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary legal-fade-in">
            Client Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your client intakes and track their legal matters
          </p>
        </div>
        <Button variant="legal" className="legal-fade-in" onClick={handleNewClientIntake}>
          <Plus className="h-4 w-4 mr-2" />
          New Client Intake
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="legal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Intakes</p>
                <p className="text-3xl font-bold">{intakes.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="legal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Intakes</p>
                <p className="text-3xl font-bold">{intakes.filter(i => i.status === 'completed').length}</p>
              </div>
              <div className="h-8 w-8 rounded bg-success/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-success"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="legal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress Intakes</p>
                <p className="text-3xl font-bold">{filteredIntakes.filter(i => i.status === 'in-progress' || i.status === 'started').length}</p>
              </div>
              <div className="h-8 w-8 rounded bg-warning/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-warning"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="legal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Urgency Intakes</p>
                <p className="text-3xl font-bold">{filteredIntakes.filter(i => i.extractedData?.caseInfo?.urgency === 'High').length}</p>
              </div>
              <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-destructive"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="legal-card">
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
          <CardDescription>
            Search and filter through your client intake database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search intakes by client name, email, or case type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 legal-input"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="started">Started</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>

            {/* Case Type Filter */}
            <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by case type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Case Types</SelectItem>
                <SelectItem value="Immigration">Immigration</SelectItem>
                <SelectItem value="Criminal">Criminal</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIntakes.map((intake) => (
                  <TableRow key={intake._id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {intake.extractedData?.personalInfo?.firstName}{' '}
                          {intake.extractedData?.personalInfo?.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {intake.extractedData?.personalInfo?.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {intake.extractedData?.personalInfo?.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {intake.extractedData?.caseInfo?.caseType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(intake.status)}>
                        {intake.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getUrgencyColor(intake.extractedData?.caseInfo?.urgency)}>
                        {intake.extractedData?.caseInfo?.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(intake.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredIntakes.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No intakes found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}