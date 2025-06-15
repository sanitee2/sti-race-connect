"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Event } from "@/app/(marshal)/marshal-events/types";
import { toast } from "sonner";
import Image from "next/image";
import { Trash2, Plus } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface Sponsor {
  name: string;
  logo_url?: string;
  website?: string;
}

interface SponsorsCardProps {
  event: Event;
}

export function SponsorsCard({ event }: SponsorsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [sponsors, setSponsors] = useState<Sponsor[]>(event.sponsors || []);
  const [newSponsor, setNewSponsor] = useState<Sponsor>({
    name: "",
    logo_url: "",
    website: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSponsor = () => {
    if (!newSponsor.name) {
      toast.error("Sponsor name is required");
      return;
    }

    setSponsors([...sponsors, { ...newSponsor }]);
    setNewSponsor({
      name: "",
      logo_url: "",
      website: ""
    });
  };

  const handleRemoveSponsor = (index: number) => {
    const updatedSponsors = [...sponsors];
    updatedSponsors.splice(index, 1);
    setSponsors(updatedSponsors);
  };

  const handleUpdateSponsor = (index: number, field: keyof Sponsor, value: string) => {
    const updatedSponsors = [...sponsors];
    updatedSponsors[index][field] = value;
    setSponsors(updatedSponsors);
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsors: sponsors
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update sponsors');
      }

      toast.success('Sponsors updated successfully');
      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating sponsors:', error);
      toast.error('Failed to update sponsors');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sponsors</CardTitle>
        {!isEditing ? (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            {/* Existing sponsors */}
            {sponsors.length > 0 ? (
              <div className="space-y-4">
                {sponsors.map((sponsor, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">Edit Sponsor</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleRemoveSponsor(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Sponsor Name</Label>
                        <Input 
                          value={sponsor.name} 
                          onChange={e => handleUpdateSponsor(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Website URL</Label>
                        <Input 
                          value={sponsor.website || ''} 
                          onChange={e => handleUpdateSponsor(index, 'website', e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Logo</Label>
                        <div className="mt-2">
                          <ImageUpload
                            variant="featured"
                            images={sponsor.logo_url ? [sponsor.logo_url] : []}
                            onChange={(value) => handleUpdateSponsor(index, 'logo_url', value as string)}
                            useCloud={true}
                            folder="sponsor-logos"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No sponsors yet. Add one below.</p>
            )}

            {/* Add new sponsor */}
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <h3 className="font-medium">Add New Sponsor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Sponsor Name</Label>
                  <Input 
                    value={newSponsor.name} 
                    onChange={e => setNewSponsor({...newSponsor, name: e.target.value})}
                    placeholder="e.g., Acme Corporation"
                  />
                </div>
                <div>
                  <Label>Website URL</Label>
                  <Input 
                    value={newSponsor.website || ''} 
                    onChange={e => setNewSponsor({...newSponsor, website: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Logo</Label>
                  <div className="mt-2">
                    <ImageUpload
                      variant="featured"
                      images={newSponsor.logo_url ? [newSponsor.logo_url] : []}
                      onChange={(value) => setNewSponsor({...newSponsor, logo_url: value as string})}
                      useCloud={true}
                      folder="sponsor-logos"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={handleAddSponsor} className="mt-4">
                <Plus className="h-4 w-4 mr-1" /> Add Sponsor
              </Button>
            </div>
          </div>
        ) : (
          // Display mode
          sponsors && sponsors.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sponsors.map((sponsor, index) => (
                <div key={index} className="border rounded-lg p-4 flex flex-col items-center">
                  {sponsor.logo_url ? (
                    <div className="relative h-24 w-full mb-3">
                      <Image
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 50vw, 150px"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-full mb-3 bg-muted flex items-center justify-center rounded-md">
                      <p className="text-xs text-muted-foreground">No logo</p>
                    </div>
                  )}
                  <p className="font-medium text-center">{sponsor.name}</p>
                  {sponsor.website && (
                    <a 
                      href={sponsor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary mt-2"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No sponsors added.</p>
          )
        )}
      </CardContent>
    </Card>
  );
} 