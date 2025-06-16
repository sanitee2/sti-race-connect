"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Event, EventCategory } from "@/app/(marshal)/marshal-events/types";
import { toast } from "sonner";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface CategoriesCardProps {
  event: Event;
}

export function CategoriesCard({ event }: CategoriesCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>(event.categories || []);
  const [newCategory, setNewCategory] = useState<Partial<EventCategory>>({
    name: "",
    description: "",
    targetAudience: "",
    image: "",
    has_slot_limit: false,
    slot_limit: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast.error("Category name is required");
      return;
    }

    // Create a temporary ID for UI purposes
    const tempCategory = {
      ...newCategory,
      id: `temp-${Date.now()}`,
      participants: 0
    } as EventCategory;

    setCategories([...categories, tempCategory]);
    setNewCategory({
      name: "",
      description: "",
      targetAudience: "",
      image: "",
      has_slot_limit: false,
      slot_limit: null
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const handleUpdateCategory = (index: number, field: string, value: any) => {
    const updatedCategories = [...categories];
    (updatedCategories[index] as any)[field] = value;
    setCategories(updatedCategories);
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      // Save each category
      for (const category of categories) {
        if (category.id.startsWith('temp-')) {
          // Create new category
          await fetch(`/api/events/${event.id}/categories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: category.name,
              description: category.description,
              targetAudience: category.targetAudience,
              image: category.image,
              hasSlotLimit: category.has_slot_limit,
              slotLimit: category.slot_limit
            }),
          });
        } else {
          // Update existing category
          await fetch(`/api/events/${event.id}/categories/${category.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: category.name,
              description: category.description,
              targetAudience: category.targetAudience,
              image: category.image,
              hasSlotLimit: category.has_slot_limit,
              slotLimit: category.slot_limit
            }),
          });
        }
      }

      // Handle deleted categories - compare original event categories with current categories
      const originalCategoryIds = new Set(event.categories?.map(cat => cat.id) || []);
      const currentCategoryIds = new Set(categories.filter(cat => !cat.id.startsWith('temp-')).map(cat => cat.id));
      
      for (const originalId of originalCategoryIds) {
        if (!currentCategoryIds.has(originalId)) {
          // This category was deleted
          await fetch(`/api/events/${event.id}/categories/${originalId}`, {
            method: 'DELETE',
          });
        }
      }

      toast.success("Categories updated successfully");
      setIsEditing(false);
      // Refresh to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating categories:", error);
      toast.error("Failed to update categories");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categories</CardTitle>
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
            {/* Existing categories */}
            {categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <div key={category.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">Edit Category</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleRemoveCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Category Name</Label>
                        <Input 
                          value={category.name} 
                          onChange={e => handleUpdateCategory(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Target Audience</Label>
                        <Input 
                          value={category.targetAudience || ''} 
                          onChange={e => handleUpdateCategory(index, 'targetAudience', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={category.description || ''} 
                          onChange={e => handleUpdateCategory(index, 'description', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Category Image</Label>
                        <div className="mt-2">
                          <ImageUpload
                            variant="featured"
                            images={category.image ? [category.image] : []}
                            onChange={(value) => handleUpdateCategory(index, 'image', value as string)}
                            useCloud={true}
                            folder="category-images"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`has-slot-limit-${index}`}
                            checked={category.has_slot_limit || false}
                            onChange={e => handleUpdateCategory(index, 'has_slot_limit', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`has-slot-limit-${index}`}>Has Slot Limit</Label>
                        </div>
                        {category.has_slot_limit && (
                          <div>
                            <Label>Slot Limit</Label>
                            <Input 
                              type="number" 
                              value={category.slot_limit || ''} 
                              onChange={e => handleUpdateCategory(index, 'slot_limit', parseInt(e.target.value))}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {category.participants > 0 && (
                      <div className="mt-2 text-sm text-amber-600">
                        Warning: This category has {category.participants} participants. Changes may affect them.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No categories yet. Add one below.</p>
            )}

            {/* Add new category form */}
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <h3 className="font-medium">Add New Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category Name</Label>
                  <Input 
                    value={newCategory.name} 
                    onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="e.g., 5K Run"
                  />
                </div>
                <div>
                  <Label>Target Audience</Label>
                  <Input 
                    value={newCategory.targetAudience} 
                    onChange={e => setNewCategory({...newCategory, targetAudience: e.target.value})}
                    placeholder="e.g., Beginners"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={newCategory.description} 
                    onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="Describe this category..."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Category Image</Label>
                  <div className="mt-2">
                    <ImageUpload
                      variant="featured"
                      images={newCategory.image ? [newCategory.image as string] : []}
                      onChange={(value) => setNewCategory({...newCategory, image: value as string})}
                      useCloud={true}
                      folder="category-images"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="new-has-slot-limit"
                      checked={newCategory.has_slot_limit || false}
                      onChange={e => setNewCategory({...newCategory, has_slot_limit: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="new-has-slot-limit">Has Slot Limit</Label>
                  </div>
                  {newCategory.has_slot_limit && (
                    <div>
                      <Label>Slot Limit</Label>
                      <Input 
                        type="number" 
                        value={newCategory.slot_limit || ''} 
                        onChange={e => setNewCategory({...newCategory, slot_limit: parseInt(e.target.value)})}
                        placeholder="100"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleAddCategory} className="mt-4">
                Add Category
              </Button>
            </div>
          </div>
        ) : (
          // Display mode
          categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category: EventCategory) => (
                <div key={category.id} className="border rounded-lg p-4 space-y-3">
                  {category.image && (
                    <div className="relative aspect-video w-full rounded-md overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.targetAudience && (
                      <Badge variant="secondary">{category.targetAudience}</Badge>
                    )}
                    <Badge variant="outline">{category.participants} participants</Badge>
                    {category.has_slot_limit && category.slot_limit && (
                      <Badge variant="outline">
                        {category.participants}/{category.slot_limit} slots filled
                      </Badge>
                    )}
                    {category.price && (
                      <Badge variant="outline">₱{category.price}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No categories for this event.</p>
          )
        )}
      </CardContent>
    </Card>
  );
} 