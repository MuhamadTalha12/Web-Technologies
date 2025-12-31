import { supabase } from '@/integrations/supabase/client';

// Demo service data that will be inserted when a provider signs up
export const DEMO_SERVICES = [
  {
    title: 'Full-Stack Web Development',
    description: 'Complete web application development including frontend, backend, and database design. I use modern technologies like React, Node.js, and PostgreSQL to build scalable solutions.',
    category: 'web_development' as const,
    price: 150,
    duration_hours: 40,
    location: 'San Francisco, CA',
    image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
  },
  {
    title: 'Complete UI/UX Design Package',
    description: 'End-to-end UI/UX design including user research, wireframes, prototypes, and final designs in Figma.',
    category: 'ui_ux_design' as const,
    price: 200,
    duration_hours: 30,
    location: 'New York, NY',
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
  },
  {
    title: 'Professional Portrait Photography',
    description: 'Studio or on-location portrait photography for individuals or families. Includes editing and 20 high-resolution photos.',
    category: 'photography' as const,
    price: 250,
    duration_hours: 3,
    location: 'Los Angeles, CA',
    image_url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop',
  },
  {
    title: 'SEO-Optimized Blog Content',
    description: 'High-quality blog posts optimized for search engines. Includes keyword research and meta descriptions.',
    category: 'content_writing' as const,
    price: 75,
    duration_hours: 4,
    location: 'Remote',
    image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
  },
  {
    title: 'React Native Mobile App',
    description: 'Cross-platform mobile app development using React Native. Works on both iOS and Android.',
    category: 'mobile_development' as const,
    price: 3000,
    duration_hours: 160,
    location: 'Seattle, WA',
    image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
  },
  {
    title: 'Logo & Brand Identity Design',
    description: 'Professional logo design with complete brand guidelines including color palette, typography, and usage rules.',
    category: 'graphic_design' as const,
    price: 350,
    duration_hours: 15,
    location: 'New York, NY',
    image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop',
  },
  {
    title: 'Social Media Marketing Strategy',
    description: 'Complete social media strategy with content calendar, post templates, and analytics setup.',
    category: 'digital_marketing' as const,
    price: 500,
    duration_hours: 20,
    location: 'Chicago, IL',
    image_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop',
  },
  {
    title: 'Video Editing & Production',
    description: 'Professional video editing for YouTube, marketing, or social media. Includes color grading and sound design.',
    category: 'video_editing' as const,
    price: 150,
    duration_hours: 8,
    location: 'Remote',
    image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
  },
  {
    title: 'Business Consulting Session',
    description: 'One-on-one consulting for startups and small businesses. Strategy, growth planning, and operational efficiency.',
    category: 'consulting' as const,
    price: 200,
    duration_hours: 2,
    location: 'Remote',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
  },
];

export async function seedDemoServices(providerId: string) {
  const servicesWithProvider = DEMO_SERVICES.map((service, index) => ({
    ...service,
    provider_id: providerId,
    rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
    total_reviews: Math.floor(Math.random() * 50) + 5, // Random 5-55 reviews
    is_active: true,
  }));

  const { error } = await supabase.from('services').insert(servicesWithProvider);
  
  if (error) {
    console.error('Error seeding services:', error);
    return false;
  }
  
  return true;
}
