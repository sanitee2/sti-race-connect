import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

// Helper function to determine event status
function getEventStatus(eventDate: Date): string {
  const now = new Date();
  const timeDiff = eventDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (daysDiff < 0) return 'completed';
  if (daysDiff === 0) return 'today';
  if (daysDiff <= 7) return 'this_week';
  return 'upcoming';
}

// Helper function to format event date
function formatEventDate(eventDate: Date): string {
  const now = new Date();
  const timeDiff = eventDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Tomorrow';
  if (daysDiff > 1 && daysDiff <= 7) return `In ${daysDiff} days`;
  return eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Helper function to determine event type based on categories
function getEventType(categories: any[]): string {
  if (categories.length === 0) return 'General';
  
  const distances = categories.map(cat => cat.distance || cat.targetAudience || '').join(' ').toLowerCase();
  
  if (distances.includes('marathon') || distances.includes('42k')) return 'Marathon';
  if (distances.includes('half') || distances.includes('21k')) return 'Half Marathon';
  if (distances.includes('10k')) return '10K Run';
  if (distances.includes('5k')) return '5K Run';
  if (distances.includes('fun run') || distances.includes('3k')) return 'Fun Run';
  
  return 'Running Event';
}

// Helper function to format price display
function formatPrice(price: number | null, earlyBirdPrice: number | null, isFreeEvent: boolean): string {
  if (isFreeEvent) return 'Free';
  if (!price) return 'TBA';
  if (earlyBirdPrice && earlyBirdPrice < price) {
    return `₱${earlyBirdPrice.toFixed(2)} - ₱${price.toFixed(2)}`;
  }
  return `₱${price.toFixed(2)}`;
}

// Helper function to get price range from categories
function getPriceRange(categories: any[], isFreeEvent: boolean): string {
  if (isFreeEvent) return 'Free';
  if (categories.length === 0) return 'TBA';
  
  const prices = categories
    .map(cat => cat.price)
    .filter(price => price !== null && price !== undefined)
    .map(price => Number(price));
    
  if (prices.length === 0) return 'TBA';
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Check if any category has early bird pricing active
  const hasEarlyBird = categories.some(cat => 
    cat.earlyBirdPrice !== null && 
    cat.earlyBirdPrice !== undefined && 
    cat.earlyBirdPrice < cat.price
  );
  
  if (hasEarlyBird) {
    const earlyBirdPrices = categories
      .map(cat => cat.earlyBirdPrice)
      .filter(price => price !== null && price !== undefined)
      .map(price => Number(price));
      
    if (earlyBirdPrices.length > 0) {
      const minEarlyBird = Math.min(...earlyBirdPrices);
      return `₱${minEarlyBird.toFixed(2)} - ₱${maxPrice.toFixed(2)}`;
    }
  }
  
  if (minPrice === maxPrice) {
    return `₱${minPrice.toFixed(2)}`;
  }
  
  return `₱${minPrice.toFixed(2)} - ₱${maxPrice.toFixed(2)}`;
}

// GET /api/public/events/[id] - Fetch single event details (no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    
    // Fetch event with comprehensive public data
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        creator: { 
          select: { 
            id: true, 
            name: true 
          } 
        },
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
            logo_url: true,
            website: true,
            is_verified: true
          }
        },
        event_categories: {
          include: {
            category: {
              select: {
                id: true,
                category_name: true,
                description: true,
                target_audience: true,
                category_image: true,
                has_slot_limit: true,
                slot_limit: true,
                price: true,
                early_bird_price: true,
                gun_start_time: true,
                cut_off_time: true,
                participants: {
                  select: {
                    id: true,
                    registration_status: true
                  }
                }
              }
            }
          }
        },
        sponsors: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            website: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Calculate event-level metrics
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if registration is open
    const registrationOpen = (!event.registration_start_date || now >= new Date(event.registration_start_date)) &&
                            (!event.registration_end_date || now <= new Date(event.registration_end_date));
    
    // Check if early bird is active
    const earlyBirdActive = event.early_bird_end_date ? now <= new Date(event.early_bird_end_date) : false;

    // Calculate total participants across all categories
    const totalParticipants = event.event_categories.reduce((total, eventCat) => {
      return total + eventCat.category.participants.filter(p => p.registration_status === 'Approved').length;
    }, 0);

    // Calculate available slots at event level
    let availableSlots: number | undefined;
    if (event.has_slot_limit && event.slot_limit) {
      availableSlots = Math.max(0, event.slot_limit - totalParticipants);
    }

    // Transform categories with enhanced data
    const transformedCategories = event.event_categories.map(eventCat => {
      const category = eventCat.category;
      const approvedParticipants = category.participants.filter(p => p.registration_status === 'Approved').length;
      
      // Calculate category available slots
      let categoryAvailableSlots: number | undefined;
      if (category.has_slot_limit && category.slot_limit) {
        categoryAvailableSlots = Math.max(0, category.slot_limit - approvedParticipants);
      }

      // Format gun start time for category (if available) or use event-level
      const categoryGunStartTime = category.gun_start_time || event.gun_start_time;
      const formattedGunStartTime = categoryGunStartTime ? 
        format(new Date(categoryGunStartTime), 'h:mm a') : undefined;

      // Format cut off time for category (if available) or use event-level
      const categoryCutOffTime = category.cut_off_time || event.cut_off_time;
      const formattedCutOffTime = categoryCutOffTime ? 
        format(new Date(categoryCutOffTime), 'h:mm a') : undefined;

      // Determine price display
      let priceDisplay = '';
      if (event.is_free_event) {
        priceDisplay = 'Free';
      } else if (category.price !== null && category.price !== undefined) {
        // Category has its own pricing
        if (earlyBirdActive && category.early_bird_price !== null && category.early_bird_price !== undefined) {
          priceDisplay = `₱${category.early_bird_price.toFixed(0)} ₱${category.price.toFixed(0)}`;
        } else {
          priceDisplay = `₱${category.price.toFixed(0)}`;
        }
      } else if (event.price !== null && event.price !== undefined) {
        // Use event-level pricing
        if (earlyBirdActive && event.early_bird_price !== null && event.early_bird_price !== undefined) {
          priceDisplay = `₱${event.early_bird_price.toFixed(0)} ₱${event.price.toFixed(0)}`;
        } else {
          priceDisplay = `₱${event.price.toFixed(0)}`;
        }
      } else {
        priceDisplay = 'TBA';
      }

      return {
        id: category.id,
        name: category.category_name,
        description: category.description,
        targetAudience: category.target_audience,
        participants: approvedParticipants,
        image: category.category_image,
        hasSlotLimit: category.has_slot_limit,
        slotLimit: category.slot_limit,
        availableSlots: categoryAvailableSlots,
        price: category.price,
        earlyBirdPrice: category.early_bird_price,
        priceDisplay,
        gunStartTime: categoryGunStartTime?.toISOString(),
        formattedGunStartTime,
        cutOffTime: categoryCutOffTime?.toISOString(),
        formattedCutOffTime,
        distance: category.target_audience // Using target_audience as distance for now
      };
    });

    // Calculate price range for the event
    const priceRange = getPriceRange(transformedCategories, event.is_free_event || false);

    // Build comprehensive response
    const response = {
      id: event.id,
      event_name: event.event_name,
      description: event.description,
      date: event.event_date.toISOString(),
      location: event.location,
      image_url: event.cover_image || '',
      categories: event.event_categories.map(ec => ec.category.category_name),
      type: getEventType(transformedCategories),
      organizer: event.creator.name,
      price: formatPrice(event.price, event.early_bird_price, event.is_free_event || false),
      status: getEventStatus(eventDate),
      target_audience: event.target_audience,
      participants: totalParticipants,
      event_date: event.event_date.toISOString(),
      cover_image: event.cover_image,
      gallery_images: event.gallery_images,
      eventCategories: transformedCategories,
      
      // Enhanced fields
      registrationStartDate: event.registration_start_date?.toISOString(),
      registrationEndDate: event.registration_end_date?.toISOString(),
      registrationOpen,
      gunStartTime: event.gun_start_time?.toISOString(),
      cutOffTime: event.cut_off_time?.toISOString(),
      formattedGunStartTime: event.gun_start_time ? format(new Date(event.gun_start_time), 'h:mm a') : undefined,
      formattedCutOffTime: event.cut_off_time ? format(new Date(event.cut_off_time), 'h:mm a') : undefined,
      isFreeEvent: event.is_free_event,
      eventPrice: event.price,
      earlyBirdPrice: event.early_bird_price,
      earlyBirdEndDate: event.early_bird_end_date?.toISOString(),
      earlyBirdActive,
      priceRange,
      hasSlotLimit: event.has_slot_limit,
      slotLimit: event.slot_limit,
      availableSlots,
      organization: event.organization ? {
        id: event.organization.id,
        name: event.organization.name,
        description: event.organization.description,
        logo_url: event.organization.logo_url,
        website: event.organization.website,
        isVerified: event.organization.is_verified
      } : undefined,
      sponsors: event.sponsors.map(sponsor => ({
        id: sponsor.id,
        name: sponsor.name,
        logo_url: sponsor.logo_url,
        website: sponsor.website
      })),
      createdAt: event.created_at.toISOString(),
      updatedAt: event.updated_at.toISOString(),
      isVerified: event.is_verified,
      daysUntilEvent,
      formattedDate: formatEventDate(eventDate),
      formattedTime: format(eventDate, 'h:mm a'),
      registrationStatus: registrationOpen ? 'Open' : 'Closed',
      totalParticipants
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 