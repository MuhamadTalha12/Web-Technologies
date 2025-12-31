import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { Users, Briefcase, Settings, Star, Trash2, Shield, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Tables, Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type Service = Tables<'services'>;
type Profile = Tables<'profiles'>;

interface UserWithRoles extends Profile {
  roles: AppRole[];
}

export default function AdminDashboard() {
  const { user, roles, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = roles.includes('admin');

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        const { data: allRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        if (rolesError) throw rolesError;

        const usersWithRoles = (profiles || []).map(profile => ({
          ...profile,
          roles: allRoles?.filter(r => r.user_id === profile.id).map(r => r.role) || [],
        }));

        setUsers(usersWithRoles);
      } else if (activeTab === 'services') {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setServices(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole, add: boolean) => {
    try {
      if (add) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', newRole);
        if (error) throw error;
      }

      toast({
        title: 'Role updated',
        description: `User role has been ${add ? 'added' : 'removed'}`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update role',
      });
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev =>
        prev.map(s => (s.id === serviceId ? { ...s, is_active: !currentStatus } : s))
      );

      toast({
        title: currentStatus ? 'Service deactivated' : 'Service activated',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', serviceId);
      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast({ title: 'Service deleted' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Shield className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, services, and platform settings</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Services</p>
                  <p className="text-2xl font-bold">{services.filter(s => s.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Providers</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.roles.includes('provider')).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="services">
                <Briefcase className="h-4 w-4 mr-2" />
                Services
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map(userItem => (
                        <div
                          key={userItem.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-border"
                        >
                          <div>
                            <p className="font-medium">{userItem.full_name}</p>
                            <p className="text-sm text-muted-foreground">{userItem.email}</p>
                            <div className="flex gap-2 mt-2">
                              {userItem.roles.map(role => (
                                <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
                                  {role}
                                </Badge>
                              ))}
                              {userItem.roles.length === 0 && (
                                <Badge variant="outline">No roles</Badge>
                              )}
                            </div>
                          </div>
                          <Select
                            onValueChange={(value) => {
                              const [action, role] = value.split(':') as ['add' | 'remove', AppRole];
                              updateUserRole(userItem.id, role, action === 'add');
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Manage roles" />
                            </SelectTrigger>
                            <SelectContent>
                              {!userItem.roles.includes('provider') && (
                                <SelectItem value="add:provider">Add Provider</SelectItem>
                              )}
                              {userItem.roles.includes('provider') && (
                                <SelectItem value="remove:provider">Remove Provider</SelectItem>
                              )}
                              {!userItem.roles.includes('admin') && userItem.id !== user?.id && (
                                <SelectItem value="add:admin">Add Admin</SelectItem>
                              )}
                              {userItem.roles.includes('admin') && userItem.id !== user?.id && (
                                <SelectItem value="remove:admin">Remove Admin</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Service Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {services.map(service => {
                        const category = SERVICE_CATEGORIES.find(c => c.value === service.category);
                        return (
                          <div
                            key={service.id}
                            className={`flex items-center justify-between p-4 rounded-xl border border-border ${
                              !service.is_active ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{category?.icon || '📦'}</span>
                              <div>
                                <p className="font-medium">{service.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  ${service.price} • {category?.label}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={service.is_active ? 'default' : 'secondary'}>
                                {service.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleServiceStatus(service.id, service.is_active || false)}
                              >
                                {service.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this service? This cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteService(service.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Platform settings and configuration options coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}
