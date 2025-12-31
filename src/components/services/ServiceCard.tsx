import { Link } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    duration_hours: number | null;
    location: string | null;
    image_url: string | null;
    rating: number;
    total_reviews: number;
    profiles?: {
      full_name: string;
      avatar_url: string | null;
    };
  };
  index?: number;
}

export function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const category = SERVICE_CATEGORIES.find((c) => c.value === service.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/service/${service.id}`} className="block group">
        <div className="card-interactive overflow-hidden p-0">
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-muted">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-5xl">{category?.icon || '🔧'}</span>
              </div>
            )}
            {/* Category Badge */}
            <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0">
              {category?.icon} {category?.label}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            {/* Provider */}
            {service.profiles && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {service.profiles.full_name.charAt(0)}
                </div>
                <span className="text-sm text-muted-foreground">{service.profiles.full_name}</span>
              </div>
            )}

            {/* Title */}
            <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {service.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {service.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {service.location}
                </span>
              )}
              {service.duration_hours && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {service.duration_hours}h
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <Star
                  className={
                    Number(service.rating ?? 0) > 0
                      ? 'h-4 w-4 fill-warning text-warning transition-transform group-hover:scale-110'
                      : 'h-4 w-4 text-muted-foreground transition-colors transition-transform group-hover:text-primary group-hover:scale-110'
                  }
                />
                <span className="font-medium text-sm transition-colors group-hover:text-primary">
                  {Number(service.rating ?? 0).toFixed(1)}
                </span>
                <span className="text-muted-foreground text-sm transition-colors group-hover:text-primary">
                  ({Number(service.total_reviews ?? 0)})
                </span>
              </div>

              {/* Price */}
              <div className="text-right">
                <span className="text-lg font-bold text-primary">
                  ${Number(service.price).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
