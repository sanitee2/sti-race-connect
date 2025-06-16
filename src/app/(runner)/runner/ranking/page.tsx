"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  MapPin,
  Calendar,
  RefreshCw
} from 'lucide-react';

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
  isCurrentUser?: boolean;
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
}

// Mock data for prototype
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Manila Marathon 2024',
    date: '2024-01-15',
    location: 'Manila, Philippines',
    category: 'Marathon',
    distance: '42.2km',
    status: 'live',
    totalRunners: 2543
  },
  {
    id: '2',
    name: 'BGC Fun Run',
    date: '2024-01-20',
    location: 'Taguig, Philippines',
    category: '10K',
    distance: '10km',
    status: 'live',
    totalRunners: 1287
  },
  {
    id: '3',
    name: 'Cebu City Half Marathon',
    date: '2024-01-25',
    location: 'Cebu, Philippines',
    category: 'Half Marathon',
    distance: '21.1km',
    status: 'upcoming',
    totalRunners: 1856
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
    personalBest: '2:29:34',
    isCurrentUser: true
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

export default function RankingPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event>(mockEvents[0]);
  const [rankings, setRankings] = useState<Runner[]>(mockRankings);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [isLive, setIsLive] = useState(true);
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

  // Simulate live updates
  useEffect(() => {
    if (selectedEvent.status === 'live') {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        // Simulate position changes
        setRankings(prev => [...prev].sort(() => Math.random() - 0.5));
      }, 10000);

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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Live Rankings</h1>
              <p className="text-white/80 text-lg">Real-time race results and standings</p>
            </div>
            <div className="flex items-center gap-4">
              {selectedEvent.status === 'live' && (
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">LIVE</span>
                </div>
              )}
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Users className="w-4 h-4 mr-2" />
                {selectedEvent.totalRunners} Runners
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Event Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Select Event
            </CardTitle>
            <CardDescription>Choose an event to view live rankings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className={`cursor-pointer transition-all ${
                    selectedEvent.id === event.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{event.name}</h3>
                      <Badge variant={event.status === 'live' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString()}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
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

        {/* Rankings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {selectedEvent.name} - Rankings
              </div>
              <Badge variant="outline">
                {filteredRankings.length} of {selectedEvent.totalRunners} runners
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredRankings.map((runner) => (
                <Card 
                  key={runner.id} 
                  className={`transition-all ${
                    runner.isCurrentUser 
                      ? 'bg-primary/5 border-primary/20 shadow-md' 
                      : 'hover:shadow-sm'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Position */}
                      <div className="flex items-center gap-2">
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
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{runner.name}</h3>
                            <span className="text-lg">{getFlagEmoji(runner.nationality)}</span>
                            {runner.isCurrentUser && (
                              <Badge variant="secondary">
                                <Star className="w-3 h-3 mr-1" />
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Bib: {runner.bib}</span>
                            <span>{runner.ageGroup}</span>
                            {runner.team && <span>{runner.team}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      <div className="text-right space-y-1">
                        <div className="text-2xl font-bold">{runner.time}</div>
                        <div className="text-sm text-muted-foreground">
                          Pace: {runner.pace}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          PB: {runner.personalBest}
                        </div>
                      </div>

                      {/* Category Badge */}
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
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 