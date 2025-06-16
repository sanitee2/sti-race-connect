"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { Calendar, Users, Trophy, Clock, MapPin, Star, ChevronRight, BarChart, ArrowRight, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { EventCard } from '@/components/EventCard';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to appropriate dashboard
    if (status === 'authenticated' && session?.user?.role) {
      const role = session.user.role;
      switch (role) {
        case 'Marshal':
          router.push('/dashboard');
          break;
        case 'Admin':
          router.push('/admin');
          break;
        case 'Runner':
          router.push('/runner-dashboard');
          break;
        default:
          router.push('/dashboard');
          break;
      }
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, don't render the landing page (redirect is happening)
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section - Modern Design */}
      <section className="pt-12 md:pt-24 pb-24 md:pb-32 overflow-hidden relative bg-gradient-to-b from-primary to-primary/80 text-primary-foreground">
        {/* Background sporty elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-secondary/20 blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-secondary/20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/noise.png')] opacity-[0.03] pointer-events-none"></div>
        </div>
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="inline-block bg-white/10 text-primary-foreground rounded-full px-4 py-1.5 text-sm font-bold">
                Race Event Management Solution
              </div>
              <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary-foreground">
                Simplify Your <span className="text-secondary relative">
                  Race Event
                  <span className="absolute bottom-2 left-0 w-full h-2 bg-secondary/30 -z-10 rounded-full"></span>
                </span> Management
              </h1>
              <p className="text-lg text-primary-foreground/90 max-w-xl">
                The complete platform for organizing running events, managing participants, and tracking results in one seamless experience.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link 
                  href="/auth/register" 
                  className="bg-secondary text-white px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-secondary/90 hover-scale"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight size={16} />
                </Link>
                <Link 
                  href="#demo" 
                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-primary-foreground px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover-scale"
                >
                  Watch Demo
                </Link>
              </div>
              
              <div className="flex items-center gap-4 pt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white/20 bg-primary-foreground/10 flex items-center justify-center overflow-hidden shadow-md">
                      <span className="text-xs font-bold text-primary-foreground/80">#{i}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground/80">Trusted by 500+ organizers</p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-xs text-primary-foreground/70 ml-1">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute -z-10 w-[600px] h-[600px] sporty-gradient opacity-20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative w-full max-w-2xl h-[500px] rounded-2xl overflow-hidden shadow-2xl mx-auto hover-scale transition-all duration-700">
                <Image
                  src="/assets/login_page.jpg" 
                  alt="Race Connect Dashboard"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Floating UI elements for visual interest */}
                <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-border dark:bg-background/80">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">Marathon 2024</h3>
                      <p className="text-sm text-muted-foreground">Registration opens in 3 days</p>
                    </div>
                    <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm pulse-effect">
                      Trending Event
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-6 right-6 bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border dark:bg-background/80 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 pulse-effect"></div>
                  <span className="text-xs font-bold text-foreground">Live Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add a client logos section similar to the image */}
      <section className="py-10 bg-background border-b border-border">
        <div className="container mx-auto px-6">
          <h3 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">Trusted by industry leaders</h3>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                <div className="w-24 h-8 bg-muted rounded-md flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">PARTNER {i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights - Modern Card Design */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              All-In-One Solution
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-foreground">Everything You Need to Run Successful Events</h2>
            <p className="text-lg text-muted-foreground">
              From registration to results, our platform streamlines every aspect of race event management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Participant Management",
                description: "Register, organize, and communicate with your participants effortlessly.",
                icon: <Users className="h-6 w-6 text-primary" />
              },
              {
                title: "Event Scheduling",
                description: "Create and manage multiple events with customized categories and schedules.",
                icon: <Calendar className="h-6 w-6 text-primary" />
              },
              {
                title: "Results Tracking",
                description: "Real-time results and instant rankings for all participants and categories.",
                icon: <Trophy className="h-6 w-6 text-primary" />
              },
              {
                title: "Timing Integration",
                description: "Seamless integration with RFID systems for accurate race timing.",
                icon: <Clock className="h-6 w-6 text-primary" />
              },
              {
                title: "Location Management",
                description: "Organize venues, track routes, and provide detailed maps to participants.",
                icon: <MapPin className="h-6 w-6 text-primary" />
              },
              {
                title: "Analytics Dashboard",
                description: "Comprehensive data insights to help improve your events.",
                icon: <BarChart className="h-6 w-6 text-primary" />
              },
            ].map((feature, index) => (
              <div key={index} className="bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all p-6 group">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <Link 
                  href="#" 
                  className="text-primary hover:text-primary/80 font-medium flex items-center text-sm group-hover:underline"
                >
                  Learn more
                  <ChevronRight size={16} className="ml-1 group-hover:ml-2 transition-all" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Showcase Section - Modern Cards */}
      <section id="events" className="py-24 bg-white dark:bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              Upcoming Events
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Join Our Next Running Events</h2>
            <p className="text-lg text-muted-foreground">
              Discover and register for upcoming races powered by STI Race Connect
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                id: "1",
                event_name: "City Marathon 2024",
                description: "Join us for the premier running event in Metro Manila.",
                date: "June 15, 2024",
                location: "Metro Manila",
                image_url: "/assets/login_page.jpg",
                categories: ["5K", "10K", "21K"],
                status: "upcoming" as const,
                organizer: "Metro Running Club",
                participants: 1240
              },
              {
                id: "2",
                event_name: "Coastal Trail Run",
                description: "Experience the beauty of nature with this challenging trail run.",
                date: "July 22, 2024",
                location: "Batangas",
                image_url: "/assets/login_page.jpg",
                categories: ["Trail 12K", "Trail 25K"],
                status: "active" as const,
                organizer: "Trail Blazers PH",
                participants: 850
              },
              {
                id: "3",
                event_name: "STI College Fun Run",
                description: "A fun community event for all STI students and alumni.",
                date: "August 8, 2024",
                location: "Multiple STI Campuses",
                image_url: "/assets/login_page.jpg",
                categories: ["3K", "5K"],
                status: "upcoming" as const,
                organizer: "STI Events Committee",
                participants: 620
              }
            ].map((event) => (
              <EventCard 
                key={event.id}
                {...event}
              />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/events"
              className="inline-flex items-center gap-2 bg-card border border-border hover:border-primary/50 text-foreground hover:text-primary px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse All Events
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Modern */}
      <section id="about" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              Testimonials
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-foreground">What Our Users Say</h2>
            <p className="text-lg text-muted-foreground">
              Race directors, organizers, and participants share their experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Miguel Santos",
                role: "Race Director, Manila Marathon",
                quote: "STI Race Connect simplified our event management process. Registration, timing, and results reporting used to take a team of 5 people. Now we manage it all in one platform.",
                stars: 5,
                avatar: "/assets/login_page.jpg"
              },
              {
                name: "Jessica Reyes",
                role: "Runner",
                quote: "I love how easy it is to find and register for events. The mobile experience is seamless and I can easily track my results after the race.",
                stars: 5,
                avatar: "/assets/login_page.jpg"
              },
              {
                name: "Antonio Cruz",
                role: "Event Manager, Corporate Run Series",
                quote: "The analytics dashboard helps us understand our audience better and improve our events year after year. Highly recommended for serious event organizers.",
                stars: 4,
                avatar: "/assets/login_page.jpg"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-card rounded-xl p-8 shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex mb-6">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.stars ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} 
                    />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-border">
                    <Image 
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Design */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 bottom-0 -mr-40 -mb-40 w-[500px] h-[500px] border-2 border-white/20 rounded-full"></div>
          <div className="absolute left-0 top-0 -ml-40 -mt-40 w-[500px] h-[500px] border-2 border-white/20 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-card rounded-2xl p-10 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="font-sans text-3xl md:text-4xl font-bold mb-4 text-foreground">Ready to Transform Your Running Events?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join STI Race Connect today and take your event management to the next level.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-lg font-medium transition-all inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>Get Started For Free</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                href="/auth/login" 
                className="border border-border hover:border-primary/50 text-foreground hover:text-primary px-8 py-3.5 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

