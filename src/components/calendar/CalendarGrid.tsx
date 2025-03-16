
import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, addMinutes, isWithinInterval, areIntervalsOverlapping } from "date-fns";
import { useCalendar } from "@/context/CalendarContext";
import { EventItem } from "./EventItem";
import { EventForm } from "./EventForm";
import { CalendarEvent } from "@/types";
import { cn } from "@/lib/utils";

export function CalendarGrid() {
  const { view, date, events } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEventDate, setNewEventDate] = useState<Date | undefined>(undefined);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleDayClick = (date: Date) => {
    setNewEventDate(date);
    setSelectedEvent(undefined);
    setShowEventForm(true);
  };

  const handleCloseEventForm = () => {
    setShowEventForm(false);
    setSelectedEvent(undefined);
    setNewEventDate(undefined);
  };

  // Sort events by start time and then by duration (shortest first)
  const sortEvents = (events: CalendarEvent[]) => {
    return [...events].sort((a, b) => {
      // First sort by start time
      const startDiff = a.start.getTime() - b.start.getTime();
      if (startDiff !== 0) return startDiff;
      
      // If start times are the same, sort by duration (shortest first)
      const aDuration = a.end.getTime() - a.start.getTime();
      const bDuration = b.end.getTime() - b.start.getTime();
      return aDuration - bDuration;
    });
  };

  // Calculate event position and width in a time slot
  const calculateEventLayout = (events: CalendarEvent[]) => {
    if (events.length === 0) return [];
    
    // Sort events by start time and duration
    const sortedEvents = sortEvents(events);
    
    // Track concurrent events
    const eventLayout: { event: CalendarEvent; column: number; totalColumns: number }[] = [];
    const columns: { end: Date }[] = [];
    
    for (const event of sortedEvents) {
      // Find an available column
      let columnIndex = 0;
      for (let i = 0; i < columns.length; i++) {
        if (event.start >= columns[i].end) {
          columnIndex = i;
          columns[i] = { end: event.end };
          break;
        }
      }
      
      // If no column is available, add a new one
      if (columnIndex === columns.length) {
        columns.push({ end: event.end });
      }
      
      // Calculate overlapping events to determine totalColumns
      const overlappingEvents = sortedEvents.filter(otherEvent => 
        event !== otherEvent && areIntervalsOverlapping(
          { start: event.start, end: event.end },
          { start: otherEvent.start, end: otherEvent.end }
        )
      );
      
      // The total columns is the maximum column index of overlapping events + 1
      const maxOverlappingColumns = overlappingEvents.length > 0 
        ? Math.max(columnIndex, ...overlappingEvents.map(e => {
          const layout = eventLayout.find(l => l.event === e);
          return layout ? layout.column : 0;
        })) + 1
        : columnIndex + 1;
      
      eventLayout.push({
        event,
        column: columnIndex,
        totalColumns: Math.max(maxOverlappingColumns, columns.length)
      });
    }
    
    return eventLayout;
  };

  const renderDayView = () => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    });
    
    const eventLayout = calculateEventLayout(dayEvents);
    
    return (
      <div className="calendar-body h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="grid grid-cols-1 gap-1">
          {hours.map(hour => {
            const hourDate = new Date(dayStart);
            hourDate.setHours(hour);
            const nextHourDate = new Date(hourDate);
            nextHourDate.setHours(hour + 1);
            
            // Get events that overlap with this hour
            const hourEvents = eventLayout.filter(({ event }) => {
              return isWithinInterval(hourDate, { start: event.start, end: event.end }) || 
                     isWithinInterval(nextHourDate, { start: event.start, end: event.end }) ||
                     (event.start <= hourDate && event.end >= nextHourDate);
            });
            
            return (
              <div
                key={hour}
                className="relative min-h-[60px] border-t border-border p-1"
                onClick={() => {
                  const clickDate = new Date(date);
                  clickDate.setHours(hour);
                  handleDayClick(clickDate);
                }}
              >
                <div className="absolute left-0 top-0 w-16 text-xs font-medium text-muted-foreground p-1">
                  {format(hourDate, "h a")}
                </div>
                <div className="ml-16 space-y-1 relative">
                  {hourEvents.map(({ event, column, totalColumns }) => {
                    // Calculate event height based on duration
                    const startMinute = event.start.getHours() * 60 + event.start.getMinutes();
                    const endMinute = event.end.getHours() * 60 + event.end.getMinutes();
                    const hourMinute = hour * 60;
                    const nextHourMinute = (hour + 1) * 60;
                    
                    // Calculate top position (relative to this hour)
                    const top = Math.max(0, startMinute - hourMinute);
                    
                    // Calculate height (capped to this hour slot)
                    const height = Math.min(60, endMinute - startMinute);
                    
                    // Only render if the event starts in this hour or continues from previous hour
                    if (startMinute < nextHourMinute && endMinute > hourMinute) {
                      return (
                        <div 
                          key={event.id} 
                          className="absolute"
                          style={{
                            top: `${(top / 60) * 100}%`,
                            height: `${(height / 60) * 100}%`,
                            left: `${(column / totalColumns) * 100}%`,
                            width: `${(1 / totalColumns) * 100}%`,
                          }}
                        >
                          <EventItem
                            event={event}
                            onClick={handleEventClick}
                            view="day"
                            style={{
                              height: '100%',
                              margin: '0 1px',
                            }}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(date);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    const dayNames = weekDays.map(day => format(day, "EEE"));
    const dayNumbers = weekDays.map(day => format(day, "d"));
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Get all events for the week
    const weekEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return weekDays.some(day => isSameDay(eventDate, day));
    });
    
    // Group events by day
    const eventsByDay = weekDays.map(day => {
      const dayEvents = weekEvents.filter(event => isSameDay(new Date(event.start), day));
      return calculateEventLayout(dayEvents);
    });
    
    return (
      <div className="calendar-body h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day, index) => (
            <div key={index} className="p-2 text-center">
              <div className="text-sm font-medium">{dayNames[index]}</div>
              <div
                className={cn(
                  "h-7 w-7 rounded-full mx-auto flex items-center justify-center text-sm",
                  isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
                )}
              >
                {dayNumbers[index]}
              </div>
            </div>
          ))}
        </div>
        
        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-7 border-t border-border relative">
              <div className="absolute left-0 top-0 w-16 text-xs font-medium text-muted-foreground p-1">
                {format(new Date().setHours(hour), "h a")}
              </div>
              
              {weekDays.map((day, dayIndex) => {
                const hourDate = new Date(day);
                hourDate.setHours(hour);
                const nextHourDate = new Date(hourDate);
                nextHourDate.setHours(hour + 1);
                
                // Get events that overlap with this hour for this day
                const hourEvents = eventsByDay[dayIndex].filter(({ event }) => {
                  return isWithinInterval(hourDate, { start: event.start, end: event.end }) || 
                         isWithinInterval(nextHourDate, { start: event.start, end: event.end }) ||
                         (event.start <= hourDate && event.end >= nextHourDate);
                });
                
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "min-h-[60px] p-1 relative",
                      dayIndex === 0 && "pl-16"
                    )}
                    onClick={() => {
                      const clickDate = new Date(day);
                      clickDate.setHours(hour);
                      handleDayClick(clickDate);
                    }}
                  >
                    {hourEvents.map(({ event, column, totalColumns }) => {
                      // Calculate event height based on duration
                      const startMinute = event.start.getHours() * 60 + event.start.getMinutes();
                      const endMinute = event.end.getHours() * 60 + event.end.getMinutes();
                      const hourMinute = hour * 60;
                      const nextHourMinute = (hour + 1) * 60;
                      
                      // Calculate top position (relative to this hour)
                      const top = Math.max(0, startMinute - hourMinute);
                      
                      // Calculate height (capped to this hour slot)
                      const height = Math.min(60, endMinute - hourMinute);
                      
                      // Only render if the event starts in this hour or continues from previous hour
                      if (startMinute < nextHourMinute && endMinute > hourMinute) {
                        return (
                          <div 
                            key={event.id} 
                            className="absolute"
                            style={{
                              top: `${(top / 60) * 100}%`,
                              height: `${(height / 60) * 100}%`,
                              left: `${(column / totalColumns) * 100}%`,
                              width: `${(1 / totalColumns) * 100}%`,
                            }}
                          >
                            <EventItem
                              event={event}
                              onClick={handleEventClick}
                              view="week"
                              style={{
                                height: '100%',
                                margin: '0 1px',
                              }}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const dateFormat = "d";
    const rows = [];
    
    let days = [];
    let day = startDate;
    let formattedDate = "";
    
    // Day names row
    const dayNames = Array.from({ length: 7 }, (_, i) => format(addDays(startOfWeek(new Date()), i), "EEE"));
    
    // Calendar grid
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = new Date(day);
        
        // Get events for this day
        const dayEvents = events.filter(event => isSameDay(new Date(event.start), cloneDay));
        const sortedEvents = sortEvents(dayEvents);
        const eventLayout = calculateEventLayout(sortedEvents);
        
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "calendar-day h-36 border border-border rounded-md p-1 overflow-hidden",
              !isSameMonth(day, monthStart) && "opacity-40",
              isSameDay(day, new Date()) && "bg-accent/20"
            )}
            onClick={() => handleDayClick(cloneDay)}
          >
            <div className="calendar-day-header flex justify-between items-center mb-1">
              <span className={cn(
                "calendar-day-number text-sm font-medium h-6 w-6 flex items-center justify-center",
                isSameDay(day, new Date()) && "bg-primary text-primary-foreground rounded-full"
              )}>
                {formattedDate}
              </span>
              {isSameDay(day, new Date()) && (
                <span className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full">
                  Today
                </span>
              )}
            </div>
            <div className="overflow-y-auto max-h-[100px] space-y-1">
              {eventLayout.map(({ event, column, totalColumns }) => (
                <EventItem
                  key={event.id}
                  event={event}
                  onClick={handleEventClick}
                  view="month"
                  style={{
                    width: `${100 / totalColumns}%`,
                    marginLeft: `${(column / totalColumns) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    
    return (
      <div className="calendar-body animate-fade-in">
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((dayName, i) => (
            <div key={i} className="text-center py-2 text-sm font-medium text-muted-foreground">
              {dayName}
            </div>
          ))}
        </div>
        <div className="space-y-1">{rows}</div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      {view === "day" && renderDayView()}
      {view === "week" && renderWeekView()}
      {view === "month" && renderMonthView()}
      
      <EventForm
        isOpen={showEventForm}
        onClose={handleCloseEventForm}
        event={selectedEvent}
        defaultDate={newEventDate}
      />
    </div>
  );
}
