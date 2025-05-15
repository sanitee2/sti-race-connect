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
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const event = mockEvents.find(e => e.id === resolvedParams.id) || mockEvents[0];
  
  return {
    title: `${event.event_name} | STI Race Connect`,
    description: event.description
  };
}

// Page component with proper type annotation
export default async function EventPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Now params is explicitly a Promise
  const resolvedParams = await params;
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <EventDetailContent eventId={resolvedParams.id} />
    </div>
  );
} 