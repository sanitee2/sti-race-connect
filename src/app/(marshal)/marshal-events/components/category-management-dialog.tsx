import Image from "next/image";
import { Flag, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageUpload } from "@/components/ui/image-upload";
import { Event, EventCategory, CategoryFormData } from "@/app/(marshal)/marshal-events/types/index";
import { Switch } from "@/components/ui/switch";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  categoryFormData: CategoryFormData;
  editingCategory: EventCategory | null;
  isLoading: boolean;
  onCategoryFormChange: (data: Partial<CategoryFormData>) => void;
  onAddCategory: () => void;
  onEditCategory: () => void;
  onDeleteCategory: (category: EventCategory) => void;
  onStartEditCategory: (category: EventCategory) => void;
  onCancelEdit: () => void;
}

export function CategoryManagementDialog({
  open,
  onOpenChange,
  event,
  categoryFormData,
  editingCategory,
  isLoading,
  onCategoryFormChange,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onStartEditCategory,
  onCancelEdit
}: CategoryManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Event Categories</DialogTitle>
          <DialogDescription>
            {event ? `Create and manage categories for ${event.name}` : 'Create and manage event categories'}
          </DialogDescription>
        </DialogHeader>
        
        {event && (
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Current Categories</h3>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.categories && event.categories.length > 0 ? (
                    event.categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {category.image ? (
                            <div className="relative w-12 h-12 rounded-md overflow-hidden">
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                              <Flag className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>{category.targetAudience}</TableCell>
                        <TableCell>{category.participants}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => onStartEditCategory(category)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => onDeleteCategory(category)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No categories added to this event yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-muted/50 rounded-md p-4 mt-4">
              <h4 className="text-sm font-medium mb-2">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category-name" className="text-right">
                    Category Name *
                  </Label>
                  <Input 
                    id="category-name" 
                    placeholder="e.g., 5K Run, Marathon" 
                    className="col-span-3"
                    value={categoryFormData.name}
                    onChange={(e) => onCategoryFormChange({ name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category-description" className="text-right">
                    Description
                  </Label>
                  <Input 
                    id="category-description" 
                    placeholder="Brief description of this category" 
                    className="col-span-3"
                    value={categoryFormData.description}
                    onChange={(e) => onCategoryFormChange({ description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category-target-audience" className="text-right">
                    Target Audience
                  </Label>
                  <Input 
                    id="category-target-audience" 
                    placeholder="e.g., Adults, Children, Elite runners" 
                    className="col-span-3"
                    value={categoryFormData.targetAudience}
                    onChange={(e) => onCategoryFormChange({ targetAudience: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right col-span-1">
                    <Label>Slot Limit</Label>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Set a maximum number of participants
                      </p>
                      <Switch
                        checked={categoryFormData.hasSlotLimit}
                        onCheckedChange={(checked) => {
                          onCategoryFormChange({ 
                            hasSlotLimit: checked,
                            slotLimit: checked ? categoryFormData.slotLimit || 0 : undefined 
                          });
                        }}
                      />
                    </div>
                    {categoryFormData.hasSlotLimit && (
                      <div className="mt-2">
                        <Input
                          id="category-slot-limit"
                          type="number"
                          min="1"
                          placeholder="Enter maximum number of participants"
                          value={categoryFormData.slotLimit || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                            onCategoryFormChange({ slotLimit: value });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Category Image Upload */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">
                    Category Image
                  </Label>
                  <div className="col-span-3">
                    <ImageUpload 
                      key={editingCategory ? `edit-${editingCategory.id}` : 'add-new'}
                      variant="featured"
                      onChange={(value) => onCategoryFormChange({ image: value as string })}
                      images={categoryFormData.image ? [categoryFormData.image] : []}
                      useCloud={true}
                      folder="category-images"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload an image for this category (optional)
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  {editingCategory && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onCancelEdit}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    onClick={editingCategory ? onEditCategory : onAddCategory}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : editingCategory ? "Update Category" : "Add Category"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 