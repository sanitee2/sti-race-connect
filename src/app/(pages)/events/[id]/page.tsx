"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  MessageSquare
} from 'lucide-react';

// Mock event data (in a real app, this would come from an API/database fetch)
const mockEvent = {
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
    { id: "1", category_name: "5K Fun Run", description: "Perfect for beginners and casual runners", target_audience: "Casual runners" },
    { id: "2", category_name: "10K Run", description: "Intermediate distance for regular runners", target_audience: "Regular runners" },
    { id: "3", category_name: "21K Half Marathon", description: "Challenging half marathon for experienced runners", target_audience: "Experienced runners" },
    { id: "4", category_name: "42K Full Marathon", description: "Full marathon for elite and experienced runners", target_audience: "Elite runners" }
  ],
  organizers: [
    { name: "John Doe", role: "Event Director" },
    { name: "Jane Smith", role: "Race Coordinator" }
  ]
};

export default function EventDetails({ params }: { params: { id: string } }) {
  const [selectedCategory, setSelectedCategory] = useState(mockEvent.categories[0]);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Back to events link */}
      <div className="pt-28 container mx-auto px-6">
        <Link href="/events" className="inline-flex items-center text-primary hover:text-primary/80 font-medium mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to events
        </Link>
      </div>

      {/* Event Hero Section */}
      <section className="pb-10">
        <div className="container mx-auto px-6">
          <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-8">
            <Image
              src="/assets/login_page.jpg"
              alt={mockEvent.event_name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
              <div className="inline-block bg-secondary text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                Featured Event
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{mockEvent.event_name}</h1>
              
              <div className="flex flex-wrap gap-4 text-white">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-secondary" />
                  <span>{formatDate(mockEvent.event_date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-secondary" />
                  <span>{formatTime(mockEvent.event_date)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-secondary" />
                  <span>{mockEvent.location}</span>
                </div>
                <div className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-secondary" />
                  <span>{mockEvent.target_audience}</span>
                </div>
              </div>
            </div>
            
            {/* Share button */}
            <button className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-2 rounded-full">
              <Share2 size={20} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Content */}
            <div className="w-full lg:w-2/3">
              {/* Event Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">About This Event</h2>
                <p className="text-gray-700 mb-6">
                  <Info className="inline h-5 w-5 mr-2 text-primary align-text-bottom" />
                  {mockEvent.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <Target className="inline h-5 w-5 mr-2 text-primary align-text-bottom" />
                      Target Audience
                    </h3>
                    <p className="text-gray-700">{mockEvent.target_audience}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <User className="inline h-5 w-5 mr-2 text-primary align-text-bottom" />
                      Organized By
                    </h3>
                    <div className="space-y-2">
                      {mockEvent.organizers.map((organizer, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-primary">{organizer.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{organizer.name}</p>
                            <p className="text-xs text-gray-500">{organizer.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    <Flag className="inline h-5 w-5 mr-2 text-primary align-text-bottom" />
                    Event Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">1</div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Registration Opens</h4>
                        <p className="text-sm text-gray-500">May 1, 2024</p>
                        <p className="text-sm text-gray-700 mt-1">Early bird registration begins</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">2</div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Race Kit Distribution</h4>
                        <p className="text-sm text-gray-500">June 13-14, 2024</p>
                        <p className="text-sm text-gray-700 mt-1">Pick up your bib and race kit</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">3</div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Race Day</h4>
                        <p className="text-sm text-gray-500">June 15, 2024</p>
                        <p className="text-sm text-gray-700 mt-1">Assembly time 4:30 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  <Award className="inline h-6 w-6 mr-2 text-primary align-text-bottom" />
                  Race Categories
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {mockEvent.categories.map((category) => (
                    <button
                      key={category.id}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        selectedCategory.id === category.id 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-gray-200 hover:border-primary/30 text-gray-700'
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <h3 className="font-semibold">{category.category_name}</h3>
                    </button>
                  ))}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3">{selectedCategory.category_name}</h3>
                  <p className="text-gray-700 mb-4">{selectedCategory.description}</p>
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500">Suitable for:</span>
                    <p className="text-gray-900">
                      <Target className="inline h-4 w-4 mr-1 text-primary align-text-bottom" />
                      {selectedCategory.target_audience}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Registration Fee:</span>
                      <p className="text-lg font-bold text-primary">
                        
                        ₱1,200.00
                      </p>
                    </div>
                    <Link 
                      href={`/auth/register?event=${mockEvent.id}&category=${selectedCategory.id}`}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md inline-flex items-center"
                    >
                      Register Now
                      <ChevronRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  <MapPin className="inline h-6 w-6 mr-2 text-primary align-text-bottom" />
                  Event Location
                </h2>
                <div className="relative w-full h-[300px] rounded-lg overflow-hidden mb-4 bg-gray-100">
                  {/* This would be a real map in production */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">Map of {mockEvent.location}</p>
                  </div>
                </div>
                <p className="text-gray-700">{mockEvent.location}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-1/3 sticky top-28 self-start h-fit">
              {/* Registration Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  <BarChart4 className="inline h-5 w-5 mr-2 text-primary align-text-bottom" />
                  Register for This Event
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      <Calendar className="inline h-4 w-4 mr-1.5 text-gray-400 align-text-bottom" />
                      Registration Opens:
                    </span>
                    <span className="font-medium">May 1, 2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      <Calendar className="inline h-4 w-4 mr-1.5 text-gray-400 align-text-bottom" />
                      Registration Closes:
                    </span>
                    <span className="font-medium">June 10, 2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      <Calendar className="inline h-4 w-4 mr-1.5 text-gray-400 align-text-bottom" />
                      Event Date:
                    </span>
                    <span className="font-medium">{formatDate(mockEvent.event_date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      <Clock className="inline h-4 w-4 mr-1.5 text-gray-400 align-text-bottom" />
                      Start Time:
                    </span>
                    <span className="font-medium">{formatTime(mockEvent.event_date)}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary to-accent p-0.5 rounded-lg mb-6">
                  <div className="bg-white rounded-[0.3rem] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Available Slots:</span>
                      <span className="font-bold text-accent">476 / 1000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full" style={{ width: '47.6%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Registration is 52.4% complete. Secure your slot now!</p>
                  </div>
                </div>

                <Link
                  href="/auth/register"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mb-4"
                >
                  <Check className="h-4 w-4" />
                  Register Now
                  <ChevronRight size={16} />
                </Link>
                
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Users size={16} className="mr-2" />
                  <span>243 people registered in the last 7 days</span>
                </div>
              </div>

              {/* Contact Organizer */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  <MessageSquare className="inline h-5 w-5 mr-2 text-primary align-text-bottom" />
                  Contact Organizer
                </h3>
                <p className="text-gray-700 mb-4">Have questions about this event? Contact the organizer directly.</p>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>+63 (2) 8812 1234</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>events@stiraceconnect.com</span>
                  </div>
                </div>
                <Link
                  href="#"
                  className="w-full border border-gray-300 hover:border-primary/50 text-gray-700 hover:text-primary py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send a Message
                </Link>
              </div>

              {/* Share Event */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  <Share2 className="inline h-5 w-5 mr-2 text-primary align-text-bottom" />
                  Share Event
                </h3>
                <div className="flex gap-3">
                  <button className="flex-1 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                    <Facebook className="h-3 w-3" />
                    Facebook
                  </button>
                  <button className="flex-1 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                    <Twitter className="h-3 w-3" />
                    Twitter
                  </button>
                  <button className="flex-1 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                    <MailIcon className="h-3 w-3" />
                    Email
                  </button>
                  <button className="flex-1 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">
            <Heart className="inline h-6 w-6 mr-2 text-primary align-text-bottom" />
            Similar Events You May Like
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Coastal Trail Run",
                date: "July 22, 2024",
                location: "Batangas",
                image: "/assets/login_page.jpg",
                categories: ["Trail 12K", "Trail 25K"]
              },
              {
                title: "STI College Fun Run",
                date: "August 8, 2024",
                location: "Multiple STI Campuses",
                image: "/assets/login_page.jpg",
                categories: ["3K", "5K"]
              },
              {
                title: "Sunrise Marathon",
                date: "September 10, 2024",
                location: "Subic Bay",
                image: "/assets/login_page.jpg",
                categories: ["10K", "21K", "42K"]
              }
            ].map((event, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md group">
                <div className="h-56 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 mix-blend-multiply z-10"></div>
                  <Image 
                    src={event.image} 
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.categories.map((cat, i) => (
                      <span key={i} className="bg-primary/5 text-primary text-xs px-3 py-1 rounded-full font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors">{event.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2 text-gray-400" /> 
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2 text-gray-400" /> 
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/events/${index + 2}`}
                    className="mt-2 inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-sm"
                  >
                    View Details
                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 