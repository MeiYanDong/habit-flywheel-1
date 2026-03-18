import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{
    value: string
    label: string
    icon?: React.ReactNode
    count?: number
    description?: string
  }>
  placeholder?: string
  className?: string
  width?: string
}

const EnhancedSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  EnhancedSelectProps
>(({ value, onValueChange, options, placeholder, className, width = "w-40", ...props }, ref) => {
  const selectedOption = options.find(option => option.value === value)

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "enhanced-select-trigger flex h-11 items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-[hsl(var(--primary)/0.4)] hover:shadow-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brass)/0.22)] disabled:cursor-not-allowed disabled:opacity-50",
          width,
          className
        )}
        {...props}
      >
        <div className="flex items-center space-x-2">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-primary">
              {selectedOption.icon}
            </span>
          )}
          <SelectPrimitive.Value placeholder={placeholder}>
            <span className="truncate">{selectedOption?.label}</span>
          </SelectPrimitive.Value>
          {selectedOption?.count !== undefined && (
            <span className="ml-1 rounded-md border border-[hsl(var(--brass)/0.2)] bg-[hsl(var(--brass)/0.1)] px-1.5 py-0.5 text-xs font-medium text-[hsl(var(--brass))]">
              {selectedOption.count}
            </span>
          )}
        </div>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "relative z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          position="popper"
          sideOffset={8}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "enhanced-select-item relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-10 pr-3 text-sm outline-none transition-colors duration-150 hover:bg-[hsl(var(--muted)/0.6)] focus:bg-[hsl(var(--muted)/0.6)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  value === option.value && "bg-[hsl(var(--primary)/0.08)] text-foreground"
                )}
              >
                <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4 text-primary" />
                  </SelectPrimitive.ItemIndicator>
                </span>

                <div className="flex items-center space-x-2 flex-1">
                  {option.icon && (
                    <span className="flex-shrink-0 text-muted-foreground">
                      {option.icon}
                    </span>
                  )}
                  <div className="flex-1">
                    <SelectPrimitive.ItemText>
                      <span className="font-medium">{option.label}</span>
                    </SelectPrimitive.ItemText>
                    {option.description && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.count !== undefined && (
                    <span className="flex-shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {option.count}
                    </span>
                  )}
                </div>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
})

EnhancedSelect.displayName = "EnhancedSelect"

export { EnhancedSelect } 
