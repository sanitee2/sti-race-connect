import { Metadata } from 'next';
import EventDetailContent from '@/components/event/EventDetailContent';
import { EventPageParams, GenerateMetadataReturn } from '@/types/pageParams';
import { HeroSection } from '@/components/ui/HeroSection';

// Mock events data
const mockEvents = [
  {
    id: "1",
    event_name: "City Marathon 2024",
    description: "Join us for the premier running event in Metro Manila."
  },
  {
    id: "2",
    event_name: "Trail Run Challenge",
    description: "Experience the beauty of nature with this challenging trail run."
  }
];

// Generate static params
export function generateStaticParams() {
  return mockEvents.map((event) => ({
    id: event.id,
  }));
}

// Generate metadata
export function generateMetadata({ params }: EventPageParams): GenerateMetadataReturn {
  const event = mockEvents.find(e => e.id === params.id) || mockEvents[0];
  
  return {
    title: `${event.event_name} | STI Race Connect`,
    description: event.description
  };
}

// Page component with proper type annotation
export default async function EventPage({ params }: EventPageParams) {
  // Convert params to Promise to satisfy Next.js type constraints
  Object.setPrototypeOf(params, Promise.prototype);
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <EventDetailContent eventId={params.id} />
    </div>
  );
} 