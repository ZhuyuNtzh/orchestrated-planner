
import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarView } from "@/types";

interface ViewToggleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  views: { value: CalendarView; label: string }[];
  value: CalendarView;
  onChange: (view: CalendarView) => void;
}

export function ViewToggle({ 
  views, 
  value, 
  onChange, 
  className, 
  ...props 
}: ViewToggleProps) {
  return (
    <div
      className={cn(
        "flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {views.map((view) => (
        <button
          key={view.value}
          onClick={() => onChange(view.value)}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            value === view.value 
              ? "bg-background text-foreground shadow-sm" 
              : "hover:bg-background/50 hover:text-foreground/90"
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
