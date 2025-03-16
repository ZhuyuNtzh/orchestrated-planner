
import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from "date-fns";
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

  const renderDayView = () => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    });
    
    return (
      <div className="calendar-body h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="grid grid-cols-1 gap-1">
          {hours.map(hour => {
            const hourDate = new Date(dayStart);
            hourDate.setHours(hour);
            
            const hourEvents = dayEvents.filter(event => {
              const eventHour = new Date(event.start).getHours();
              return eventHour === hour;
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
                <div className="ml-16 space-y-1">
                  {hourEvents.map(event => (
                    <EventItem
                      key={event.id}
                      event={event}
                      onClick={handleEventClick}
                      view="day"
                    />
                  ))}
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
            <div key={hour} className="grid grid-cols-7 border-t border-border">
              <div className="absolute left-0 top-0 w-16 text-xs font-medium text-muted-foreground p-1 translate-y-[calc(60px*hour)]">
                {format(new Date().setHours(hour), "h a")}
              </div>
              
              {weekDays.map((day, dayIndex) => {
                const currentDate = new Date(day);
                currentDate.setHours(hour);
                
                const dayEvents = events.filter(event => {
                  const eventDate = new Date(event.start);
                  return isSameDay(eventDate, day) && eventDate.getHours() === hour;
                });
                
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "min-h-[60px] p-1 pl-0",
                      dayIndex === 0 && "pl-16"
                    )}
                    onClick={() => handleDayClick(currentDate)}
                  >
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <EventItem
                          key={event.id}
                          event={event}
                          onClick={handleEventClick}
                          view="week"
                        />
                      ))}
                    </div>
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
        
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "calendar-day",
              !isSameMonth(day, monthStart) && "calendar-day-different-month",
              isSameDay(day, new Date()) && "calendar-day-today"
            )}
            onClick={() => handleDayClick(cloneDay)}
          >
            <div className="calendar-day-header">
              <span className="calendar-day-number">{formattedDate}</span>
              {isSameDay(day, new Date()) && (
                <span className="text-[9px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full">
                  Today
                </span>
              )}
            </div>
            <div className="overflow-y-auto max-h-[80px]">
              {dayEvents.slice(0, 3).map(event => (
                <EventItem
                  key={event.id}
                  event={event}
                  onClick={handleEventClick}
                  view="month"
                />
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs p-0.5 text-right text-muted-foreground">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="calendar-grid">
          {days}
        </div>
      );
      days = [];
    }
    
    return (
      <div className="calendar-body animate-fade-in">
        <div className="calendar-grid mb-2">
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
