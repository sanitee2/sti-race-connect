import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Users, Calendar, Mail, Phone, MapPin, Clock, Edit, ChevronLeft, Globe, Shield, Check, MapPinned, Trophy, Star, User, Settings, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GenerateMetadataProps, PageParams } from '@/types/pageParams';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define organization type with id parameter
type OrganizationParams = PageParams<'id'>;

export async function generateMetadata(
  props: GenerateMetadataProps<OrganizationParams>
): Promise<Metadata> {
  const id = await props.params.then(params => params.id);
  const organization = await getOrganization(id);
  
  return {
    title: organization ? `${organization.name} | STI Race Connect` : 'Organization Details',
    description: organization?.description || 'Organization details page',
  };
}

async function getOrganization(id: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return null;
    }
    
    const organization = await prisma.organizations.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            user_id: true,
            membership_role: true,
            joined_at: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile_picture: true
              }
            },
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        }
      }
    });
    
    return organization;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}

// Create some mock data for the UI
const mockUpcomingEvents = [
  { id: "1", name: "Annual Race Championship", date: "2023-12-15", location: "Austin Speedway", participants: 42 },
  { id: "2", name: "Winter Track Day", date: "2024-01-20", location: "Miami Circuit", participants: 28 },
];

export default async function OrganizationDetailPage(
  props: OrganizationParams
) {
  const params = await props.params;
  const id = params.id;
  
  const session = await getServerSession(authOptions);
  
  // If not authenticated, redirect to login
  if (!session) {
    redirect(`/api/auth/signin?callbackUrl=/organizations/${id}`);
  }
  
  const organization = await getOrganization(id);
  
  // If organization not found, show 404 page
  if (!organization) {
    notFound();
  }
  
  // Format date for display
  const formattedDate = new Date(organization.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="space-y-6 pb-10">
      {/* Breadcrumb and title area */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 -mx-6 rounded-lg mb-8">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-1 hover:bg-background/80">
              <Link href="/organizations">
                <ChevronLeft className="h-4 w-4" />
                Organizations
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-md border shadow-sm">
              {organization.logo_url ? (
                <AvatarImage src={organization.logo_url} alt={organization.name} />
              ) : (
                <AvatarFallback className="rounded-md bg-primary/10 text-lg">
                  {organization.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {organization.name}
                {organization.is_verified && (
                  <Badge variant="secondary" className="gap-1 ml-2">
                    <Check className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">{organization.description}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border">
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">{organization.members?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">0</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border">
            <div className="bg-primary/10 p-2 rounded-full">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">0</p>
              <p className="text-xs text-muted-foreground">Awards</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border">
            <div className="bg-primary/10 p-2 rounded-full">
              <MapPinned className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">{organization.address ? "1" : "0"}</p>
              <p className="text-xs text-muted-foreground">Locations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Organization Profile Card */}
        <Card className="w-full lg:w-1/3 sticky top-20 border-none shadow-lg bg-gradient-to-br from-card to-background">
          <CardHeader className="pb-3">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-28 w-28 mb-4 rounded-md border-4 border-background shadow-xl">
                {organization.logo_url ? (
                  <AvatarImage src={organization.logo_url} alt={organization.name} />
                ) : (
                  <AvatarFallback className="rounded-md bg-primary/10 text-2xl">
                    {organization.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CardTitle className="text-2xl">{organization.name}</CardTitle>
                  {organization.is_verified && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardDescription className="max-w-md">
                  {organization.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5 mt-2">
              <Separator className="my-5" />
              
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Contact Information
                </h3>
                
                <div className="space-y-3 text-sm">
                  {organization.email && (
                    <div className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <Mail className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                        <span>{organization.email}</span>
                      </div>
                    </div>
                  )}
                  
                  {organization.phone_number && (
                    <div className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <Phone className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                        <span>{organization.phone_number}</span>
                      </div>
                    </div>
                  )}
                  
                  {organization.website && (
                    <div className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <Globe className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Website</p>
                        <a 
                          href={organization.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          {organization.website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {organization.address && (
                    <div className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                        <span>{organization.address}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                    <Clock className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Joined</p>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-5" />
              
              {/* Organization Admin */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Organization Admin
                </h3>
                
                {organization.creator ? (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                    <Avatar className="h-10 w-10">
                      {organization.creator.profile_picture ? (
                        <AvatarImage src={organization.creator.profile_picture} alt={organization.creator.name} />
                      ) : (
                        <AvatarFallback>
                          {organization.creator.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{organization.creator.name}</p>
                      <p className="text-xs text-muted-foreground">{organization.creator.email}</p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Creator
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No admin information available</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-2">
            <Button className="flex-1 gap-2" variant="default" asChild>
              <Link href={`/organizations/${id}/edit`}>
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button className="flex-1 gap-2" variant="outline" asChild>
              <Link href={`/organizations/${id}/settings`}>
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3 p-1 bg-muted rounded-lg">
              <TabsTrigger value="members" className="flex gap-2 items-center rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Users className="h-4 w-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="events" className="flex gap-2 items-center rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex gap-2 items-center rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Star className="h-4 w-4" />
                Roles
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="members" className="mt-6 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">Organization Members</CardTitle>
                    <CardDescription>
                      Manage team members and their roles
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="sm" className="gap-1">
                      <User className="h-3.5 w-3.5" />
                      Filter
                    </Button>
                    <Button size="sm" className="gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      Invite
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {organization.members && organization.members.length > 0 ? (
                    <ScrollArea className="h-[450px] pr-4">
                      <div className="space-y-4">
                        {organization.members.map((member) => (
                          <div 
                            key={member.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/30 transition-colors group"
                          >
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12 border shadow-sm group-hover:shadow-md transition-all">
                                {member.user.profile_picture ? (
                                  <AvatarImage src={member.user.profile_picture} alt={member.user.name} />
                                ) : (
                                  <AvatarFallback className="bg-primary/5 text-primary">
                                    {member.user.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.user.name}</p>
                                <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                <div className="flex items-center mt-1.5 gap-1.5">
                                  <Badge variant="outline" className="text-xs">
                                    {member.membership_role}
                                  </Badge>
                                  {member.membership_role === 'Owner' && (
                                    <Badge variant="default" className="text-xs gap-1 bg-primary/20 text-primary hover:bg-primary/30">
                                      <Shield className="h-3 w-3" />
                                      Admin
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    Joined {new Date(member.joined_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="hidden group-hover:flex">View</Button>
                              <Button variant="outline" size="sm" className="hidden group-hover:flex">Manage</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-16 border border-dashed rounded-lg">
                      <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No members found</h3>
                      <p className="text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
                        This organization doesn't have any members yet. Start inviting people to join.
                      </p>
                      <Button>Invite Members</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="events" className="mt-6 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">Upcoming Events</CardTitle>
                    <CardDescription>
                      Events organized by {organization.name}
                    </CardDescription>
                  </div>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    New Event
                  </Button>
                </CardHeader>
                <CardContent>
                  {mockUpcomingEvents.length > 0 ? (
                    <div className="grid gap-4">
                      {mockUpcomingEvents.map((event) => (
                        <div key={event.id} className="p-4 border rounded-lg hover:bg-accent/30 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-lg">{event.name}</h3>
                            <Badge variant="outline" className="bg-primary/5">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {event.participants} Participants
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/events/${event.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed rounded-lg">
                      <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No events scheduled</h3>
                      <p className="text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
                        This organization hasn't created any events yet. Create the first one!
                      </p>
                      <Button>Create Event</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="roles" className="mt-6 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">Team Roles</CardTitle>
                    <CardDescription>
                      Manage roles and permissions within this organization
                    </CardDescription>
                  </div>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Add Role
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16 border border-dashed rounded-lg">
                    <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No custom roles defined</h3>
                    <p className="text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
                      Create custom roles to define responsibilities and permissions for team members.
                    </p>
                    <Button>Create Role</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 