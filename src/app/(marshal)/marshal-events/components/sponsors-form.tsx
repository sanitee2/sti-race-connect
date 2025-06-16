import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, X } from "lucide-react";

interface Sponsor {
  name: string;
  logo_url?: string;
  website?: string;
}

interface SponsorsFormProps {
  sponsors: Sponsor[];
  onSponsorsChange: (sponsors: Sponsor[]) => void;
}

export function SponsorsForm({
  sponsors,
  onSponsorsChange
}: SponsorsFormProps) {
  const [newSponsor, setNewSponsor] = useState<Sponsor>({
    name: "",
    logo_url: "",
    website: ""
  });

  const handleAddSponsor = () => {
    if (!newSponsor.name) return;

    onSponsorsChange([...sponsors, newSponsor]);
    setNewSponsor({
      name: "",
      logo_url: "",
      website: ""
    });
  };

  const handleRemoveSponsor = (index: number) => {
    onSponsorsChange(sponsors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sponsor Name</Label>
            <Input
              placeholder="Enter sponsor name"
              value={newSponsor.name}
              onChange={(e) => setNewSponsor(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Website (Optional)</Label>
            <Input
              placeholder="Enter website URL"
              value={newSponsor.website}
              onChange={(e) => setNewSponsor(prev => ({ ...prev, website: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Logo (Optional)</Label>
          <ImageUpload
            variant="featured"
            onChange={(value) => setNewSponsor(prev => ({ ...prev, logo_url: value as string }))}
            images={newSponsor.logo_url ? [newSponsor.logo_url] : []}
            useCloud={true}
            folder="sponsor-logos"
          />
        </div>

        <Button
          type="button"
          onClick={handleAddSponsor}
          disabled={!newSponsor.name}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Sponsor
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Added Sponsors</Label>
        <div className="space-y-2">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex items-center gap-4">
                {sponsor.logo_url && (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="h-8 w-8 object-contain"
                  />
                )}
                <div>
                  <p className="font-medium">{sponsor.name}</p>
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      {sponsor.website}
                    </a>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveSponsor(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {sponsors.length === 0 && (
            <p className="text-sm text-muted-foreground">No sponsors added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
} 