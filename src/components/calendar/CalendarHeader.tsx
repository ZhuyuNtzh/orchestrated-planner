
import { Button } from "@/components/ui/button";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { useCalendar } from "@/context/CalendarContext";
import { CalendarView } from "@/types";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";

export function CalendarHeader() {
  const { 
    view, 
    date, 
    setView, 
    navigateToToday, 
    navigateForward, 
    navigateBackward 
  } = useCalendar();
  
  const viewOptions = [
    { value: "day" as CalendarView, label: "Day" },
    { value: "week" as CalendarView, label: "Week" },
    { value: "month" as CalendarView, label: "Month" },
  ];
  
  const formatTitle = () => {
    switch (view) {
      case "day":
        return format(date, "MMMM d, yyyy");
      case "week":
        return `${format(date, "MMMM d")} - ${format(
          new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000), 
          "MMMM d, yyyy"
        )}`;
      case "month":
      default:
        return format(date, "MMMM yyyy");
    }
  };
  
  return (
    <div className="calendar-header animate-fade-in">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToToday}
          className="hidden sm:flex"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Today
        </Button>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={navigateBackward}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={navigateForward}
            className="h-9 w-9"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <h2 className="text-lg font-semibold">{formatTitle()}</h2>
      </div>
      
      <ViewToggle
        views={viewOptions}
        value={view}
        onChange={setView}
      />
    </div>
  );
}
