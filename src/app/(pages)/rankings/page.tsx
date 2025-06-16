"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Timer, 
  Users, 
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Calendar,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  Play
} from 'lucide-react';
import Link from 'next/link';

interface Runner {
  id: number;
  name: string;
  avatar?: string;
  bib: string;
  time: string;
  pace: string;
  category: string;
  ageGroup: string;
  gender: 'Male' | 'Female';
  team?: string;
  position: number;
  previousPosition?: number;
  nationality: string;
  personalBest: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  category: string;
  distance: string;
  status: 'live' | 'upcoming' | 'completed';
  totalRunners: number;
  description: string;
}

// Mock data for prototype - public events
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Manila Marathon 2024',
    date: '2024-01-15',
    location: 'Manila, Philippines',
    category: 'Marathon',
    distance: '42.2km',
    status: 'live',
    totalRunners: 2543,
    description: 'The biggest marathon event in Metro Manila featuring international and local runners'
  },
  {
    id: '2',
    name: 'BGC Fun Run Championship',
    date: '2024-01-20',
    location: 'Taguig, Philippines',
    category: '10K',
    distance: '10km',
    status: 'live',
    totalRunners: 1287,
    description: 'Annual fun run event promoting fitness and community wellness'
  },
  {
    id: '3',
    name: 'Cebu City Half Marathon',
    date: '2024-01-25',
    location: 'Cebu, Philippines',
    category: 'Half Marathon',
    distance: '21.1km',
    status: 'completed',
    totalRunners: 1856,
    description: 'Scenic half marathon through the historic streets of Cebu City'
  },
  {
    id: '4',
    name: 'Baguio Mountain Trail Run',
    date: '2024-02-01',
    location: 'Baguio, Philippines',
    category: '15K',
    distance: '15km',
    status: 'upcoming',
    totalRunners: 892,
    description: 'Challenging mountain trail run with breathtaking views'
  }
];

const mockRankings: Runner[] = [
  {
    id: 1,
    name: 'Juan Carlos Rivera',
    avatar: '/avatars/juan.jpg',
    bib: 'M001',
    time: '2:15:23',
    pace: '3:13/km',
    category: 'Marathon',
    ageGroup: '25-29',
    gender: 'Male',
    team: 'Team Manila Runners',
    position: 1,
    previousPosition: 1,
    nationality: 'PH',
    personalBest: '2:14:45'
  },
  {
    id: 2,
    name: 'Maria Santos',
    avatar: '/avatars/maria.jpg',
    bib: 'F001',
    time: '2:28:45',
    pace: '3:31/km',
    category: 'Marathon',
    ageGroup: '30-34',
    gender: 'Female',
    team: 'Quezon City Runners',
    position: 2,
    previousPosition: 3,
    nationality: 'PH',
    personalBest: '2:27:12'
  },
  {
    id: 3,
    name: 'David Kim',
    avatar: '/avatars/david.jpg',
    bib: 'M087',
    time: '2:31:12',
    pace: '3:35/km',
    category: 'Marathon',
    ageGroup: '35-39',
    gender: 'Male',
    position: 3,
    previousPosition: 2,
    nationality: 'KR',
    personalBest: '2:29:34'
  },
  {
    id: 4,
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    bib: 'F023',
    time: '2:33:56',
    pace: '3:39/km',
    category: 'Marathon',
    ageGroup: '25-29',
    gender: 'Female',
    team: 'International Runners Club',
    position: 4,
    previousPosition: 4,
    nationality: 'US',
    personalBest: '2:32:18'
  },
  {
    id: 5,
    name: 'Michael Chen',
    avatar: '/avatars/michael.jpg',
    bib: 'M156',
    time: '2:36:41',
    pace: '3:43/km',
    category: 'Marathon',
    ageGroup: '40-44',
    gender: 'Male',
    team: 'Singapore Runners',
    position: 5,
    previousPosition: 6,
    nationality: 'SG',
    personalBest: '2:35:22'
  },
  {
    id: 6,
    name: 'Ana Gonzalez',
    avatar: '/avatars/ana.jpg',
    bib: 'F045',
    time: '2:39:18',
    pace: '3:46/km',
    category: 'Marathon',
    ageGroup: '30-34',
    gender: 'Female',
    position: 6,
    previousPosition: 5,
    nationality: 'ES',
    personalBest: '2:38:05'
  },
  {
    id: 7,
    name: 'Roberto Dela Cruz',
    avatar: '/avatars/roberto.jpg',
    bib: 'M234',
    time: '2:42:33',
    pace: '3:51/km',
    category: 'Marathon',
    ageGroup: '45-49',
    gender: 'Male',
    team: 'Davao Runners Club',
    position: 7,
    previousPosition: 8,
    nationality: 'PH',
    personalBest: '2:40:17'
  },
  {
    id: 8,
    name: 'Jennifer Wu',
    avatar: '/avatars/jennifer.jpg',
    bib: 'F067',
    time: '2:44:52',
    pace: '3:54/km',
    category: 'Marathon',
    ageGroup: '25-29',
    gender: 'Female',
    team: 'HK Marathon Club',
    position: 8,
    previousPosition: 7,
    nationality: 'HK',
    personalBest: '2:43:29'
  }
];

export default function PublicRankingsPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event>(mockEvents[0]);
  const [rankings, setRankings] = useState<Runner[]>(mockRankings);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Filter rankings based on search and filters
  const filteredRankings = rankings.filter(runner => {
    const matchesSearch = runner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         runner.bib.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         runner.team?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || runner.category === filterCategory;
    const matchesGender = filterGender === 'all' || runner.gender.toLowerCase() === filterGender;
    
    return matchesSearch && matchesCategory && matchesGender;
  });

  // Simulate live updates for live events
  useEffect(() => {
    if (selectedEvent.status === 'live') {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        // Simulate small position changes
        setRankings(prev => [...prev].sort(() => Math.random() - 0.5));
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [selectedEvent.status]);

  const getPositionChangeIcon = (runner: Runner) => {
    if (!runner.previousPosition) return <Minus className="w-4 h-4 text-gray-400" />;
    
    if (runner.position < runner.previousPosition) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (runner.position > runner.previousPosition) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) {
      return <Crown className="w-6 h-6 text-yellow-500" />;
    } else if (position === 2) {
      return <Medal className="w-6 h-6 text-gray-400" />;
    } else if (position === 3) {
      return <Medal className="w-6 h-6 text-amber-600" />;
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-600">{position}</span>
      </div>
    );
  };

  const getFlagEmoji = (nationality: string) => {
    const flags: Record<string, string> = {
      'PH': '🇵🇭',
      'US': '🇺🇸',
      'KR': '🇰🇷',
      'SG': '🇸🇬',
      'ES': '🇪🇸',
      'HK': '🇭🇰'
    };
    return flags[nationality] || '🏁';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white/10 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              🏆 Live Race Results
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Event Rankings & Results
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Follow live race results, view rankings, and track your favorite runners across all events
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register" 
                className="bg-secondary hover:bg-secondary/90 text-white px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Join as Runner
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/events" 
                className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
              >
                Browse Events
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Event Selection Grid */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Select Event to View Rankings</h2>
            <p className="text-muted-foreground text-lg">Choose from our featured running events</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockEvents.map((event) => (
              <Card 
                key={event.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedEvent.id === event.id 
                    ? 'ring-2 ring-primary bg-primary/5 shadow-md' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <Badge 
                      variant={event.status === 'live' ? 'default' : event.status === 'upcoming' ? 'secondary' : 'outline'}
                      className={event.status === 'live' ? 'animate-pulse' : ''}
                    >
                      {event.status === 'live' && <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />}
                      {event.status.toUpperCase()}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{event.totalRunners}</div>
                      <div className="text-xs text-muted-foreground">Runners</div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.name}</h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      {event.distance}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {event.description}
                  </p>
                  
                  {event.status === 'live' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <Play className="w-4 h-4" />
                      Live Results Available
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Event Info Banner */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{selectedEvent.name}</h2>
                  <Badge variant={selectedEvent.status === 'live' ? 'default' : 'secondary'}>
                    {selectedEvent.status === 'live' && <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />}
                    {selectedEvent.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2">{selectedEvent.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedEvent.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    {selectedEvent.distance}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedEvent.totalRunners} Participants
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedEvent.status === 'live' && (
                  <div className="text-sm text-muted-foreground">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setLastUpdate(new Date())}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, bib number, or team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Marathon">Marathon</SelectItem>
                    <SelectItem value="Half Marathon">Half Marathon</SelectItem>
                    <SelectItem value="15K">15K</SelectItem>
                    <SelectItem value="10K">10K</SelectItem>
                    <SelectItem value="5K">5K</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterGender} onValueChange={setFilterGender}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="text-sm">
                {filteredRankings.length} of {selectedEvent.totalRunners} runners shown
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Rankings Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Live Rankings - {selectedEvent.name}
            </CardTitle>
            <CardDescription>
              {selectedEvent.status === 'live' 
                ? 'Results are updating in real-time' 
                : selectedEvent.status === 'upcoming' 
                  ? 'Event has not started yet'
                  : 'Final results'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRankings.map((runner) => (
                <Card key={runner.id} className="transition-all hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Position */}
                      <div className="flex items-center gap-2 min-w-[60px]">
                        {getPositionBadge(runner.position)}
                        {getPositionChangeIcon(runner)}
                      </div>

                      {/* Runner Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={runner.avatar} alt={runner.name} />
                          <AvatarFallback>
                            {runner.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg truncate">{runner.name}</h3>
                            <span className="text-lg">{getFlagEmoji(runner.nationality)}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Bib: {runner.bib}</span>
                            <span>{runner.ageGroup}</span>
                            {runner.team && <span className="truncate">{runner.team}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      <div className="text-right space-y-1">
                        <div className="text-2xl font-bold text-primary">{runner.time}</div>
                        <div className="text-sm text-muted-foreground">
                          Pace: {runner.pace}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          PB: {runner.personalBest}
                        </div>
                      </div>

                      {/* Gender Badge */}
                      <Badge variant={runner.gender === 'Female' ? 'secondary' : 'default'}>
                        {runner.gender}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRankings.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria or filters.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterGender('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Want to participate in races?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our platform to register for events, track your progress, and compete with runners worldwide. 
              Get personalized dashboards, training insights, and exclusive event access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Register as Runner
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Browse All Events
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 