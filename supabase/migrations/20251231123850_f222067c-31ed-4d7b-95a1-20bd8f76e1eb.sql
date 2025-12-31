-- Create storage buckets for avatars and service images
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for service images
CREATE POLICY "Service images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'service-images');

CREATE POLICY "Providers can upload service images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Providers can update their service images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Providers can delete their service images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add admin SELECT policy for services (admins can see all services including inactive)
CREATE POLICY "Admins can view all services"
ON public.services FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add admin UPDATE policy for services
CREATE POLICY "Admins can update any service"
ON public.services FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Add admin DELETE policy for services
CREATE POLICY "Admins can delete any service"
ON public.services FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add admin policies for bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all bookings"
ON public.bookings FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Add admin policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (has_role(auth.uid(), 'admin'));