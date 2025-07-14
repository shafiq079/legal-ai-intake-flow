import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, Calendar, Clock, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NewCaseModal } from '@/components/cases/NewCaseModal';

interface Case {
  _id: string;
  title: string;
  clientId: {
    personalInfo: {
      firstName: string;
      lastName: string;
    };
  };
  caseType: string;
  status: 'open' | 'in-progress' | 'under-review' | 'completed' | 'closed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedLawyer: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  description: string;
}

const fetchCases = async (statusFilter: string) => {
  const params = new URLSearchParams();
  if (statusFilter !== 'all') params.append('status', statusFilter);

  const response = await fetch(`/api/cases?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const addCase = async (newCase: Omit<Case, 'id'>) => {
  const response = await fetch('/api/cases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newCase),
  });
  if (!response.ok) {
    throw new Error('Failed to add case');
  }
  return response.json();
};

const updateCase = async (updatedCase: Case) => {
  const response = await fetch(`/api/cases/${updatedCase.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedCase),
  });
  if (!response.ok) {
    throw new Error('Failed to update case');
  }
  return response.json();
};

const deleteCase = async (caseId: string) => {
  const response = await fetch(`/api/cases/${caseId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete case');
  }
};

export default function Cases() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const queryClient = useQueryClient();

  const { data: cases, isLoading, isError, error } = useQuery<Case[]>({ 
    queryKey: ['cases', statusFilter],
    queryFn: () => fetchCases(statusFilter),
  });

  const addCaseMutation = useMutation({
    mutationFn: addCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });

  const updateCaseMutation = useMutation({
    mutationFn: updateCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });

  const deleteCaseMutation = useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });

  if (isLoading) return <div>Loading cases...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const filteredCases = cases?.filter(case_ => statusFilter === 'all' || case_.status === statusFilter) || [];

  const statusCounts = {
    open: cases?.filter(c => c.status === 'open').length || 0,
    inProgress: cases?.filter(c => c.status === 'in-progress').length || 0,
    underReview: cases?.filter(c => c.status === 'under-review').length || 0,
    completed: cases?.filter(c => c.status === 'completed').length || 0,
  };

  const formatStatus = (status: string) => {
    if (!status) return '';
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'under-review':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  

  const handleNavigate = (id: string) => {
    navigate(`/cases/${id}`);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary legal-fade-in">
            Case Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all your legal cases efficiently
          </p>
        </div>
        <Button variant="legal" className="legal-fade-in" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>

      <NewCaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="legal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Cases</p>
                <p className="text-3xl font-bold text-blue-600">{statusCounts.open}</p>
              </div>
              <div className="h-8 w-8 rounded bg-blue-500/10 flex items-center justify-center">
                <FolderOpen className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="legal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{statusCounts.inProgress}</p>
              </div>
              <div className="h-8 w-8 rounded bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="legal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-3xl font-bold text-purple-600">{statusCounts.underReview}</p>
              </div>
              <div className="h-8 w-8 rounded bg-purple-500/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-purple-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="legal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">{statusCounts.completed}</p>
              </div>
              <div className="h-8 w-8 rounded bg-green-500/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Case Board */}
      <Card className="legal-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Case Board</CardTitle>
              <CardDescription>
                Kanban-style view of your legal cases
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCases.map((case_) => (
              <Card key={case_._id} className="legal-hover-lift cursor-pointer" onClick={() => handleNavigate(case_._id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={getStatusColor(case_.status)}>
                      {formatStatus(case_.status)}
                    </Badge>
                    <Badge className={getPriorityColor(case_.priority)}>
                      {case_.priority}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{case_.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {case_.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{`${case_.clientId.personalInfo.firstName} ${case_.clientId.personalInfo.lastName}`}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {case_.assignedLawyer.profile.firstName.charAt(0)}
                        {case_.assignedLawyer.profile.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{`${case_.assignedLawyer.profile.firstName} ${case_.assignedLawyer.profile.lastName}`}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(case_.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{case_.caseType}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCases.length === 0 && (
            <div className="text-center py-8">
              <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No cases found for the selected status</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}