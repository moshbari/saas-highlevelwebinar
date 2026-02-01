import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { UserManagementTable } from '@/components/users/UserManagementTable';

export default function AppSettings() {
  const navigate = useNavigate();
  const { trialDays, isLoading, updateTrialDays, isUpdating } = useAppSettings();
  const [newTrialDays, setNewTrialDays] = useState<number>(trialDays);

  const handleSaveTrialDays = () => {
    if (newTrialDays !== trialDays) {
      updateTrialDays(newTrialDays);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/laboratory')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">App Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagementTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trial Settings</CardTitle>
                  <CardDescription>Configure the default trial period for new users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="space-y-2 flex-1 max-w-xs">
                      <Label htmlFor="trialDays">Trial Period (Days)</Label>
                      <Input
                        id="trialDays"
                        type="number"
                        min={1}
                        max={365}
                        value={newTrialDays}
                        onChange={e => setNewTrialDays(parseInt(e.target.value) || 14)}
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      onClick={handleSaveTrialDays}
                      disabled={isUpdating || newTrialDays === trialDays}
                    >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    New users will receive a {newTrialDays}-day free trial upon registration.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
