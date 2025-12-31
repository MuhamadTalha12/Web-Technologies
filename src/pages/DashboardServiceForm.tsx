import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type ServiceCategory = Database['public']['Enums']['service_category'];

export default function DashboardServiceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isProvider, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const isEditing = id && id !== 'new';
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('other');
  const [price, setPrice] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(!!isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && user) {
      fetchService();
    }
  }, [isEditing, user]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('provider_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          variant: 'destructive',
          title: 'Not found',
          description: 'Service not found or you don\'t have permission to edit it',
        });
        navigate('/dashboard/services');
        return;
      }

      setTitle(data.title);
      setDescription(data.description);
      setCategory(data.category);
      setPrice(data.price.toString());
      setDurationHours(data.duration_hours?.toString() || '');
      setLocation(data.location || '');
      setImageUrl(data.image_url || '');
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!price || parseFloat(price) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid price',
        description: 'Please enter a valid price',
      });
      return;
    }

    setSaving(true);

    try {
      const serviceData = {
        title,
        description,
        category,
        price: parseFloat(price),
        duration_hours: durationHours ? parseInt(durationHours) : null,
        location: location || null,
        image_url: imageUrl || null,
        provider_id: user!.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Service updated',
          description: 'Your service has been successfully updated.',
        });
      } else {
        const { error } = await supabase.from('services').insert(serviceData);

        if (error) throw error;

        toast({
          title: 'Service created',
          description: 'Your service has been successfully created.',
        });
      }

      navigate('/dashboard/services');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save service',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isProvider) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/dashboard/services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Service' : 'Create New Service'}</CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Update your service details'
                  : 'Fill in the details to list your service'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Professional Web Development"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your service in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(val) => setCategory(val as ServiceCategory)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="99.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder="Optional"
                      value={durationHours}
                      onChange={(e) => setDurationHours(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add an image URL to make your service more appealing
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? 'Update Service' : 'Create Service'}
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/dashboard/services')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
