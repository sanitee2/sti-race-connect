"use client";

import { useState } from 'react';
import Link from 'next/link';
import { EventCard } from '@/components/EventCard';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  X, 
  ChevronDown,
  ArrowUpDown,
  ListFilter
} from 'lucide-react';
import { Event, EventFilters } from '@/types/models';

// Mock events data - would come from API/database in real app
const mockEvents: Event[] = [
  {
    id: "1",
    event_name: "City Marathon 2024",
    description: "Join us for the premier running event in Metro Manila.",
    date: "June 15, 2024",
    location: "Metro Manila",
    image_url: "/assets/login_page.jpg",
    categories: ["5K", "10K", "21K"],
    type: "Marathon",
    organizer: "Metro Running Club",
    price: "₱1,200",
    status: "upcoming"
  },
  {
    id: "2",
    event_name: "Coastal Trail Run",
    description: "Experience the beauty of nature with this challenging trail run.",
    date: "July 22, 2024",
    location: "Batangas",
    image_url: "/assets/login_page.jpg",
    categories: ["Trail 12K", "Trail 25K"],
    type: "Trail Run",
    organizer: "Trail Blazers PH",
    price: "₱1,500",
    status: "upcoming"
  },
  {
    id: "3",
    event_name: "STI College Fun Run",
    description: "A fun community event for all STI students and alumni.",
    date: "August 8, 2024",
    location: "Multiple STI Campuses",
    image_url: "/assets/login_page.jpg",
    categories: ["3K", "5K"],
    type: "Fun Run",
    organizer: "STI Events Committee",
    price: "₱700",
    status: "upcoming"
  },
  {
    id: "4",
    event_name: "Sunrise Half Marathon",
    description: "Run as the sun rises over beautiful Subic Bay.",
    date: "September 10, 2024",
    location: "Subic Bay",
    image_url: "/assets/login_page.jpg",
    categories: ["10K", "21K"],
    type: "Marathon",
    organizer: "RunPH Events",
    price: "₱1,800",
    status: "upcoming"
  },
  {
    id: "5",
    event_name: "Mountain Trail Challenge",
    description: "Test your endurance on the challenging Rizal mountain trails.",
    date: "October 5, 2024",
    location: "Rizal Mountains",
    image_url: "/assets/login_page.jpg",
    categories: ["Trail 15K", "Trail 30K"],
    type: "Trail Run",
    organizer: "Outdoor Adventures Inc.",
    price: "₱2,000",
    status: "upcoming"
  },
  {
    id: "6",
    event_name: "Corporate Charity Run",
    description: "Run for a cause and help raise funds for local charities.",
    date: "November 20, 2024",
    location: "BGC, Taguig",
    image_url: "/assets/login_page.jpg",
    categories: ["3K", "5K", "10K"],
    type: "Fun Run",
    organizer: "Corporate Running Club",
    price: "₱1,000",
    status: "upcoming"
  }
];

// Get unique list of event types, locations, and months for filters
const eventTypes = [...new Set(mockEvents.map(event => event.type || ''))];
const eventLocations = [...new Set(mockEvents.map(event => event.location || ''))];
const eventMonths = [...new Set(mockEvents.map(event => {
  const month = event.date?.split(' ')[0] || '';
  return month;
}))];

export default function EventsPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('date-asc');
  
  // Filter events based on search query and selected filters
  const filteredEvents = mockEvents
    .filter(event => {
      // Text search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.event_name.toLowerCase().includes(query) ||
          (event.location?.toLowerCase().includes(query) || false) ||
          (event.organizer?.toLowerCase().includes(query) || false) ||
          (event.categories?.some(cat => cat.toLowerCase().includes(query)) || false)
        );
      }
      return true;
    })
    .filter(event => {
      // Type filter
      if (selectedTypes.length === 0) return true;
      return selectedTypes.includes(event.type || '');
    })
    .filter(event => {
      // Location filter
      if (selectedLocations.length === 0) return true;
      return selectedLocations.includes(event.location || '');
    })
    .filter(event => {
      // Month filter
      if (selectedMonths.length === 0) return true;
      const month = event.date?.split(' ')[0] || '';
      return selectedMonths.includes(month);
    })
    .sort((a, b) => {
      // Sort options
      const dateA = new Date(a.date || '');
      const dateB = new Date(b.date || '');
      
      switch (sortOption) {
        case 'date-asc':
          return dateA.getTime() - dateB.getTime();
        case 'date-desc':
          return dateB.getTime() - dateA.getTime();
        default:
          return 0;
      }
    });
    
  // Toggle filter selection
  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const toggleLocationFilter = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location) 
        : [...prev, location]
    );
  };
  
  const toggleMonthFilter = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month) 
        : [...prev, month]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedLocations([]);
    setSelectedMonths([]);
    setSortOption('date-asc');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Running Events</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find and register for the best running events happening near you. From fun runs to marathons, we've got something for every runner.
            </p>
          </div>
          
          {/* Search and Filters Section */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row gap-4 justify-between mb-6">
              {/* Search Box */}
              <div className="relative flex-1 max-w-full lg:max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                  placeholder="Search by event name, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 hidden md:inline">Sort by:</span>
                </div>
                <select 
                  className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="date-asc">Upcoming (Soonest first)</option>
                  <option value="date-desc">Later events first</option>
                  <option value="participants-desc">Most participants</option>
                  <option value="participants-asc">Fewer participants</option>
                </select>
                
                {/* Mobile Filter Toggle Button */}
                <button 
                  className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 text-sm"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden lg:flex gap-6">
              {/* Event Type Filter */}
              <div className="filter-group">
                <div className="flex items-center gap-2 mb-2">
                  <ListFilter className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium text-gray-700">Event Type</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                        selectedTypes.includes(type)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                      }`}
                      onClick={() => toggleTypeFilter(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Location Filter */}
              <div className="filter-group">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium text-gray-700">Location</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventLocations.map((location) => (
                    <button
                      key={location}
                      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                        selectedLocations.includes(location)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                      }`}
                      onClick={() => toggleLocationFilter(location)}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Month Filter */}
              <div className="filter-group">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium text-gray-700">Month</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventMonths.map((month) => (
                    <button
                      key={month}
                      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                        selectedMonths.includes(month)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                      }`}
                      onClick={() => toggleMonthFilter(month)}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Clear Filters Button */}
              {(selectedTypes.length > 0 || selectedLocations.length > 0 || selectedMonths.length > 0 || searchQuery) && (
                <button
                  className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
            
            {/* Mobile Filters (Slide Down Panel) */}
            {mobileFiltersOpen && (
              <div className="lg:hidden border border-gray-200 rounded-lg p-4 mt-4 bg-white">
                <div className="flex justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Event Type Filter (Mobile) */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ListFilter className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium text-gray-700">Event Type</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map((type) => (
                      <button
                        key={type}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                          selectedTypes.includes(type)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                        }`}
                        onClick={() => toggleTypeFilter(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Location Filter (Mobile) */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium text-gray-700">Location</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eventLocations.map((location) => (
                      <button
                        key={location}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                          selectedLocations.includes(location)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                        }`}
                        onClick={() => toggleLocationFilter(location)}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Month Filter (Mobile) */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium text-gray-700">Month</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eventMonths.map((month) => (
                      <button
                        key={month}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                          selectedMonths.includes(month)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                        }`}
                        onClick={() => toggleMonthFilter(month)}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Clear Button (Mobile) */}
                <div className="flex justify-end">
                  <button
                    className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
            
            {/* Active Filters Summary */}
            {(selectedTypes.length > 0 || selectedLocations.length > 0 || selectedMonths.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-gray-500">Active filters:</span>
                
                {selectedTypes.map(type => (
                  <div key={type} className="bg-primary/5 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <span>{type}</span>
                    <button onClick={() => toggleTypeFilter(type)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {selectedLocations.map(location => (
                  <div key={location} className="bg-primary/5 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <span>{location}</span>
                    <button onClick={() => toggleLocationFilter(location)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {selectedMonths.map(month => (
                  <div key={month} className="bg-primary/5 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <span>{month}</span>
                    <button onClick={() => toggleMonthFilter(month)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-medium text-gray-900">{filteredEvents.length}</span> events
              {searchQuery && (
                <span> for "<span className="text-primary">{searchQuery}</span>"</span>
              )}
            </p>
          </div>
          
          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id}
                  {...event}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-primary mb-4">
                <Search className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any events matching your search criteria.
              </p>
              <button
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 