"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type TimePickerType = "minutes" | "hours" | "12hours";
type Period = "AM" | "PM";

interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

interface TimePickerProps {
  date?: Date | null;
  onChange?: (date: Date | undefined) => void;
  hourCycle?: 12 | 24;
  placeholder?: string;
  disabled?: boolean;
}

// Helper functions
function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

function isValidMinute(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

function getValidNumber(value: string, { max, min = 0, loop = false }: { max: number; min?: number; loop?: boolean }) {
  let numericValue = parseInt(value, 10);
  
  if (!Number.isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, "0");
  }
  
  return "00";
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return getValidNumber(value, { max: 23 });
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, { min: 1, max: 12 });
}

function getValidMinute(value: string) {
  if (isValidMinute(value)) return value;
  return getValidNumber(value, { max: 59 });
}

function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) return "00";
  switch (type) {
    case "minutes":
      return getValidMinute(String(date.getMinutes()));
    case "hours":
      return getValidHour(String(date.getHours()));
    case "12hours":
      return getValid12Hour(String(display12HourValue(date.getHours())));
    default:
      return "00";
  }
}

function setDateByType(date: Date, value: string, type: TimePickerType, period?: Period) {
  switch (type) {
    case "minutes":
      const minutes = getValidMinute(value);
      date.setMinutes(parseInt(minutes, 10));
      return date;
    case "hours":
      const hours = getValidHour(value);
      date.setHours(parseInt(hours, 10));
      return date;
    case "12hours": {
      if (!period) return date;
      const hours12 = parseInt(getValid12Hour(value), 10);
      const convertedHours = convert12HourTo24Hour(hours12, period);
      date.setHours(convertedHours);
      return date;
    }
    default:
      return date;
  }
}

function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === "PM") {
    if (hour <= 11) {
      return hour + 12;
    }
    return hour;
  }
  
  if (period === "AM") {
    if (hour === 12) return 0;
    return hour;
  }
  return hour;
}

function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return "12";
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case "minutes":
      return getValidNumber(String(parseInt(value, 10) + step), { max: 59, loop: true });
    case "hours":
      return getValidNumber(String(parseInt(value, 10) + step), { max: 23, loop: true });
    case "12hours":
      return getValidNumber(String(parseInt(value, 10) + step), { min: 1, max: 12, loop: true });
    default:
      return "00";
  }
}

const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  ({ className, type = "number", value, id, name, onDateChange, date, onRightFocus, onLeftFocus, picker, period, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    const calculatedValue = React.useMemo(() => {
      return date ? getDateByType(date, picker) : "";
    }, [date, picker]);

    // Use local value when focused, calculated value when not focused
    const displayValue = isFocused ? localValue : calculatedValue;

    React.useEffect(() => {
      if (!isFocused) {
        setLocalValue(calculatedValue);
      }
    }, [calculatedValue, isFocused]);

    const updateDateFromValue = React.useCallback(
      (newValue: string) => {
        if (!newValue || newValue === "") {
          onDateChange?.(undefined);
          return;
        }

        const numericValue = parseInt(newValue, 10);
        if (isNaN(numericValue)) return;

        // Validate ranges
        if (picker === "12hours" && (numericValue < 1 || numericValue > 12)) return;
        if (picker === "hours" && (numericValue < 0 || numericValue > 23)) return;
        if (picker === "minutes" && (numericValue < 0 || numericValue > 59)) return;

        const tempDate = date ? new Date(date) : new Date();
        tempDate.setSeconds(0);
        tempDate.setMilliseconds(0);
        
        switch (picker) {
          case "12hours":
            let hour = numericValue;
            if (period === "PM" && hour !== 12) {
              hour += 12;
            } else if (period === "AM" && hour === 12) {
              hour = 0;
            }
            tempDate.setHours(hour);
            break;
          case "hours":
            tempDate.setHours(numericValue);
            break;
          case "minutes":
            tempDate.setMinutes(numericValue);
            break;
        }

        onDateChange?.(tempDate);
      },
      [date, picker, period, onDateChange]
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle arrow keys
        if (["ArrowUp", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
          const currentVal = localValue || calculatedValue || "0";
          const step = e.key === "ArrowUp" ? 1 : -1;
          const newValue = getArrowByType(currentVal, step, picker);
          setLocalValue(newValue);
          updateDateFromValue(newValue);
          return;
        }

        // Handle Tab to move to next field
        if (e.key === "Tab") {
          if (!e.shiftKey && localValue.length >= 1) {
            updateDateFromValue(localValue);
            onRightFocus?.();
          } else if (e.shiftKey) {
            updateDateFromValue(localValue);
            onLeftFocus?.();
          }
          return;
        }

        // Handle Enter to confirm value
        if (e.key === "Enter") {
          e.preventDefault();
          updateDateFromValue(localValue);
          onRightFocus?.();
          return;
        }

        // Auto-advance when user types valid 2-digit number
        if (/^[0-9]$/.test(e.key)) {
          const newValue = localValue + e.key;
          const numericValue = parseInt(newValue, 10);
          
          // Auto-advance logic for 2-digit numbers
          setTimeout(() => {
            if (picker === "12hours" && numericValue >= 10 && numericValue <= 12) {
              updateDateFromValue(newValue);
              onRightFocus?.();
            } else if (picker === "hours" && numericValue >= 20 && numericValue <= 23) {
              updateDateFromValue(newValue);
              onRightFocus?.();
            } else if (picker === "minutes" && numericValue >= 60) {
              // Don't allow invalid minutes
              setLocalValue(localValue);
            } else if (picker === "minutes" && newValue.length === 2) {
              updateDateFromValue(newValue);
              onRightFocus?.();
            }
          }, 0);
        }
      },
      [localValue, calculatedValue, picker, updateDateFromValue, onRightFocus, onLeftFocus]
    );

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.replace(/\D/g, ''); // Only allow digits
        
        // Limit length based on picker type
        const maxLength = 2;
        const limitedValue = newValue.slice(0, maxLength);
        
        setLocalValue(limitedValue);
      },
      []
    );

    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        setLocalValue(calculatedValue);
        e.target.select();
      },
      [calculatedValue]
    );

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        if (localValue) {
          updateDateFromValue(localValue);
        }
      },
      [localValue, updateDateFromValue]
    );

    return (
      <Input
        ref={ref}
        id={id || picker}
        name={name || picker}
        className={cn(
          "w-[48px] text-center font-mono text-sm tabular-nums focus:bg-accent focus:text-accent-foreground [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        value={displayValue}
        onChange={handleChange}
        type="text"
        inputMode="numeric"
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
        maxLength={2}
        {...props}
      />
    );
  }
);

TimePickerInput.displayName = "TimePickerInput";

function PeriodSelect({
  period,
  setPeriod,
  date,
  onDateChange,
}: {
  period: Period;
  setPeriod: (period: Period) => void;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
}) {
  const handleClick = React.useCallback((newPeriod: Period) => {
    setPeriod(newPeriod);
    if (date) {
      const tempDate = new Date(date);
      const hours = tempDate.getHours();
      if (newPeriod === "AM" && hours >= 12) {
        tempDate.setHours(hours - 12);
      } else if (newPeriod === "PM" && hours < 12) {
        tempDate.setHours(hours + 12);
      }
      onDateChange?.(tempDate);
    }
  }, [period, date, onDateChange, setPeriod]);

  return (
    <div className="flex h-8 items-center">
      <Button
        size="sm"
        variant={period === "AM" ? "default" : "ghost"}
        className="h-8 w-8 p-0 text-xs font-medium"
        onClick={() => handleClick("AM")}
        type="button"
      >
        AM
      </Button>
      <Button
        size="sm"
        variant={period === "PM" ? "default" : "ghost"}
        className="h-8 w-8 p-0 text-xs font-medium"
        onClick={() => handleClick("PM")}
        type="button"
      >
        PM
      </Button>
    </div>
  );
}

function TimePicker({
  date,
  onChange,
  hourCycle = 12,
  placeholder = "Pick a time",
  disabled = false,
}: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);
  const [period, setPeriod] = React.useState<Period>(
    date ? (date.getHours() >= 12 ? "PM" : "AM") : "AM"
  );

  const displayTime = React.useMemo(() => {
    if (!date) return placeholder;
    
    if (hourCycle === 12) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }, [date, hourCycle, placeholder]);

  React.useEffect(() => {
    if (date) {
      setPeriod(date.getHours() >= 12 ? "PM" : "AM");
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="border-b px-3 py-2">
          <p className="text-sm font-medium">Select Time</p>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2">
            <div className="grid gap-1 text-center">
              <label htmlFor="hours" className="text-xs font-medium text-muted-foreground">
                Hours
              </label>
              <TimePickerInput
                picker={hourCycle === 12 ? "12hours" : "hours"}
                date={date}
                onDateChange={onChange}
                ref={hourRef}
                onRightFocus={() => minuteRef.current?.focus()}
                period={period}
              />
            </div>
            <div className="grid gap-1 text-center">
              <label htmlFor="minutes" className="text-xs font-medium text-muted-foreground">
                Minutes
              </label>
              <TimePickerInput
                picker="minutes"
                date={date}
                onDateChange={onChange}
                ref={minuteRef}
                onLeftFocus={() => hourRef.current?.focus()}
                onRightFocus={() => periodRef.current?.focus()}
              />
            </div>
            {hourCycle === 12 && (
              <div className="grid gap-1 text-center">
                <label className="text-xs font-medium text-muted-foreground">
                  Period
                </label>
                <PeriodSelect
                  period={period}
                  setPeriod={setPeriod}
                  date={date}
                  onDateChange={onChange}
                />
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                const now = new Date();
                onChange?.(now);
                setPeriod(now.getHours() >= 12 ? "PM" : "AM");
              }}
              variant="outline"
              className="text-xs"
            >
              Now
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper functions
function getMaxLength(type: TimePickerType): number {
  switch (type) {
    case "minutes":
    case "hours":
      return 2;
    case "12hours":
      return 2;
    default:
      return 2;
  }
}

export { TimePicker, TimePickerInput };
export type { TimePickerProps, TimePickerInputProps, TimePickerType, Period }; 