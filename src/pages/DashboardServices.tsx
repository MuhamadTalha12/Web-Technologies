import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { seedDemoServices } from '@/lib/demo-data';
import { Plus, Edit, Trash2, Star, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;

export default function DashboardServices() {
  const { user, isProvider, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (user && isProvider) {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [user, isProvider]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const success = await seedDemoServices(user!.id);
      if (success) {
        toast({
          title: 'Demo data added!',
          description: 'Sample services have been added to your account.',
        });
        fetchServices();
      } else {
        throw new Error('Failed to seed data');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add demo data',
      });
    } finally {
      setSeeding(false);
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;

      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, is_active: !currentStatus } : s))
      );

      toast({
        title: currentStatus ? 'Service deactivated' : 'Service activated',
        description: currentStatus
          ? 'Your service is now hidden from customers'
          : 'Your service is now visible to customers',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update service',
      });
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', serviceId);

      if (error) throw error;

      setServices((prev) => prev.filter((s) => s.id !== serviceId));

      toast({
        title: 'Service deleted',
        description: 'Your service has been permanently deleted',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete service',
      });
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isProvider) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="font-display text-2xl font-bold mb-2">Provider Access Only</h1>
          <p className="text-muted-foreground mb-6">
            You need to be a service provider to access this page.
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
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">My Services</h1>
            <p className="text-muted-foreground">Manage your service listings</p>
          </div>
          <div className="flex gap-3">
            {services.length === 0 && (
              <Button variant="outline" onClick={handleSeedDemoData} disabled={seeding}>
                <Sparkles className="h-4 w-4 mr-2" />
                {seeding ? 'Adding...' : 'Add Demo Services'}
              </Button>
            )}
            <Button asChild>
              <Link to="/dashboard/services/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Link>
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="text-center py-16">
              <CardContent>
                <div className="text-6xl mb-4">📦</div>
                <h3 className="font-display text-xl font-semibold mb-2">No services yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start offering your services to customers
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={handleSeedDemoData} disabled={seeding}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {seeding ? 'Adding...' : 'Add Demo Services'}
                  </Button>
                  <Button asChild>
                    <Link to="/dashboard/services/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Service
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service, index) => {
              const category = SERVICE_CATEGORIES.find((c) => c.value === service.category);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`relative ${!service.is_active ? 'opacity-60' : ''}`}>
                    {service.image_url && (
                      <div className="h-32 overflow-hidden rounded-t-lg">
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{category?.icon || '📦'}</span>
                          <Badge variant={service.is_active ? 'default' : 'secondary'}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <span className="font-bold text-lg">${service.price}</span>
                      </div>
                      <CardTitle className="text-lg mt-2">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {service.description}
                      </p>

                      {service.rating && service.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm mb-4">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{Number(service.rating).toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({service.total_reviews} reviews)
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link to={`/dashboard/services/${service.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleServiceStatus(service.id, service.is_active || false)}
                        >
                          {service.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
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
                                Are you sure you want to delete "{service.title}"? This action cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteService(service.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
