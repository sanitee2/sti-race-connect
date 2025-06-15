import { EventFormData, CategoryFormData } from "../../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Switch } from "@/components/ui/switch";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import React, { useState } from "react";

interface StepCategoriesProps {
  eventFormData: EventFormData;
  setEventFormData: (updater: (prev: EventFormData) => EventFormData) => void;
}

export function StepCategories({ eventFormData, setEventFormData }: StepCategoriesProps) {
  const [confirmRemoveIndex, setConfirmRemoveIndex] = useState<number | null>(null);

  // Helper to check if a category has any details filled in
  const isCategoryFilled = (cat: CategoryFormData) => {
    return (
      cat.name.trim() ||
      cat.description.trim() ||
      cat.targetAudience.trim() ||
      cat.image ||
      cat.hasSlotLimit ||
      cat.slotLimit ||
      cat.hasCutOffTime ||
      cat.cutOffTime ||
      cat.gunStartTime ||
      cat.price ||
      cat.earlyBirdPrice
    );
  };

  const handleRemoveCategory = (index: number) => {
    setEventFormData(prev => ({
      ...prev,
      categories: prev.categories?.filter((_, i) => i !== index)
    }));
    setConfirmRemoveIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Event Categories</h3>
          <p className="text-sm text-muted-foreground">
            Add categories for your event (e.g., 5K Run, Marathon, Kids Race)
          </p>
        </div>
      </div>

      {eventFormData.categories && eventFormData.categories.length > 0 ? (
        <div className="space-y-4">
          {eventFormData.categories.map((category, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              {/* Category header with number and trash icon */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-lg">Category {index + 1}</span>
                <button
                  type="button"
                  className="text-destructive hover:bg-destructive/10 rounded p-1"
                  onClick={() => {
                    if (isCategoryFilled(category)) {
                      setConfirmRemoveIndex(index);
                    } else {
                      handleRemoveCategory(index);
                    }
                  }}
                  aria-label="Remove Category"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`category-name-${index}`}>Category Name <span className="text-destructive">*</span></Label>
                  <Input
                    id={`category-name-${index}`}
                    placeholder="e.g., 5K Run, Marathon"
                    value={category.name}
                    onChange={(e) => {
                      setEventFormData(prev => ({
                        ...prev,
                        categories: prev.categories?.map((cat, i) => 
                          i === index ? { ...cat, name: e.target.value } : cat
                        )
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`category-target-${index}`}>Target Audience <span className="text-destructive">*</span></Label>
                  <Input
                    id={`category-target-${index}`}
                    placeholder="e.g., Adults, Kids, Professionals"
                    value={category.targetAudience}
                    onChange={(e) => {
                      setEventFormData(prev => ({
                        ...prev,
                        categories: prev.categories?.map((cat, i) => 
                          i === index ? { ...cat, targetAudience: e.target.value } : cat
                        )
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`category-description-${index}`}>Description <span className="text-destructive">*</span></Label>
                <Textarea
                  id={`category-description-${index}`}
                  placeholder="Brief description of this category"
                  rows={2}
                  value={category.description}
                  onChange={(e) => {
                    setEventFormData(prev => ({
                      ...prev,
                      categories: prev.categories?.map((cat, i) => 
                        i === index ? { ...cat, description: e.target.value } : cat
                      )
                    }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Category Image <span className="text-muted-foreground">(Optional)</span></Label>
                <ImageUpload
                  key={`category-${index}`}
                  variant="featured"
                  onChange={(value) => {
                    setEventFormData(prev => ({
                      ...prev,
                      categories: prev.categories?.map((cat, i) => 
                        i === index ? { ...cat, image: value as string } : cat
                      )
                    }));
                  }}
                  images={category.image ? [category.image] : []}
                  useCloud={true}
                  folder="category-images"
                />
                <p className="text-xs text-muted-foreground">
                  Upload an image for this category (optional)
                </p>
              </div>

              {/* Gun Start Time & Cut-off Time - side by side, no card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Gun Start Time */}
                <div>
                  <Label className="mt-1.5" htmlFor={`category-gunstart-${index}`}>Gun Start Time <span className="text-muted-foreground">(Optional)</span></Label>
                  <p className="text-sm text-muted-foreground mb-2.5 mt-2">
                    Official start time for this category.
                  </p>
                  <TimePicker
                    date={category.gunStartTime}
                    onChange={(time) => {
                      setEventFormData(prev => ({
                        ...prev,
                        categories: prev.categories?.map((cat, i) =>
                          i === index ? { ...cat, gunStartTime: time } : cat
                        )
                      }));
                    }}
                    hourCycle={12}
                    placeholder="Select gun start time"
                  />
                </div>
                {/* Cut-off Time */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`category-cutoff-${index}`}>Cut-off Time <span className="text-muted-foreground">(Optional)</span></Label>
                    <Switch
                      id={`category-cutoff-${index}`}
                      checked={category.hasCutOffTime}
                      onCheckedChange={(checked) => {
                        setEventFormData(prev => ({
                          ...prev,
                          categories: prev.categories?.map((cat, i) =>
                            i === index ? { 
                              ...cat, 
                              hasCutOffTime: checked,
                              cutOffTime: checked ? cat.cutOffTime : undefined
                            } : cat
                          )
                        }));
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 mt-1.5">
                    Latest time to finish for this category.
                  </p>
                  {category.hasCutOffTime && (
                    <div className="mt-2">
                      <TimePicker
                        date={category.cutOffTime}
                        onChange={(time) => {
                          setEventFormData(prev => ({
                            ...prev,
                            categories: prev.categories?.map((cat, i) =>
                              i === index ? { ...cat, cutOffTime: time } : cat
                            )
                          }));
                        }}
                        hourCycle={12}
                        placeholder="Select cut-off time"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Slot Limit - label and switch on same row, description below */}
              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`category-slot-limit-${index}`}>Slot Limit <span className="text-muted-foreground">(Optional)</span></Label>
                  <Switch
                    id={`category-slot-limit-${index}`}
                    checked={category.hasSlotLimit}
                    onCheckedChange={(checked) => {
                      setEventFormData(prev => ({
                        ...prev,
                        categories: prev.categories?.map((cat, i) => 
                          i === index ? { 
                            ...cat, 
                            hasSlotLimit: checked,
                            slotLimit: checked ? cat.slotLimit : 0
                          } : cat
                        )
                      }));
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Set a maximum number of participants for this category
                </p>
                {category.hasSlotLimit && (
                  <div className="mt-4">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Enter slot limit"
                      value={category.slotLimit}
                      onChange={(e) => {
                        setEventFormData(prev => ({
                          ...prev,
                          categories: prev.categories?.map((cat, i) => 
                            i === index ? { ...cat, slotLimit: parseInt(e.target.value) || 0 } : cat
                          )
                        }));
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Confirmation Dialog for removal */}
              {confirmRemoveIndex === index && (
                <ConfirmationDialog
                  open={true}
                  onOpenChange={(open) => {
                    if (!open) setConfirmRemoveIndex(null);
                  }}
                  title="Remove Category?"
                  description="Are you sure you want to remove this category? All entered details will be lost."
                  confirmText="Remove"
                  cancelText="Cancel"
                  variant="danger"
                  onConfirm={() => handleRemoveCategory(index)}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newCategory: CategoryFormData = {
                  name: "",
                  description: "",
                  targetAudience: "",
                  image: "",
                  hasSlotLimit: false,
                  slotLimit: 0,
                  hasCutOffTime: false,
                  cutOffTime: undefined,
                  gunStartTime: undefined
                };
                setEventFormData(prev => ({
                  ...prev,
                  categories: [...(prev.categories || []), newCategory]
                }));
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* General event-level fields if no categories */}
          <div className="space-y-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* General Gun Start Time */}
              <div>
                <Label className="mt-1.5" htmlFor="event-gunstart">Gun Start Time <span className="text-muted-foreground">(Optional)</span></Label>
                <p className="text-sm text-muted-foreground mb-2.5 mt-2">Official start time for this event.</p>
                <TimePicker
                  date={eventFormData.gunStartTime}
                  onChange={(time) => setEventFormData(prev => ({ ...prev, gunStartTime: time }))}
                  hourCycle={12}
                  placeholder="Select gun start time"
                />
              </div>
              {/* General Cut-off Time */}
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="event-cutoff">Cut-off Time <span className="text-muted-foreground">(Optional)</span></Label>
                </div>
                <p className="text-sm text-muted-foreground mb-2.5 mt-2">Latest time to finish for this event.</p>
                <TimePicker
                  date={eventFormData.cutOffTime}
                  onChange={(time) => setEventFormData(prev => ({ ...prev, cutOffTime: time }))}
                  hourCycle={12}
                  placeholder="Select cut-off time"
                />
              </div>
            </div>
            {/* General Slot Limit */}
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="event-slot-limit">Slot Limit <span className="text-muted-foreground">(Optional)</span></Label>
                <Switch
                  id="event-slot-limit"
                  checked={!!eventFormData.hasSlotLimit}
                  onCheckedChange={(checked) => setEventFormData(prev => ({ ...prev, hasSlotLimit: checked, slotLimit: checked ? prev.slotLimit || 0 : undefined }))}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Set a maximum number of participants for this event</p>
              {eventFormData.hasSlotLimit && (
                <div className="mt-4">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter slot limit"
                    value={eventFormData.slotLimit || ""}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      setEventFormData(prev => ({ ...prev, slotLimit: value }));
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">No categories added yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click the "Add Category" button to create your first category
            </p>
            <div className="flex justify-center pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newCategory: CategoryFormData = {
                    name: "",
                    description: "",
                    targetAudience: "",
                    image: "",
                    hasSlotLimit: false,
                    slotLimit: 0,
                    hasCutOffTime: false,
                    cutOffTime: undefined,
                    gunStartTime: undefined
                  };
                  setEventFormData(prev => ({
                    ...prev,
                    categories: [...(prev.categories || []), newCategory]
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 