import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BOOKING_STATUS, SERVICE_CATEGORIES } from '@/lib/constants';
import { Calendar, Briefcase, Star, Clock, ArrowRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Booking = Tables<'bookings'>;

interface BookingWithDetails extends Booking {
  service?: { title: string; image_url: string | null; category: string } | null;
  customerProfile?: { full_name: string } | null;
  providerProfile?: { full_name: string } | null;
}

export default function Dashboard() {
  const { user, profile, isProvider, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, completedBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Fetch related data
      if (bookingsData && bookingsData.length > 0) {
        const serviceIds = [...new Set(bookingsData.map(b => b.service_id))];
        const customerIds = [...new Set(bookingsData.map(b => b.customer_id))];
        const providerIds = [...new Set(bookingsData.map(b => b.provider_id))];

        const [servicesRes, customersRes, providersRes] = await Promise.all([
          supabase.from('services').select('id, title, image_url, category').in('id', serviceIds),
          supabase.from('profiles').select('id, full_name').in('id', customerIds),
          supabase.from('profiles').select('id, full_name').in('id', providerIds),
        ]);

        const bookingsWithDetails = bookingsData.map(booking => ({
          ...booking,
          service: servicesRes.data?.find(s => s.id === booking.service_id) || null,
          customerProfile: customersRes.data?.find(p => p.id === booking.customer_id) || null,
          providerProfile: providersRes.data?.find(p => p.id === booking.provider_id) || null,
        }));

        setBookings(bookingsWithDetails);

        setStats({
          totalBookings: bookingsData.length,
          pendingBookings: bookingsData.filter((b) => b.status === 'pending').length,
          completedBookings: bookingsData.filter((b) => b.status === 'completed').length,
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getStatusBadge = (status: string) => {
    const config = BOOKING_STATUS[status as keyof typeof BOOKING_STATUS];
    return (
      <Badge variant={config?.color as any || 'secondary'}>
        {config?.label || status}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-muted-foreground">
            {isProvider
              ? 'Manage your services and bookings'
              : 'View your bookings and find new services'}
          </p>
        </motion.div>

        {/* Quick Actions for Providers */}
        {isProvider && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Button asChild>
              <Link to="/dashboard/services/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Service
              </Link>
            </Button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/bookings">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings yet</p>
                  {!isProvider && (
                    <Button asChild className="mt-4">
                      <Link to="/services">Browse Services</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const category = SERVICE_CATEGORIES.find(
                      (c) => c.value === booking.service?.category
                    );
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                          {category?.icon || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {booking.service?.title || 'Unknown Service'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isProvider
                              ? `Customer: ${booking.customerProfile?.full_name || 'Unknown'}`
                              : `Provider: ${booking.providerProfile?.full_name || 'Unknown'}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {getStatusBadge(booking.status)}
                          {booking.scheduled_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(booking.scheduled_date), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
        >
          <Link
            to="/dashboard/bookings"
            className="p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
          >
            <Calendar className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium">All Bookings</p>
            <p className="text-sm text-muted-foreground">View and manage bookings</p>
          </Link>
          <Link
            to="/dashboard/profile"
            className="p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
          >
            <Briefcase className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium">Profile</p>
            <p className="text-sm text-muted-foreground">Update your information</p>
          </Link>
          {isProvider && (
            <Link
              to="/dashboard/services"
              className="p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
            >
              <Star className="h-6 w-6 text-primary mb-2" />
              <p className="font-medium">My Services</p>
              <p className="text-sm text-muted-foreground">Manage your services</p>
            </Link>
          )}
          <Link
            to="/services"
            className="p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
          >
            <ArrowRight className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium">Browse Services</p>
            <p className="text-sm text-muted-foreground">Find new services</p>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
