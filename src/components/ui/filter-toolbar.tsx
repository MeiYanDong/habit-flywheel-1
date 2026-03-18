import React from 'react';
import { EnhancedSelect } from './enhanced-select';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  description?: string;
}

interface FilterToolbarProps {
  title: string;
  description?: string;
  filters: Array<{
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
    width?: string;
  }>;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
    className?: string;
  }>;
  className?: string;
}

const FilterToolbar: React.FC<FilterToolbarProps> = ({
  title,
  description,
  filters,
  actions = [],
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="editorial-display mb-2 text-2xl font-semibold">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* 筛选器 */}
          <div className="flex flex-col sm:flex-row gap-3">
            {filters.map((filter, index) => (
              <EnhancedSelect
                key={index}
                value={filter.value}
                onValueChange={filter.onChange}
                options={filter.options}
                width={filter.width || "w-48"}
                placeholder={filter.placeholder}
              />
            ))}
          </div>
          
          {/* 操作按钮 */}
          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                  className={cn(
                    "transition-all duration-200 hover:shadow-lg",
                    action.variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
                    action.className
                  )}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { FilterToolbar }; 
