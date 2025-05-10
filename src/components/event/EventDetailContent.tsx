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
      { id: "1", category_name: "5K Fun Run", description: "Perfect for beginners and casual runners", target_audience: "Casual runners" },
      { id: "2", category_name: "10K Run", description: "Intermediate distance for regular runners", target_audience: "Regular runners" },
      { id: "3", category_name: "21K Half Marathon", description: "Challenging half marathon for experienced runners", target_audience: "Experienced runners" },
      { id: "4", category_name: "42K Full Marathon", description: "Full marathon for elite and experienced runners", target_audience: "Elite runners" }
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
      { id: "1", category_name: "5K Trail", description: "Beginner-friendly trail run", target_audience: "Beginner trail runners" },
      { id: "2", category_name: "10K Trail", description: "Intermediate trail challenge", target_audience: "Intermediate trail runners" },
      { id: "3", category_name: "21K Trail", description: "Advanced trail half-marathon", target_audience: "Advanced trail runners" }
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
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Register for This Event</h2>
                <p className="text-sm text-gray-700 mb-6">Select a category and complete your registration to secure your spot in this event.</p>
                
                <div className="space-y-4 mb-6">
                  {mockEvent.categories.map((category) => (
                    <div key={category.id} className="flex items-center border border-gray-200 rounded-lg p-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{category.category_name}</h3>
                        <p className="text-xs text-gray-500 mt-1">₱1,200.00</p>
                      </div>
                      <div>
                        <Link href={`/register?event=${mockEvent.id}&category=${category.id}`} 
                          className="text-xs bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                          Select
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    Registration Info
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Registration closes on June 1, 2024</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Race kit includes bib, timing chip, and event shirt</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Finisher medal for all participants</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="font-medium text-gray-900">Contact Organizer</h3>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm text-gray-700">+63 (123) 456-7890</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm text-gray-700">events@stiraceconnect.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Events */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Related Events</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockEvents.filter(event => event.id !== eventId).map((event) => (
              <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src="/assets/login_page.jpg"
                    alt={event.event_name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <span className="text-xs font-medium text-white bg-primary/80 px-2 py-1 rounded-full">
                      Upcoming
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{event.event_name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(event.event_date)}</span>
                    <span className="mx-2">•</span>
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{event.location}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{event.description.substring(0, 80)}...</p>
                  <Link href={`/events/${event.id}`} className="text-primary font-medium text-sm flex items-center hover:text-primary/80">
                    View details
                    <ChevronRight size={16} className="ml-1" />
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