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

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  caseType: string;
  status: string;
  intakeDate: string;
  lastContact: string;
  urgency: string;
}

const fetchClients = async (searchQuery: string, statusFilter: string, caseTypeFilter: string) => {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (statusFilter !== 'all') params.append('status', statusFilter);
  if (caseTypeFilter !== 'all') params.append('caseType', caseTypeFilter);

  const response = await fetch(`/api/clients?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const addClient = async (newClient: Omit<Client, 'id'>) => {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newClient),
  });
  if (!response.ok) {
    throw new Error('Failed to add client');
  }
  return response.json();
};

const updateClient = async (updatedClient: Client) => {
  const response = await fetch(`/api/clients/${updatedClient.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedClient),
  });
  if (!response.ok) {
    throw new Error('Failed to update client');
  }
  return response.json();
};

const deleteClient = async (clientId: string) => {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete client');
  }
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


  const { data: clients, isLoading, isError, error } = useQuery<Client[]>({ 
    queryKey: ['clients', searchQuery, statusFilter, caseTypeFilter],
    queryFn: () => fetchClients(searchQuery, statusFilter, caseTypeFilter),
  });

  const addClientMutation = useMutation({
    mutationFn: addClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  if (isLoading) return <div>Loading clients...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-success/10 text-success border-success/20';
      case 'Under Review':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Completed':
        return 'bg-muted text-muted-foreground border-muted';
      case 'On Hold':
        return 'bg-destructive/10 text-destructive border-destructive/20';
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

  const filteredClients = (clients || []).filter(client => {
    const matchesSearch = (client.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (client.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (client.caseType || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesCaseType = caseTypeFilter === 'all' || client.caseType === caseTypeFilter;
    
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
            Manage your clients and track their legal matters
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
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="legal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
                <p className="text-3xl font-bold">{clients.filter(c => c.status === 'Active').length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-3xl font-bold">{filteredClients.filter(c => c.status === 'Under Review').length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">High Urgency</p>
                <p className="text-3xl font-bold">{filteredClients.filter(c => c.urgency === 'High').length}</p>
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
            Search and filter through your client database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name, email, or case type..."
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
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
                <SelectItem value="Criminal Defense">Criminal Defense</SelectItem>
                <SelectItem value="Family Law">Family Law</SelectItem>
                <SelectItem value="Civil Litigation">Civil Litigation</SelectItem>
                <SelectItem value="Business Law">Business Law</SelectItem>
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
                  <TableHead>Intake Date</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                        <div className="text-sm text-muted-foreground">{client.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.caseType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getUrgencyColor(client.urgency)}>
                        {client.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.intakeDate}</TableCell>
                    <TableCell>{client.lastContact}</TableCell>
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

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No clients found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}