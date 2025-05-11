"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { Calendar, Users, Trophy, Clock, MapPin, Star, ChevronRight, BarChart, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { EventCard } from '@/components/EventCard';

export default function Home() {
  // We don't need mobileMenuOpen state anymore as it's managed in the Header component
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Modern Design */}
      <section className="pt-32 md:pt-44 pb-24 md:pb-32 overflow-hidden relative">
        {/* Background sporty elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-bold">
                Race Event Management Solution
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                Simplify Your <span className="text-primary relative">
                  Race Event
                  <span className="absolute bottom-2 left-0 w-full h-2 bg-secondary/30 -z-10 rounded-full"></span>
                </span> Management
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                The complete platform for organizing running events, managing participants, and tracking results in one seamless experience.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link 
                  href="/auth/register" 
                  className="bg-secondary text-secondary-foreground px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-secondary/90 hover-scale"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight size={16} />
                </Link>
                <Link 
                  href="#demo" 
                  className="bg-white border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-gray-700 px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover-scale"
                >
                  Watch Demo
                </Link>
              </div>
              
              <div className="flex items-center gap-4 pt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-md">
                      <span className="text-xs font-bold text-gray-500">#{i}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Trusted by 500+ organizers</p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">4.9/5</span>
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
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">Marathon 2024</h3>
                      <p className="text-sm text-gray-600">Registration opens in 3 days</p>
                    </div>
                    <div className="bg-secondary text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm pulse-effect">
                      Trending Event
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/20 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 pulse-effect"></div>
                  <span className="text-xs font-bold">Live Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands/Sponsors Section */}
      <section className="border-y border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">TRUSTED BY LEADING ORGANIZATIONS</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-24 h-8 bg-gray-300 rounded-md flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">SPONSOR {i}</span>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Everything You Need to Run Successful Events</h2>
            <p className="text-lg text-gray-600">
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
              <div key={index} className="bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all p-6 group">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 mb-4">
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
      <section id="events" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              Upcoming Events
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Join Our Next Running Events</h2>
            <p className="text-lg text-gray-600">
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
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-primary/50 text-gray-800 hover:text-primary px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse All Events
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Modern */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">What Our Users Say</h2>
            <p className="text-lg text-gray-600">
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
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex mb-6">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-gray-200">
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
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
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
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-10 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Transform Your Running Events?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join STI Race Connect today and take your event management to the next level.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-lg font-medium transition-all inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>Get Started For Free</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                href="/auth/login" 
                className="border border-gray-300 hover:border-primary/50 text-gray-700 hover:text-primary px-8 py-3.5 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
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

