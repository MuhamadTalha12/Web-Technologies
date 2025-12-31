import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ServiceCard } from '@/components/services/ServiceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SERVICE_CATEGORIES, ITEMS_PER_PAGE } from '@/lib/constants';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  created_at?: string;
};

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'created_at';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    fetchServices();
  }, [searchQuery, category, sortBy, page]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (category && SERVICE_CATEGORIES.some((c) => c.value === category)) {
        params.set('category', category);
      }
      params.set('sort', sortBy);
      params.set('page', String(page));
      params.set('limit', String(ITEMS_PER_PAGE));

      const data = await api<{ items: Service[]; total: number }>('/services?' + params.toString(), {
        method: 'GET',
        auth: false,
      });

      setServices(data.items || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasActiveFilters = searchQuery || category || sortBy !== 'created_at';

  return (
    <Layout>
      {/* Header */}
      <section className="bg-muted/30 py-8 md:py-12 border-b border-border">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Browse Services</h1>
            <p className="text-muted-foreground">
              Discover talented professionals ready to help with your next project
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 flex gap-3"
          >
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => updateSearchParams('search', e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary text-primary-foreground' : ''}
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border bg-background overflow-hidden"
          >
            <div className="container py-6">
              <div className="flex flex-wrap gap-4">
                <Select value={category || 'all'} onValueChange={(val) => updateSearchParams('category', val === 'all' ? '' : val)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(val) => updateSearchParams('sort', val)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Newest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="container pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                Search: {searchQuery}
                <button onClick={() => updateSearchParams('search', '')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                {SERVICE_CATEGORIES.find((c) => c.value === category)?.label}
                <button onClick={() => updateSearchParams('category', '')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      <section className="container py-8 md:py-12">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${totalCount} services found`}
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => updateSearchParams('page', String(page - 1))}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => updateSearchParams('page', String(pageNum))}
                        isActive={page === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => updateSearchParams('page', String(page + 1))}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </Layout>
  );
}
