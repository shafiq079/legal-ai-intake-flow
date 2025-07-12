import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Copy, Check, Trash2, ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AdminIntakeLinkManager() {
  const [intakeType, setIntakeType] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();

  const { data: intakeLinks, isLoading: isLoadingLinks, error: linksError } = useQuery({
    queryKey: ['intakeLinks'],
    queryFn: async () => {
      const response = await axios.get('/api/intake/links');
      return response.data.data;
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await axios.post('/api/intake/create-link', { intakeType: type });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedLink(`${import.meta.env.VITE_FRONTEND_URL}/intake/${data.linkId}`);
      toast.success(data.message);
      queryClient.invalidateQueries(['intakeLinks']); // Invalidate to refetch list
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create intake link.';
      toast.error(errorMessage);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const response = await axios.delete(`/api/intake/links/${linkId}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Link deleted successfully.');
      queryClient.invalidateQueries(['intakeLinks']); // Invalidate to refetch list
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete link.';
      toast.error(errorMessage);
    },
  });

  const handleCopyClick = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoadingLinks) return <div>Loading intake links...</div>;
  if (linksError) return <div>Error loading links: {linksError.message}</div>;

  return (
    <div className="flex-1 p-6">
      <Card className="max-w-2xl mx-auto mb-6">
        <CardHeader>
          <CardTitle>Generate New Client Intake Link</CardTitle>
          <CardDescription>
            Create a unique public link to share with your client for AI-guided or manual intake.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intakeType">Intake Type</Label>
            <Select onValueChange={setIntakeType} value={intakeType}>
              <SelectTrigger id="intakeType">
                <SelectValue placeholder="Select intake type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Immigration">Immigration</SelectItem>
                <SelectItem value="Criminal">Criminal</SelectItem>
                <SelectItem value="Family">Family Law</SelectItem>
                <SelectItem value="Civil">Civil Litigation</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => createLinkMutation.mutate(intakeType)}
            disabled={!intakeType || createLinkMutation.isLoading}
            className="w-full"
          >
            {createLinkMutation.isLoading ? 'Generating...' : 'Generate Link'}
          </Button>

          {generatedLink && (
            <div className="space-y-2 mt-4 p-4 border rounded-md bg-muted/50">
              <Label>Share this link with your client:</Label>
              <div className="flex items-center space-x-2">
                <Input value={generatedLink} readOnly className="flex-1" />
                <Button onClick={handleCopyClick} size="icon" variant="outline">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button asChild variant="secondary">
                  <Link to={generatedLink} target="_blank">Open Link</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This link is valid for 7 days and for one-time submission.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Existing Intake Links</CardTitle>
          <CardDescription>
            Manage previously generated intake links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {intakeLinks && intakeLinks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intakeLinks.map((link: any) => (
                  <TableRow key={link.linkId}>
                    <TableCell>{link.type}</TableCell>
                    <TableCell>
                      <Link to={`/intake/${link.linkId}`} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                        {link.linkId.substring(0, 8)}...
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={link.status === 'completed' ? 'success' : link.status === 'expired' ? 'destructive' : 'outline'}>
                        {link.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(link.expiresAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteLinkMutation.mutate(link.linkId)}
                        disabled={deleteLinkMutation.isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No intake links generated yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
