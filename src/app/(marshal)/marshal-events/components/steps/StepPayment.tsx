import { EventFormData } from "../../types";
import { EventPaymentForm } from "../event-payment-form";

interface StepPaymentProps {
  eventFormData: EventFormData;
  setEventFormData: (updater: (prev: EventFormData) => EventFormData) => void;
}

export function StepPayment({ eventFormData, setEventFormData }: StepPaymentProps) {
  return (
    <EventPaymentForm
      isFreeEvent={eventFormData.isFreeEvent || false}
      price={eventFormData.price}
      earlyBirdPrice={eventFormData.earlyBirdPrice}
      earlyBirdEndDate={eventFormData.earlyBirdEndDate}
      categories={eventFormData.categories}
      paymentMethods={eventFormData.paymentMethods}
      onFreeEventChange={(value: boolean) => setEventFormData(prev => ({ ...prev, isFreeEvent: value }))}
      onPriceChange={(value: number | undefined) => setEventFormData(prev => ({ ...prev, price: value }))}
      onEarlyBirdPriceChange={(value: number | undefined) => setEventFormData(prev => ({ ...prev, earlyBirdPrice: value }))}
      onEarlyBirdEndDateChange={(date: Date | undefined) => setEventFormData(prev => ({ ...prev, earlyBirdEndDate: date }))}
      onCategoryPriceChange={(index: number, price: number | undefined) => {
        setEventFormData(prev => ({
          ...prev,
          categories: prev.categories?.map((cat, i) =>
            i === index ? { ...cat, price } : cat
          )
        }));
      }}
      onCategoryEarlyBirdPriceChange={(index: number, price: number | undefined) => {
        setEventFormData(prev => ({
          ...prev,
          categories: prev.categories?.map((cat, i) =>
            i === index ? { ...cat, earlyBirdPrice: price } : cat
          )
        }));
      }}
      onPaymentMethodsChange={(methods) => setEventFormData(prev => ({ ...prev, paymentMethods: methods }))}
    />
  );
} 