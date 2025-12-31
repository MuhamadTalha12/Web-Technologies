import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { Star, MapPin, Clock, Calendar as CalendarIcon, ArrowLeft, User, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { api } from '@/lib/api';

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration_hours: number | null;
  location: string | null;
  image_url: string | null;
  is_active: boolean;
  rating: number | null;
  total_reviews: number | null;
  provider_id: string;
};

type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
};

type Review = {
  id: string;
  booking_id: string;
  service_id: string;
  provider_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  created_at?: string;
};

interface ReviewWithProfile extends Review {
  customerProfile?: Profile | null;
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      fetchService();
      fetchReviews();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const data = await api<{ service: Service; provider: Profile | null }>(`/services/${id}`, {
        method: 'GET',
        auth: false,
      });

      setService(data.service);
      setProvider(data.provider);
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await api<{ items: ReviewWithProfile[] }>(`/services/${id}/reviews?limit=10`, {
        method: 'GET',
        auth: false,
      });
      setReviews(data.items || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please sign in',
        description: 'You need to sign in to book a service',
      });
      navigate('/login');
      return;
    }

    if (!selectedDate) {
      toast({
        variant: 'destructive',
        title: 'Select a date',
        description: 'Please select a date for your booking',
      });
      return;
    }

    setBooking(true);
    try {
      await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          service_id: id!,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: selectedTime || null,
          notes: notes || null,
        }),
      });

      toast({
        title: 'Booking submitted!',
        description: 'The provider will confirm your booking soon.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create booking',
      });
    } finally {
      setBooking(false);
    }
  };

  const categoryInfo = SERVICE_CATEGORIES.find((c) => c.value === service?.category);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="font-display text-2xl font-bold mb-2">Service Not Found</h1>
          <p className="text-muted-foreground mb-6">The service you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/services">Browse Services</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Image */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {categoryInfo?.icon || '📦'}
                </div>
              )}
            </div>

            {/* Title & Category */}
            <div>
              <Badge variant="secondary" className="mb-3">
                {categoryInfo?.icon} {categoryInfo?.label}
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{service.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 group hover:text-primary transition-colors">
                  <Star
                    className={
                      Number(service.rating ?? 0) > 0
                        ? 'h-4 w-4 fill-yellow-400 text-yellow-400 transition-transform group-hover:scale-110'
                        : 'h-4 w-4 text-muted-foreground transition-colors transition-transform group-hover:text-primary group-hover:scale-110'
                    }
                  />
                  {Number(service.rating ?? 0).toFixed(1)} ({Number(service.total_reviews ?? 0)} reviews)
                </span>
                {service.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {service.location}
                  </span>
                )}
                {service.duration_hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.duration_hours} hours
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <h3 className="font-display text-lg font-semibold mb-2">About This Service</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{service.description}</p>
            </div>

            {/* Provider Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={provider?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {provider?.full_name?.[0] || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{provider?.full_name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {provider?.bio || 'No bio available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.customerProfile?.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{review.customerProfile?.full_name || 'Anonymous'}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${service.price}</span>
                  {service.duration_hours && (
                    <span className="text-sm font-normal text-muted-foreground">
                      / {service.duration_hours}hr
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time (optional)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleBooking}
                  className="w-full"
                  size="lg"
                  disabled={booking || service.provider_id === user?.id}
                >
                  {booking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      Book Now
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {service.provider_id === user?.id && (
                  <p className="text-xs text-center text-muted-foreground">
                    You cannot book your own service
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
