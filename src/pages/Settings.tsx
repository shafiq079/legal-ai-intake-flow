import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  caseUpdates: boolean;
}

interface Subscription {
  plan: string;
  price: string;
}

interface Team {
  activeUsers: number;
  availableSeats: number;
}

const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch('/api/users/profile', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  const data = await response.json();
  return data; // Adjust based on your actual API response structure
};

const updateUserProfile = async (profile: UserProfile): Promise<UserProfile> => {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(profile),
  });
  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }
  const data = await response.json();
  return data; // Adjust based on your actual API response structure
};

const fetchNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await fetch('/api/settings/notifications', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch notification settings');
  }
  return response.json();
};

const updateNotificationSettings = async (settings: NotificationSettings): Promise<NotificationSettings> => {
  const response = await fetch('/api/settings/notifications', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error('Failed to update notification settings');
  }
  return response.json();
};

const fetchSubscription = async (): Promise<Subscription> => {
  const response = await fetch('/api/settings/subscription', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch subscription details');
  }
  return response.json();
};

const fetchTeam = async (): Promise<Team> => {
  const response = await fetch('/api/settings/team', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch team details');
  }
  return response.json();
};

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading: isLoadingProfile, isError: isErrorProfile, error: errorProfile } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  const { data: notificationSettings, isLoading: isLoadingNotifications, isError: isErrorNotifications, error: errorNotifications } = useQuery<NotificationSettings>({
    queryKey: ['notificationSettings'],
    queryFn: fetchNotificationSettings,
  });

  const { data: subscription, isLoading: isLoadingSubscription, isError: isErrorSubscription, error: errorSubscription } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
  });

  const { data: team, isLoading: isLoadingTeam, isError: isErrorTeam, error: errorTeam } = useQuery<Team>({
    queryKey: ['team'],
    queryFn: fetchTeam,
  });

  const updateUserProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      alert('Profile updated successfully!');
    },
    onError: (err) => {
      alert(`Failed to update profile: ${err.message}`);
    },
  });

  const updateNotificationSettingsMutation = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
      alert('Notification settings updated successfully!');
    },
    onError: (err) => {
      alert(`Failed to update notification settings: ${err.message}`);
    },
  });

  const handleProfileSave = () => {
    if (userProfile) {
      updateUserProfileMutation.mutate(userProfile);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    if (notificationSettings) {
      updateNotificationSettingsMutation.mutate({
        ...notificationSettings,
        [key]: value,
      });
    }
  };

  if (isLoadingProfile || isLoadingNotifications || isLoadingSubscription || isLoadingTeam) {
    return <div>Loading settings...</div>;
  }

  if (isErrorProfile || isErrorNotifications || isErrorSubscription || isErrorTeam) {
    return <div>Error loading settings: {errorProfile?.message || errorNotifications?.message || errorSubscription?.message || errorTeam?.message}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-primary">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="legal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={userProfile?.firstName || ''} 
                    onChange={(e) => updateUserProfileMutation.mutate({ ...userProfile!, firstName: e.target.value })} 
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={userProfile?.lastName || ''} 
                    onChange={(e) => updateUserProfileMutation.mutate({ ...userProfile!, lastName: e.target.value })} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={userProfile?.email || ''} disabled />
              </div>
              <Button variant="legal" onClick={handleProfileSave}>Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="legal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <Switch 
                  checked={notificationSettings?.emailNotifications || false} 
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Case Updates</p>
                  <p className="text-sm text-muted-foreground">Notifications for case changes</p>
                </div>
                <Switch 
                  checked={notificationSettings?.caseUpdates || false} 
                  onCheckedChange={(checked) => handleNotificationChange('caseUpdates', checked)} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="legal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{subscription?.plan}</p>
                <p className="text-sm text-muted-foreground">{subscription?.price}</p>
                <Button variant="outline" size="sm">Manage Billing</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="legal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{team?.activeUsers} Active Users</p>
                <p className="text-sm text-muted-foreground">{team?.availableSeats} Available Seats</p>
                <Button variant="outline" size="sm">Invite Members</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}