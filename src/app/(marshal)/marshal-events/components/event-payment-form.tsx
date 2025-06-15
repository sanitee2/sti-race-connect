import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { CategoryFormData, PaymentMethod } from "../types";

interface EventPaymentFormProps {
  isFreeEvent: boolean;
  price?: number;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: Date;
  categories?: CategoryFormData[];
  paymentMethods?: PaymentMethod[];
  onFreeEventChange: (value: boolean) => void;
  onPriceChange: (value: number | undefined) => void;
  onEarlyBirdPriceChange: (value: number | undefined) => void;
  onEarlyBirdEndDateChange: (date: Date | undefined) => void;
  onCategoryPriceChange: (index: number, price: number | undefined) => void;
  onCategoryEarlyBirdPriceChange: (index: number, price: number | undefined) => void;
  onPaymentMethodsChange: (methods: PaymentMethod[]) => void;
}

export function EventPaymentForm({
  isFreeEvent,
  price,
  earlyBirdPrice,
  earlyBirdEndDate,
  categories,
  paymentMethods = [],
  onFreeEventChange,
  onPriceChange,
  onEarlyBirdPriceChange,
  onEarlyBirdEndDateChange,
  onCategoryPriceChange,
  onCategoryEarlyBirdPriceChange,
  onPaymentMethodsChange
}: EventPaymentFormProps) {
  const addPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: Math.random().toString(36).substring(7),
      name: "",
      type: 'account_number',
      value: ""
    };
    onPaymentMethodsChange([...paymentMethods, newMethod]);
  };

  const updatePaymentMethod = (id: string, updates: Partial<PaymentMethod>) => {
    onPaymentMethodsChange(
      paymentMethods.map(method => 
        method.id === id ? { ...method, ...updates } : method
      )
    );
  };

  const removePaymentMethod = (id: string) => {
    onPaymentMethodsChange(paymentMethods.filter(method => method.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Free Event Toggle Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Free Event</Label>
            <p className="text-sm text-muted-foreground">
              Toggle if this is a free event with no registration fees
            </p>
          </div>
          <Switch
            checked={isFreeEvent}
            onCheckedChange={onFreeEventChange}
          />
        </div>
      </div>

      {!isFreeEvent && (
        <>
          {/* Payment Methods Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Payment Methods</Label>
                <p className="text-sm text-muted-foreground">
                  Add payment methods that participants can use to pay for registration
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPaymentMethod}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Method Name</Label>
                          <Input
                            placeholder="e.g., BDO Bank Transfer"
                            value={method.name}
                            onChange={(e) => updatePaymentMethod(method.id, { name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Payment Type</Label>
                          <Select
                            value={method.type}
                            onValueChange={(value: 'account_number' | 'image') => 
                              updatePaymentMethod(method.id, { type: value, value: '' })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="account_number">Account Number</SelectItem>
                              <SelectItem value="image">QR Code/Image</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {method.type === 'account_number' ? (
                        <div className="space-y-2">
                          <Label>Account Number</Label>
                          <Input
                            placeholder="Enter account number"
                            value={method.value}
                            onChange={(e) => updatePaymentMethod(method.id, { value: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>QR Code/Image</Label>
                          <ImageUpload
                            variant="featured"
                            onChange={(value) => updatePaymentMethod(method.id, { value: value as string })}
                            images={method.value ? [method.value] : []}
                            useCloud={true}
                            folder="payment-methods"
                          />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive h-9"
                      onClick={() => removePaymentMethod(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {paymentMethods.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-muted-foreground mb-4">No payment methods added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPaymentMethod}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Payment Method
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="border rounded-lg p-4 space-y-4">
            {categories && categories.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Category Prices</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set registration fees for each category
                  </p>
                  <div className="space-y-4">
                    {categories.map((category, index) => (
                      <div key={index} className="grid gap-4 border rounded-lg p-4">
                        <h4 className="font-medium">{category.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`category-${index}-price`}>Regular Price</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-[9px] text-muted-foreground">₱</span>
                              <Input
                                id={`category-${index}-price`}
                                type="number"
                                placeholder="0.00"
                                className="pl-7"
                                value={category.price || ""}
                                onChange={(e) => {
                                  const value = e.target.value ? Number(e.target.value) : undefined;
                                  onCategoryPriceChange(index, value);
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`category-${index}-early-bird`}>Early Bird Price</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-[9px] text-muted-foreground">₱</span>
                              <Input
                                id={`category-${index}-early-bird`}
                                type="number"
                                placeholder="0.00"
                                className="pl-7"
                                value={category.earlyBirdPrice || ""}
                                onChange={(e) => {
                                  const value = e.target.value ? Number(e.target.value) : undefined;
                                  onCategoryEarlyBirdPriceChange(index, value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Regular Price <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">₱</span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7"
                      placeholder="0.00"
                      value={price || ""}
                      onChange={(e) => onPriceChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="early-bird-price">
                    Early Bird Price <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">₱</span>
                    <Input
                      id="early-bird-price"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7"
                      placeholder="0.00"
                      value={earlyBirdPrice || ""}
                      onChange={(e) => onEarlyBirdPriceChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                {earlyBirdPrice !== undefined && earlyBirdPrice > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="early-bird-end-date">
                      Early Bird End Date <span className="text-destructive">*</span>
                    </Label>
                    <DatePicker
                      date={earlyBirdEndDate}
                      onSelect={onEarlyBirdEndDateChange}
                    />
                  </div>
                )}

                {categories && categories.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Category Prices</h3>
                    {categories.map((category, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium">{category.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`category-price-${index}`}>
                              Regular Price <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5">₱</span>
                              <Input
                                id={`category-price-${index}`}
                                type="number"
                                min="0"
                                step="0.01"
                                className="pl-7"
                                placeholder="0.00"
                                value={category.price || ""}
                                onChange={(e) => onCategoryPriceChange(index, e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`category-early-bird-price-${index}`}>
                              Early Bird Price <span className="text-muted-foreground">(Optional)</span>
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5">₱</span>
                              <Input
                                id={`category-early-bird-price-${index}`}
                                type="number"
                                min="0"
                                step="0.01"
                                className="pl-7"
                                placeholder="0.00"
                                value={category.earlyBirdPrice || ""}
                                onChange={(e) => onCategoryEarlyBirdPriceChange(index, e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Payment Methods</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPaymentMethod}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Method
                    </Button>
                  </div>

                  {paymentMethods && paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method, index) => (
                        <div key={method.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Payment Method {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePaymentMethod(method.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`payment-method-name-${index}`}>
                                Method Name <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`payment-method-name-${index}`}
                                placeholder="e.g., GCash, Bank Transfer"
                                value={method.name}
                                onChange={(e) => updatePaymentMethod(method.id, { name: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>
                                Method Type <span className="text-destructive">*</span>
                              </Label>
                              <Select
                                value={method.type}
                                onValueChange={(value: 'account_number' | 'image') => updatePaymentMethod(method.id, { type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment method type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="account_number">Account Number</SelectItem>
                                  <SelectItem value="image">QR Code / Image</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {method.type === 'account_number' ? (
                              <div className="space-y-2">
                                <Label htmlFor={`payment-method-value-${index}`}>
                                  Account Number <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id={`payment-method-value-${index}`}
                                  placeholder="Enter account number"
                                  value={method.value}
                                  onChange={(e) => updatePaymentMethod(method.id, { value: e.target.value })}
                                />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label>
                                  QR Code / Payment Image <span className="text-destructive">*</span>
                                </Label>
                                <ImageUpload
                                  key={`payment-method-${index}`}
                                  variant="featured"
                                  onChange={(value) => updatePaymentMethod(method.id, { value: value as string })}
                                  images={method.value ? [method.value] : []}
                                  useCloud={true}
                                  folder="payment-methods"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <p className="text-muted-foreground mb-4">No payment methods added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addPaymentMethod}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Method
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Early Bird Deadline Section */}
          <div className="border rounded-lg p-4 space-y-2">
            <Label>Early Bird Registration Deadline</Label>
            <DatePicker
              date={earlyBirdEndDate}
              onSelect={onEarlyBirdEndDateChange}
            />
            <p className="text-sm text-muted-foreground">
              Select when the early bird registration period will end
            </p>
          </div>
        </>
      )}
    </div>
  );
} 