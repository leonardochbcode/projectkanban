
'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from './badge';


const multiSelectVariants = cva(
    'm-0 flex w-full p-1 transition-all duration-300 ease-in-out',
    {
      variants: {
        variant: {
          default: 'min-h-10 rounded-md border border-input ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        },
      },
      defaultVariants: {
        variant: 'default',
      },
    }
);

interface MultiSelectProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof multiSelectVariants> {
  options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  maxCount?: number;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      className,
      variant,
      options,
      value,
      onValueChange,
      placeholder = 'Select options',
      maxCount = 5,
      ...props
    },
    ref
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const selectedOptions = React.useMemo(() => {
        return options.filter((option) => value.includes(option.value));
    }, [options, value]);

    const unselectedOptions = React.useMemo(() => {
        return options.filter((option) => !value.includes(option.value));
    }, [options, value]);

    const handleSelect = (selectedValue: string) => {
        if(value.length >= maxCount) return;
        onValueChange([...value, selectedValue]);
    };
    
    const handleRemove = (removedValue: string) => {
        onValueChange(value.filter((v) => v !== removedValue));
    };
    
    const inputRef = React.useRef<HTMLInputElement>(null);

    return (
        <Command
            onFocus={() => {
                setIsFocused(true);
                inputRef.current?.focus();
            }}
            onBlur={() => setIsFocused(false)}
            ref={ref}
            className='h-auto overflow-visible bg-transparent'
        >
            <div
                className={cn(multiSelectVariants({ variant }), className, {
                    'ring-2 ring-ring ring-offset-2': isFocused,
                })}
            >
                <div className='flex flex-wrap gap-1'>
                    {selectedOptions.map((option) => (
                        <Badge
                            key={option.value}
                            variant='secondary'
                            className='rounded-md px-2 py-1'
                        >
                            {option.label}
                            <Button
                                aria-label={`Remove ${option.label} option`}
                                size='icon'
                                className='ml-2 h-4 w-4 rounded-full'
                                variant='ghost'
                                onClick={() => handleRemove(option.value)}
                            >
                                <X className='h-3 w-3' />
                            </Button>
                        </Badge>
                    ))}
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            placeholder={value.length > 0 ? '' : placeholder}
                            onFocus={() => setIsPopoverOpen(true)}
                            onBlurCapture={() => setIsPopoverOpen(false)}
                            className='w-full bg-transparent p-1 text-sm outline-none placeholder:text-muted-foreground'
                        />
                        {isPopoverOpen && (
                             <div 
                                className="absolute top-full z-10 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
                            >
                                <CommandList>
                                    <CommandGroup>
                                        {unselectedOptions.map((option) => (
                                            <CommandItem
                                                key={option.value}
                                                onMouseDown={(e) => e.preventDefault()}
                                                onSelect={() => handleSelect(option.value)}
                                                className='flex cursor-pointer items-center justify-between'
                                            >
                                                <div className='flex items-center'>
                                                {option.icon && (
                                                    <option.icon className='mr-2 h-4 w-4' />
                                                )}
                                                {option.label}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Command>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };
