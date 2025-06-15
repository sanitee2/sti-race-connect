"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EventCard } from '@/components/EventCard';
import { HeroSection } from '@/components/ui/HeroSection';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
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
  ListFilter,
  Loader2,
  Clock,
  History
} from 'lucide-react';
import { Event, EventFilters } from '@/types/models';

export default function EventsPage() {
  const { data: session, status } = useSession();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('date-asc');
  // Registration is now handled in individual event detail pages

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      // Fetch both upcoming and completed events
      const [upcomingResponse, completedResponse] = await Promise.all([
        fetch('/api/public/events?status=upcoming'),
        fetch('/api/public/events?status=completed')
      ]);

      if (!upcomingResponse.ok || !completedResponse.ok) {
        throw new Error('Failed to fetch events');
      }

      const [upcomingData, completedData] = await Promise.all([
        upcomingResponse.json(),
        completedResponse.json()
      ]);

      setUpcomingEvents(upcomingData);
      setCompletedEvents(completedData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current events based on active tab
  const currentEvents = activeTab === 'upcoming' ? upcomingEvents : completedEvents;
  
  // Get unique list of event types, locations, and months for filters
  const eventTypes = [...new Set(currentEvents.map(event => event.type || ''))];
  const eventLocations = [...new Set(currentEvents.map(event => event.location || ''))];
  const eventMonths = [...new Set(currentEvents.map(event => {
    const month = event.date?.split(' ')[0] || '';
    return month;
  }))];
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <HeroSection 
          title="Running Events"
          subtitle="Find and register for the best running events happening near you."
          size="compact"
        />
        <div className="py-12">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Filter events based on search query and selected filters
  const filteredEvents = currentEvents
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
    setSortOption(activeTab === 'upcoming' ? 'date-asc' : 'date-desc');
  };

  // Reset filters when switching tabs
  const handleTabChange = (tab: 'upcoming' | 'completed') => {
    setActiveTab(tab);
    clearFilters();
  };

  // Handle navigation to event details for registration
  const handleViewEvent = (eventId: string) => {
    // Navigation is handled by the EventCard component's Link
    // This function is kept for potential future use
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Content */}
      <HeroSection 
        title="Running Events"
        subtitle="Find and register for the best running events happening near you."
        size="compact"
      />
      
      <div className="py-12">
        <div className="container mx-auto px-6">
          {/* Event Tabs */}
          <div className="mb-10">
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center bg-muted/30 p-1 rounded-xl border border-border/50 backdrop-blur-sm">
                <button
                  className={`relative flex items-center gap-3 px-8 py-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'upcoming'
                      ? 'bg-white dark:bg-gray-800 text-primary shadow-lg shadow-primary/10 border border-border/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => handleTabChange('upcoming')}
                >
                  <div className={`p-1.5 rounded-lg ${
                    activeTab === 'upcoming' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span>Upcoming Events</span>
                    {upcomingEvents.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {activeTab === 'upcoming' && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
                <button
                  className={`relative flex items-center gap-3 px-8 py-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'completed'
                      ? 'bg-white dark:bg-gray-800 text-primary shadow-lg shadow-primary/10 border border-border/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => handleTabChange('completed')}
                >
                  <div className={`p-1.5 rounded-lg ${
                    activeTab === 'completed' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}>
                    <History className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span>Previous Events</span>
                    {completedEvents.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {completedEvents.length} event{completedEvents.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {activeTab === 'completed' && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* Search and Filters Section */}
          <div className="mb-12">
            {/* Search and Sort Bar */}
            <div className="flex flex-col lg:flex-row gap-6 justify-between mb-8">
              {/* Enhanced Search Box */}
              <div className="relative flex-1 max-w-full lg:max-w-lg">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <input 
                  type="text" 
                  className="bg-white dark:bg-gray-800 border border-border/50 text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-12 pr-4 py-4 shadow-sm transition-all duration-200 placeholder:text-muted-foreground/70"
                  placeholder="Search events by name, location, or organizer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Sort and Filter Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-border/50 rounded-xl px-4 py-2 shadow-sm">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground hidden md:inline">Sort:</span>
                  <select 
                    className="bg-transparent border-none text-foreground text-sm focus:ring-0 focus:outline-none cursor-pointer"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    {activeTab === 'upcoming' ? (
                      <>
                        <option value="date-asc">Soonest first</option>
                        <option value="date-desc">Later events first</option>
                      </>
                    ) : (
                      <>
                        <option value="date-desc">Most recent first</option>
                        <option value="date-asc">Oldest first</option>
                      </>
                    )}
                    <option value="participants-desc">Most participants</option>
                    <option value="participants-asc">Fewer participants</option>
                  </select>
                </div>
                
                {/* Mobile Filter Toggle Button */}
                <button 
                  className="lg:hidden flex items-center gap-2 bg-white dark:bg-gray-800 border border-border/50 text-foreground rounded-xl px-4 py-3 text-sm shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {(selectedTypes.length > 0 || selectedLocations.length > 0 || selectedMonths.length > 0) && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {selectedTypes.length + selectedLocations.length + selectedMonths.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden lg:block">
              <div className="bg-white dark:bg-gray-800 border border-border/50 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap gap-8">
                  {/* Event Type Filter */}
                  {eventTypes.length > 0 && (
                    <div className="filter-group min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <ListFilter className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Event Type</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {eventTypes.map((type) => (
                          <button
                            key={type}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                              selectedTypes.includes(type)
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-gray-50 dark:bg-gray-700/50 text-foreground border-border/50 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                            onClick={() => toggleTypeFilter(type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Location Filter */}
                  {eventLocations.length > 0 && (
                    <div className="filter-group min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Location</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {eventLocations.map((location) => (
                          <button
                            key={location}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                              selectedLocations.includes(location)
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-gray-50 dark:bg-gray-700/50 text-foreground border-border/50 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                            onClick={() => toggleLocationFilter(location)}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Month Filter */}
                  {eventMonths.length > 0 && (
                    <div className="filter-group min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Month</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {eventMonths.map((month) => (
                          <button
                            key={month}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                              selectedMonths.includes(month)
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-gray-50 dark:bg-gray-700/50 text-foreground border-border/50 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                            onClick={() => toggleMonthFilter(month)}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Clear Filters Button */}
                {(selectedTypes.length > 0 || selectedLocations.length > 0 || selectedMonths.length > 0 || searchQuery) && (
                  <div className="flex justify-end mt-6 pt-4 border-t border-border/50">
                    <button
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      onClick={clearFilters}
                    >
                      <X className="w-4 h-4" />
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Filters (Slide Down Panel) */}
            {mobileFiltersOpen && (
              <div className="lg:hidden border border-input rounded-lg p-4 mt-4 bg-card dark:bg-card/90">
                <div className="flex justify-between mb-4">
                  <h3 className="font-medium text-foreground">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Event Type Filter (Mobile) */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ListFilter className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium text-foreground">Event Type</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map((type) => (
                      <button
                        key={type}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                          selectedTypes.includes(type)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card dark:bg-card/80 text-foreground border-input hover:border-primary/50'
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
                    <h4 className="text-sm font-medium text-foreground">Location</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eventLocations.map((location) => (
                      <button
                        key={location}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                          selectedLocations.includes(location)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card dark:bg-card/80 text-foreground border-input hover:border-primary/50'
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
                    <h4 className="text-sm font-medium text-foreground">Month</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eventMonths.map((month) => (
                      <button
                        key={month}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                          selectedMonths.includes(month)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card dark:bg-card/80 text-foreground border-input hover:border-primary/50'
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
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
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
                <span className="text-sm text-muted-foreground">Active filters:</span>
                
                {selectedTypes.map(type => (
                  <div key={type} className="bg-primary/10 dark:bg-primary/20 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <span>{type}</span>
                    <button onClick={() => toggleTypeFilter(type)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {selectedLocations.map(location => (
                  <div key={location} className="bg-primary/10 dark:bg-primary/20 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <span>{location}</span>
                    <button onClick={() => toggleLocationFilter(location)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {selectedMonths.map(month => (
                  <div key={month} className="bg-primary/10 dark:bg-primary/20 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <span>{month}</span>
                    <button onClick={() => toggleMonthFilter(month)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Results Count and Status */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {activeTab === 'upcoming' ? 'Upcoming Events' : 'Previous Events'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing <span className="font-medium text-foreground">{filteredEvents.length}</span> of <span className="font-medium">{currentEvents.length}</span> events
                  {searchQuery && (
                    <span> for "<span className="text-primary font-medium">{searchQuery}</span>"</span>
                  )}
                </p>
              </div>
              {filteredEvents.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {activeTab === 'upcoming' ? '🕐 Next events first' : '📅 Most recent first'}
                </div>
              )}
            </div>
          </div>
          
          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id}
                  {...event}
                  isAuthenticated={!!session}
                  showRegistration={false}
                  onRegister={handleViewEvent}
                  isRegistering={false}
                />
              ))}
            </div>
          ) : currentEvents.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                {activeTab === 'upcoming' ? (
                  <Calendar className="w-12 h-12 text-primary" />
                ) : (
                  <History className="w-12 h-12 text-primary" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {activeTab === 'upcoming' ? 'No upcoming events' : 'No previous events'}
              </h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                {activeTab === 'upcoming' 
                  ? 'There are currently no upcoming events. Check back later for new events!'
                  : 'No completed events to display yet.'
                }
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">No events found</h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                We couldn't find any events matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
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