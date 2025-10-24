'use client';
import * as React from 'react';
import { cva } from 'class-variance-authority';
import { Check, X, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

const multiSelectTriggerVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background [&>span]:line-clamp-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'transition-colors hover:bg-muted/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary';
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  maxCount?: number;
  asChild?: boolean;
  className?: string;
}

const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      variant,
      options,
      value = [],
      onValueChange,
      placeholder = 'Select options',
      maxCount = 3,
      asChild = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true);
      } else if (event.key === 'Backspace' && !event.currentTarget.value) {
        const newSelectedValues = [...value];
        newSelectedValues.pop();
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (optionValue: string) => {
      const newSelectedValues = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onValueChange(newSelectedValues);
    };

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            {...props}
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={cn(multiSelectTriggerVariants({ variant, className }))}
          >
            {value.length > 0 ? (
              <div className="flex w-full items-center gap-1">
                {value.slice(0, maxCount).map((selectedValue) => {
                  const option = options.find((o) => o.value === selectedValue);
                  if (!option) return null;
                  return (
                    <Badge
                      key={selectedValue}
                      variant="secondary"
                      className="whitespace-nowrap"
                    >
                      {option.label}
                    </Badge>
                  );
                })}
                {value.length > maxCount && (
                  <Badge
                    variant="secondary"
                    className="whitespace-nowrap"
                  >
                    {`+${value.length - maxCount}`}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder="Search..."
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    style={{
                      pointerEvents: 'auto',
                      opacity: 1,
                    }}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        value.includes(option.value)
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {value.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onValueChange([])}
                      style={{
                        pointerEvents: 'auto',
                        opacity: 1,
                      }}
                      className="justify-center text-center"
                    >
                      Clear selection
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };
