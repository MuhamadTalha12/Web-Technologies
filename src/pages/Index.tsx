import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { Search, Star, Shield, Clock, ChevronRight, ArrowRight, Users, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-20 md:py-32">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeInUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Star className="h-4 w-4 fill-primary" /> Trusted by 10,000+ customers
              </span>
            </motion.div>
            
            <motion.h1 
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6"
            >
              Find Expert <span className="text-gradient-primary">Service Providers</span> Near You
            </motion.h1>
            
            <motion.p 
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Connect with skilled professionals in your locality. From web development to consulting, find the perfect match for your project.
            </motion.p>

            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button variant="hero" size="xl" asChild>
                <Link to="/services">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Services
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/signup?role=provider">
                  Become a Provider
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-40 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Popular Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore services across various categories and find exactly what you need
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SERVICE_CATEGORIES.slice(0, 10).map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/services?category=${category.value}`}
                  className="group flex flex-col items-center p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</span>
                  <span className="font-medium text-sm text-center">{category.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Get started in just a few simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Search, title: 'Search', desc: 'Browse through our curated list of professional service providers' },
              { icon: Users, title: 'Connect', desc: 'Contact providers directly and discuss your project requirements' },
              { icon: Briefcase, title: 'Get It Done', desc: 'Book the service and get your project completed professionally' },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Verified Providers', desc: 'All service providers are verified for quality and reliability' },
              { icon: Star, title: 'Top Rated', desc: 'Choose from providers with excellent reviews and ratings' },
              { icon: Clock, title: 'Quick Response', desc: 'Get responses within hours, not days' },
            ].map((feature, i) => (
              <div key={feature.title} className="flex gap-4 p-6 rounded-2xl bg-muted/30">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-primary">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of customers who have found their perfect service provider through LocalConnect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/signup">
                Create Account
                <ChevronRight className="h-5 w-5 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/services">Browse Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
