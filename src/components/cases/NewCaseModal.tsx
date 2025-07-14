import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const caseSchema = z.object({
  clientId: z.string().optional(), // Make optional, as it might be created on the fly
  newClientFirstName: z.string().optional(),
  newClientLastName: z.string().optional(),
  newClientEmail: z.string().email('Invalid email address').optional(),
  newClientPhone: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  caseType: z.string().min(1, 'Case type is required'),
  priority: z.string().min(1, 'Priority is required'),
}).refine(data => {
  // Custom validation: clientId is required OR all new client fields are required
  if (!data.clientId) {
    return !!data.newClientFirstName && !!data.newClientLastName && !!data.newClientEmail && !!data.newClientPhone;
  }
  return true;
}, {
  message: "Either select an existing client or provide all new client details.",
  path: ["clientId"], // Attach error to clientId field
});

const createClient = async (clientData: { firstName: string; lastName: string; email: string; phone: string }) => {
  const response = await axios.post('/api/clients', {
    personalInfo: { firstName: clientData.firstName, lastName: clientData.lastName },
    contactInfo: { email: clientData.email, phone: clientData.phone },
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};

const fetchClients = async () => {
  const response = await axios.get('/api/clients/list', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};

const createCase = async (newCase: z.infer<typeof caseSchema>) => {
  const response = await axios.post('/api/cases', newCase, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCaseModal = ({ isOpen, onClose }: NewCaseModalProps) => {
  const queryClient = useQueryClient();
  const [isNewClient, setIsNewClient] = useState(false);

  const form = useForm<z.infer<typeof caseSchema>>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      clientId: '',
      newClientFirstName: '',
      newClientLastName: '',
      newClientEmail: '',
      newClientPhone: '',
      title: '',
      description: '',
      caseType: '',
      priority: '',
    },
  });

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clientsList'],
    queryFn: fetchClients,
  });

  const createCaseMutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      onClose();
    },
  });

  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: (data) => {
      // No need to re-submit the form here, it's handled in onSubmit's onSuccess callback
    },
    onError: (error) => {
      console.error('Error creating new client:', error);
      // Handle error, e.g., show a toast notification
    },
  });

  const onSubmit = async (values: z.infer<typeof caseSchema>) => {
    if (isNewClient) {
      // If creating a new client, first create the client
      createClientMutation.mutate({
        firstName: values.newClientFirstName!,
        lastName: values.newClientLastName!,
        email: values.newClientEmail!,
        phone: values.newClientPhone!,
      }, {
        onSuccess: (newClientData) => {
          // After client is created, set the clientId and then create the case
          const updatedValues = { ...values, clientId: newClientData._id };
          createCaseMutation.mutate(updatedValues);
        },
      });
    } else {
      // If selecting an existing client, directly create the case
      createCaseMutation.mutate(values);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new case.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Button
                type="button"
                variant={!isNewClient ? "default" : "outline"}
                onClick={() => setIsNewClient(false)}
                className="flex-1"
              >
                Existing Client
              </Button>
              <Button
                type="button"
                variant={isNewClient ? "default" : "outline"}
                onClick={() => setIsNewClient(true)}
                className="flex-1"
              >
                New Client
              </Button>
            </div>

            {!isNewClient ? (
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingClients ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : (
                          clients?.map((client: { value: string; label: string }) => (
                            <SelectItem key={client.value} value={client.value}>
                              {client.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="newClientFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Client's first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newClientLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Client's last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newClientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Client's email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newClientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Client's phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Case title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Case description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a case type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="immigration">Immigration</SelectItem>
                      <SelectItem value="criminal">Criminal</SelectItem>
                      <SelectItem value="civil">Civil</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCaseMutation.isLoading}>
                {createCaseMutation.isLoading ? 'Creating...' : 'Create Case'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
