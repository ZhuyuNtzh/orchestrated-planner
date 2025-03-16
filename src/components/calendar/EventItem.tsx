
import { format } from "date-fns";
import { CalendarEvent } from "@/types";
import { cn } from "@/lib/utils";

interface EventItemProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  view: "day" | "week" | "month";
  style?: React.CSSProperties;
}

export function EventItem({ event, onClick, view, style }: EventItemProps) {
  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(event);
  };
  
  const getEventStyles = () => {
    const styles: React.CSSProperties = {
      backgroundColor: event.color || '#6172AD',
      ...style
    };
    
    return styles;
  };
  
  return (
    <div
      onClick={handleClick}
      className={cn(
        "calendar-event group text-white rounded-sm p-1 overflow-hidden text-ellipsis",
        view === "month" ? "text-xs" : "",
        (view === "day" || view === "week") && "absolute left-0 right-0" // Ensure full width in day/week views
      )}
      style={getEventStyles()}
    >
      <div className="text-xs font-medium truncate">
        {view === "day" ? (
          <>
            <span className="font-semibold">{event.title}</span>
            <div className="text-[10px] opacity-90 truncate">
              {formatTime(event.start)} - {formatTime(event.end)}
            </div>
          </>
        ) : (
          <>
            {view === "week" ? (
              <>
                <span className="font-semibold">{event.title}</span>
                <div className="text-[10px] opacity-90 truncate">
                  {formatTime(event.start)} - {formatTime(event.end)}
                </div>
              </>
            ) : (
              <span>{event.title}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
