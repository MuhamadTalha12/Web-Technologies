import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BOOKING_STATUS, SERVICE_CATEGORIES } from '@/lib/constants';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Calendar, Clock, MapPin, User, DollarSign, Star, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { api } from '@/lib/api';

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
type Booking = {
  id: string;
  service_id: string;
  provider_id: string;
  customer_id: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  total_price: number;
  notes: string | null;
  status: string;
};

interface BookingWithDetails extends Booking {
  service?: { title: string; image_url: string | null; category: string; location: string | null } | null;
  customerProfile?: { full_name: string; email: string } | null;
  providerProfile?: { full_name: string; email: string } | null;
  hasReview?: boolean;
}

export default function DashboardBookings() {
  const { user, isProvider, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const data = await api<{ items: BookingWithDetails[] }>('/bookings', { method: 'GET' });
      setBookings(data.items || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await api(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );

      toast({
        title: 'Status updated',
        description: `Booking status changed to ${BOOKING_STATUS[newStatus].label}`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update booking status',
      });
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
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

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

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
          <h1 className="font-display text-3xl font-bold mb-2">Bookings</h1>
          <p className="text-muted-foreground">
            {isProvider ? 'Manage customer bookings for your services' : 'View your service bookings'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <Card className="text-center py-16">
                  <CardContent>
                    <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2">No bookings found</h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'all'
                        ? "You don't have any bookings yet"
                        : `No ${activeTab.replace('_', ' ')} bookings`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking, index) => {
                    const category = SERVICE_CATEGORIES.find(
                      (c) => c.value === booking.service?.category
                    );
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Service Image/Icon */}
                              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0">
                                {category?.icon || '📦'}
                              </div>

                              {/* Details */}
                              <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      {booking.service?.title || 'Unknown Service'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {isProvider ? (
                                        <>
                                          <User className="h-3 w-3 inline mr-1" />
                                          {booking.customerProfile?.full_name} ({booking.customerProfile?.email})
                                        </>
                                      ) : (
                                        <>
                                          <User className="h-3 w-3 inline mr-1" />
                                          Provider: {booking.providerProfile?.full_name}
                                        </>
                                      )}
                                    </p>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  {booking.scheduled_date && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {format(new Date(booking.scheduled_date), 'MMM d, yyyy')}
                                    </span>
                                  )}
                                  {booking.scheduled_time && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {booking.scheduled_time}
                                    </span>
                                  )}
                                  {booking.service?.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {booking.service.location}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1 font-medium text-foreground">
                                    <DollarSign className="h-4 w-4" />
                                    {booking.total_price}
                                  </span>
                                </div>

                                {booking.notes && (
                                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                                    <strong>Notes:</strong> {booking.notes}
                                  </p>
                                )}

                                {/* Provider Actions */}
                                {isProvider && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                  <div className="flex items-center gap-2 pt-2">
                                    <span className="text-sm text-muted-foreground">Update status:</span>
                                    <Select
                                      value={booking.status}
                                      onValueChange={(val) =>
                                        updateBookingStatus(booking.id, val as BookingStatus)
                                      }
                                    >
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {/* Customer Review Option */}
                                {!isProvider && booking.status === 'completed' && !booking.hasReview && (
                                  <div className="pt-2">
                                    {showReviewForm === booking.id ? (
                                      <ReviewForm
                                        bookingId={booking.id}
                                        serviceId={booking.service_id}
                                        providerId={booking.provider_id}
                                        customerId={booking.customer_id}
                                        onSuccess={() => {
                                          setShowReviewForm(null);
                                          fetchBookings();
                                        }}
                                      />
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowReviewForm(booking.id)}
                                      >
                                        <Star className="h-4 w-4 mr-2" />
                                        Leave a Review
                                      </Button>
                                    )}
                                  </div>
                                )}

                                {/* Already Reviewed Badge */}
                                {!isProvider && booking.status === 'completed' && booking.hasReview && (
                                  <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>You've reviewed this service</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}
