
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarContextType, CalendarView, CalendarEvent } from '@/types';
import { useAuth } from './AuthContext';
import { addDays, addMonths, addWeeks, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { toast } from "@/components/ui/sonner";

// Initialize empty calendar context
const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<CalendarView>('month');
  const [date, setDate] = useState<Date>(new Date());

  // Storage key includes user ID to isolate user data
  const getEventsStorageKey = () => `calendar_events_${user?.id || 'guest'}`;

  // Load events from storage on mount and when user changes
  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }
    
    const storedEvents = localStorage.getItem(getEventsStorageKey());
    
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents) as CalendarEvent[];
        // Convert string dates back to Date objects
        const eventsWithDates = parsedEvents.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        setEvents(eventsWithDates);
      } catch (error) {
        console.error('Error parsing stored events:', error);
        setEvents([]);
      }
    }
  }, [user]);

  // Save events to storage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(getEventsStorageKey(), JSON.stringify(events));
    }
  }, [events, user]);

  // Calendar navigation methods
  const navigateToDate = (newDate: Date) => {
    setDate(newDate);
  };

  const navigateToToday = () => {
    setDate(new Date());
  };

  const navigateForward = () => {
    if (view === 'day') {
      setDate(addDays(date, 1));
    } else if (view === 'week') {
      setDate(addWeeks(date, 1));
    } else {
      setDate(addMonths(date, 1));
    }
  };

  const navigateBackward = () => {
    if (view === 'day') {
      setDate(addDays(date, -1));
    } else if (view === 'week') {
      setDate(addWeeks(date, -1));
    } else {
      setDate(addMonths(date, -1));
    }
  };

  // Event management methods
  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'userId'>): Promise<void> => {
    if (!user) {
      toast('Error', {
        description: 'You must be logged in to add events',
        variant: 'destructive',
      });
      return;
    }
    
    const newEvent: CalendarEvent = {
      ...eventData,
      id: crypto.randomUUID(),
      userId: user.id,
    };
    
    setEvents(prev => [...prev, newEvent]);
    
    toast('Event Added', {
      description: 'Your event has been added to the calendar.',
    });
  };

  const updateEvent = async (id: string, eventData: Partial<Omit<CalendarEvent, 'id' | 'userId'>>): Promise<void> => {
    setEvents(prev => prev.map(event => {
      if (event.id === id) {
        return { ...event, ...eventData };
      }
      return event;
    }));
    
    toast('Event Updated', {
      description: 'Your event has been updated.',
    });
  };

  const deleteEvent = async (id: string): Promise<void> => {
    setEvents(prev => prev.filter(event => event.id !== id));
    
    toast('Event Deleted', {
      description: 'Your event has been removed from the calendar.',
    });
  };

  const value: CalendarContextType = {
    events,
    view,
    date,
    setView,
    setDate,
    navigateToDate,
    navigateToToday,
    navigateForward,
    navigateBackward,
    addEvent,
    updateEvent,
    deleteEvent
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
