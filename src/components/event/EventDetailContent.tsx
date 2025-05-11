"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EventCard } from '@/components/EventCard';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Share2, 
  ChevronRight, 
  Menu, 
  X, 
  ArrowRight, 
  Award, 
  Info, 
  Phone, 
  Mail, 
  Target, 
  User, 
  DollarSign, 
  AlertCircle, 
  Check, 
  Smartphone,
  Flag,
  BarChart4,
  Heart,
  Facebook,
  Twitter,
  Mail as MailIcon,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

// Mock event data (in a real app, this would come from an API/database fetch)
const mockEvents = [
  {
    id: "1",
    event_name: "City Marathon 2024",
    event_date: new Date("2024-06-15T07:00:00Z"),
    location: "Bonifacio Global City, Taguig",
    target_audience: "Runners of all levels",
    description: "Join us for the premier running event in Metro Manila. The City Marathon offers a scenic route through the heart of the city with various distance categories suitable for beginners and advanced runners alike.",
    created_by: "admin",
    created_at: new Date("2023-12-10"),
    updated_at: new Date("2024-01-15"),
    categories: [
      { id: "1", category_name: "5K Fun Run", description: "Perfect for beginners and casual runners", target_audience: "Casual runners", price: 800, discounted_price: 650 },
      { id: "2", category_name: "10K Run", description: "Intermediate distance for regular runners", target_audience: "Regular runners", price: 1200, discounted_price: 950 },
      { id: "3", category_name: "21K Half Marathon", description: "Challenging half marathon for experienced runners", target_audience: "Experienced runners", price: 1800, discounted_price: 1450 },
      { id: "4", category_name: "42K Full Marathon", description: "Full marathon for elite and experienced runners", target_audience: "Elite runners", price: 2500, discounted_price: 2000 }
    ],
    organizers: [
      { name: "John Doe", role: "Event Director" },
      { name: "Jane Smith", role: "Race Coordinator" }
    ]
  },
  {
    id: "2",
    event_name: "Trail Run Challenge",
    event_date: new Date("2024-07-20T06:30:00Z"),
    location: "La Mesa Eco Park",
    target_audience: "Trail runners",
    description: "Experience the beauty of nature with this challenging trail run through La Mesa Eco Park.",
    created_by: "admin",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-02-10"),
    categories: [
      { id: "1", category_name: "5K Trail", description: "Beginner-friendly trail run", target_audience: "Beginner trail runners", price: 900, discounted_price: 750 },
      { id: "2", category_name: "10K Trail", description: "Intermediate trail challenge", target_audience: "Intermediate trail runners", price: 1300, discounted_price: 1100 },
      { id: "3", category_name: "21K Trail", description: "Advanced trail half-marathon", target_audience: "Advanced trail runners", price: 2000, discounted_price: 1600 }
    ],
    organizers: [
      { name: "Mike Johnson", role: "Trail Director" },
      { name: "Sarah Lee", role: "Race Coordinator" }
    ]
  }
];

export default function EventDetailContent({ eventId }: { eventId: string }) {
  // In a real app, you would fetch the event data based on eventId
  const mockEvent = mockEvents.find(e => e.id === eventId) || mockEvents[0];
  const [selectedCategory, setSelectedCategory] = useState(mockEvent.categories[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back to events link */}
      <div className="pt-28 container mx-auto px-6">
        <Link href="/events" className="inline-flex items-center text-primary hover:text-primary/80 font-medium mb-4 hover:underline underline-offset-4 decoration-secondary decoration-2">
          <ArrowLeft size={16} className="mr-2" />
          Back to events
        </Link>
      </div>

      {/* Event Hero Section */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="relative w-full h-[350px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
            <Image
              src="/assets/login_page.jpg"
              alt={mockEvent.event_name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
              <div className="inline-block bg-accent text-white text-xs font-bold px-4 py-2 rounded-lg mb-6 shadow-md">
                Featured Event
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">{mockEvent.event_name}</h1>
              
              <div className="flex flex-wrap gap-6 text-white">
                <div className="flex items-center bg-black/30 backdrop-blur-sm px-4 py-2.5 rounded-lg">
                  <Calendar className="h-5 w-5 mr-3 text-secondary" />
                  <span className="font-medium">{formatDate(mockEvent.event_date)}</span>
                </div>
                <div className="flex items-center bg-black/30 backdrop-blur-sm px-4 py-2.5 rounded-lg">
                  <Clock className="h-5 w-5 mr-3 text-secondary" />
                  <span className="font-medium">{formatTime(mockEvent.event_date)}</span>
                </div>
                <div className="flex items-center bg-black/30 backdrop-blur-sm px-4 py-2.5 rounded-lg">
                  <MapPin className="h-5 w-5 mr-3 text-secondary" />
                  <span className="font-medium">{mockEvent.location}</span>
                </div>
                <div className="flex items-center bg-black/30 backdrop-blur-sm px-4 py-2.5 rounded-lg">
                  <Target className="h-5 w-5 mr-3 text-secondary" />
                  <span className="font-medium">{mockEvent.target_audience}</span>
                </div>
              </div>
            </div>
            
            {/* Share button */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-3 rounded-lg shadow-md transition-all hover-scale">
                <Share2 size={20} />
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-3 rounded-lg shadow-md transition-all hover-scale">
                <Heart size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Content */}
            <div className="w-full lg:w-2/3">
              {/* Event Details */}
              <div className="bg-card rounded-xl border border-border p-8 mb-10 shadow-md hover:shadow-lg transition-all">
                <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
                  <Info className="h-6 w-6 mr-3 text-primary" />
                  About This Event
                </h2>
                <p className="text-foreground mb-8 text-lg">
                  {mockEvent.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 hover:border-primary/20 transition-all hover-scale">
                    <h3 className="font-bold text-foreground mb-3 flex items-center text-lg">
                      <Target className="h-5 w-5 mr-2 text-primary" />
                      Target Audience
                    </h3>
                    <p className="text-foreground">{mockEvent.target_audience}</p>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 hover:border-primary/20 transition-all hover-scale">
                    <h3 className="font-bold text-foreground mb-3 flex items-center text-lg">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      Organized By
                    </h3>
                    <div className="space-y-3">
                      {mockEvent.organizers.map((organizer, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mr-3 border border-primary/20">
                            <span className="text-sm font-bold text-primary">{organizer.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{organizer.name}</p>
                            <p className="text-sm text-muted-foreground">{organizer.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border pt-8">
                  <h3 className="font-bold text-foreground mb-6 flex items-center text-lg">
                    <Flag className="h-5 w-5 mr-2 text-primary" />
                    Event Timeline
                  </h3>
                  <div className="space-y-6">
                    <div className="flex">
                      <div className="mr-5 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-md">1</div>
                        <div className="w-0.5 h-full bg-primary/20 mt-3"></div>
                      </div>
                      <div className="hover-scale transition-all">
                        <h4 className="font-bold text-foreground text-lg">Registration Opens</h4>
                        <p className="text-sm text-secondary font-medium mt-1">May 1, 2024</p>
                        <p className="text-foreground mt-2">Early bird registration begins</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-5 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-md">2</div>
                        <div className="w-0.5 h-full bg-primary/20 mt-3"></div>
                      </div>
                      <div className="hover-scale transition-all">
                        <h4 className="font-bold text-foreground text-lg">Race Kit Distribution</h4>
                        <p className="text-sm text-secondary font-medium mt-1">June 13-14, 2024</p>
                        <p className="text-foreground mt-2">Pick up your bib and race kit</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-5 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-md">3</div>
                      </div>
                      <div className="hover-scale transition-all">
                        <h4 className="font-bold text-foreground text-lg">Race Day</h4>
                        <p className="text-sm text-secondary font-medium mt-1">June 15, 2024</p>
                        <p className="text-foreground mt-2">Assembly time 4:30 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Section */}
              <div className="bg-card rounded-xl border border-border p-8 mb-10 shadow-md hover:shadow-lg transition-all">
                <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
                  <Award className="h-6 w-6 mr-3 text-primary" />
                  Race Categories
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {mockEvent.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category)}
                      className={`${
                        selectedCategory.id === category.id
                          ? 'bg-primary text-white border-primary'
                          : 'bg-card hover:bg-primary/5 text-foreground border-border'
                      } border rounded-xl p-4 text-center transition-all hover-scale shadow-sm`}
                    >
                      <span className="block font-bold">{category.category_name}</span>
                    </button>
                  ))}
                </div>
                
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                  <h3 className="font-bold text-xl mb-3 text-foreground">{selectedCategory.category_name}</h3>
                  <p className="text-foreground mb-4">{selectedCategory.description}</p>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    <span>{selectedCategory.target_audience}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-accent">{formatCurrency(selectedCategory.discounted_price)}</span>
                    <span className="text-sm line-through text-muted-foreground">{formatCurrency(selectedCategory.price)}</span>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-md">Early Bird</span>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-md hover:shadow-lg transition-all mb-10">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
                    <MapPin className="h-6 w-6 mr-3 text-primary" />
                    Event Location
                  </h2>
                  <p className="text-foreground mb-4">{mockEvent.location}</p>
                </div>
                
                <div className="h-[300px] w-full bg-gray-200 relative flex items-center justify-center">
                  {/* This would be a real map in a production app */}
                  <div className="text-center px-6">
                    <MapPin className="h-12 w-12 text-primary mb-4 mx-auto" />
                    <p className="text-foreground font-medium text-lg mb-2">Interactive Map Coming Soon</p>
                    <p className="text-muted-foreground">A detailed map of the race route will be available here</p>
                  </div>
                </div>
              </div>
              
              {/* Similar Events Section - Moved from sidebar to main content */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-primary" />
                  Similar Events
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {mockEvents.filter(e => e.id !== eventId).map((event) => (
                    <EventCard 
                      key={event.id}
                      id={event.id}
                      event_name={event.event_name}
                      date={formatDate(event.event_date)}
                      location={event.location}
                      image_url="/assets/login_page.jpg"
                      categories={event.categories.slice(0, 2).map(c => c.category_name)}
                      status="upcoming"
                      organizer={event.organizers[0].name}
                      description={event.description}
                      participants={Math.floor(Math.random() * 500) + 100}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3">
              {/* Make entire sidebar content sticky */}
              <div className="sticky top-28 space-y-8">
                {/* Registration CTA */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-foreground">Register for this Event</h3>
                  
                  {/* Category Selection Dropdown */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Select Race Category
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="flex justify-between items-center w-full p-3 rounded-lg border border-border hover:border-primary/30 bg-background text-left"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        <div>
                          <h4 className="font-medium text-foreground">{selectedCategory.category_name}</h4>
                          <p className="text-xs text-muted-foreground">{selectedCategory.target_audience}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-accent font-bold">{formatCurrency(selectedCategory.discounted_price)}</div>
                            <div className="text-xs line-through text-muted-foreground text-right">{formatCurrency(selectedCategory.price)}</div>
                          </div>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      
                      {dropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                          {mockEvent.categories.map((category) => (
                            <div 
                              key={category.id}
                              onClick={() => {
                                setSelectedCategory(category);
                                setDropdownOpen(false);
                              }}
                              className={`flex justify-between items-center p-3 cursor-pointer border-b border-border last:border-0 hover:bg-primary/5 transition-colors ${
                                selectedCategory.id === category.id ? 'bg-primary/5' : ''
                              }`}
                            >
                              <div>
                                <h4 className="font-medium text-foreground">{category.category_name}</h4>
                                <p className="text-xs text-muted-foreground">{category.target_audience}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-accent font-bold">{formatCurrency(category.discounted_price)}</div>
                                <div className="text-xs line-through text-muted-foreground">{formatCurrency(category.price)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Category Details */}
                  <div className="bg-primary/5 rounded-lg p-4 mb-6 border border-primary/10">
                    <div className="flex items-center text-foreground mb-2">
                      <Target className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                      <span className="text-sm">{selectedCategory.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-md">Save {Math.round((1 - selectedCategory.discounted_price / selectedCategory.price) * 100)}%</span>
                      <span className="text-xs text-muted-foreground">Early Bird Special</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="#register" 
                    className="bg-secondary text-secondary-foreground px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-md hover:bg-secondary/90 hover-scale transition-all w-full mb-4"
                  >
                    <Check className="h-5 w-5" />
                    Register Now
                  </Link>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Registration closes on June 1, 2024
                  </p>
                </div>
                
                {/* Contact Information */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-foreground">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">+63 123 456 7890</p>
                        <p className="text-sm text-muted-foreground">Weekdays 9AM - 5PM</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">event@stievent.com</p>
                        <p className="text-sm text-muted-foreground">For inquiries</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-border mt-5 pt-5">
                    <h4 className="font-medium text-foreground mb-3">Have Questions?</h4>
                    <div className="flex gap-3">
                      <button className="bg-primary text-white py-2 px-4 rounded-lg flex-1 font-medium hover:bg-primary/90 transition-all">Send Message</button>
                      <button className="bg-white border border-primary/30 text-primary py-2 px-4 rounded-lg flex items-center justify-center hover:bg-primary/5 transition-all">
                        <Smartphone className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 