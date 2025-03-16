
export interface User {
  id: string;
  email: string;
  name?: string;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  start: Date;
  end: Date;
  notes?: string;
  color?: string;
}

export interface CalendarContextType {
  events: CalendarEvent[];
  view: CalendarView;
  date: Date;
  setView: (view: CalendarView) => void;
  setDate: (date: Date) => void;
  navigateToDate: (date: Date) => void;
  navigateToToday: () => void;
  navigateForward: () => void;
  navigateBackward: () => void;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Omit<CalendarEvent, 'id' | 'userId'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}
