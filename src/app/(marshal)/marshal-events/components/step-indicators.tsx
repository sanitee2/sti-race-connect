import { CheckCircle2 } from "lucide-react";
import { EventStepType } from "../types";

interface StepIndicatorsProps {
  steps: EventStepType[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export function StepIndicators({
  steps,
  currentStep,
  onStepClick
}: StepIndicatorsProps) {
  return (
    <div className="relative flex justify-between mb-4">
      {/* Connecting lines - positioned to align with the center of the circles */}
      <div className="absolute top-[14px] left-[16px] right-[16px] flex items-center">
        <div className="w-full h-[2px] bg-muted-foreground/20">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ 
              width: `${Math.max(((currentStep) / (steps.length - 1)) * 100, 0)}%` 
            }}
          />
        </div>
      </div>
      
      {/* Step circles */}
      <div className="w-full flex justify-between z-10">
        {steps.map((step: EventStepType, index: number) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const canNavigate = index < currentStep;
          
          return (
            <div 
              key={index} 
              className={`flex flex-col items-center ${canNavigate ? 'cursor-pointer' : ''}`}
              onClick={() => canNavigate && onStepClick(index)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground border-0'
                    : isActive
                    ? 'bg-background text-primary ring-2 ring-primary'
                    : 'bg-background border border-muted-foreground/30'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-1 font-medium transition-colors text-center max-w-[80px] leading-tight ${
                isCompleted || isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 