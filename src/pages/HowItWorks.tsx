import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Calendar, Star, Shield, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Search,
    title: 'Search & Discover',
    description: 'Browse through our extensive catalog of verified service providers. Filter by category, location, rating, and price to find exactly what you need.',
    details: ['Smart search with filters', 'Category-based browsing', 'View ratings and reviews'],
  },
  {
    icon: MessageSquare,
    title: 'Connect & Communicate',
    description: 'Review provider profiles, check their portfolio, and read customer reviews. Contact providers directly to discuss your project requirements.',
    details: ['Detailed provider profiles', 'Direct messaging', 'Portfolio showcase'],
  },
  {
    icon: Calendar,
    title: 'Book & Schedule',
    description: 'Once you\'ve found the right provider, book their services with our easy scheduling system. Choose your preferred date and time.',
    details: ['Flexible scheduling', 'Instant booking confirmation', 'Calendar integration'],
  },
  {
    icon: Star,
    title: 'Complete & Review',
    description: 'After your service is completed, leave a review to help other customers. Your feedback helps maintain quality in our community.',
    details: ['Quality assurance', 'Review system', 'Community feedback'],
  },
];

const benefits = [
  {
    icon: Shield,
    title: 'Verified Providers',
    description: 'All service providers go through a verification process to ensure quality and reliability.',
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Get responses from providers within hours. No more waiting days for a reply.',
  },
  {
    icon: CheckCircle,
    title: 'Satisfaction Guaranteed',
    description: 'We stand behind the quality of work delivered by our service providers.',
  },
];

export default function HowItWorks() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-muted/30 py-16 md:py-24 border-b border-border">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              How LocalConnect Works
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find and book services from trusted local professionals in just a few simple steps
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/services">
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="text-4xl font-display font-bold text-primary/20">
                      0{index + 1}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">{step.title}</h2>
                  <p className="text-muted-foreground mb-6">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center">
                    <step.icon className="h-24 w-24 text-primary/20" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Why Choose LocalConnect?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing the best experience for both customers and service providers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background p-8 rounded-2xl border border-border text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 gradient-primary">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers and service providers on LocalConnect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/services">Browse Services</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/signup?role=provider">Become a Provider</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
