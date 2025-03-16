
import { format } from "date-fns";
import { CalendarEvent } from "@/types";
import { cn } from "@/lib/utils";

interface EventItemProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  view: "day" | "week" | "month";
}

export function EventItem({ event, onClick, view }: EventItemProps) {
  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(event);
  };
  
  const getEventStyles = () => {
    let styles = {
      backgroundColor: event.color || '#6172AD',
    };
    
    return styles;
  };
  
  return (
    <div
      onClick={handleClick}
      className="calendar-event group"
      style={getEventStyles()}
    >
      <div className="text-xs font-medium">
        {view === "day" ? (
          <>
            <span>{event.title}</span>
            <div className="text-[10px] opacity-90">
              {formatTime(event.start)} - {formatTime(event.end)}
            </div>
          </>
        ) : (
          <>
            {view === "week" ? (
              <>
                <span>{formatTime(event.start)}</span>
                <span> - {event.title}</span>
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
