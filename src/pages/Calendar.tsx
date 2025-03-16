import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { useAuth } from "@/context/AuthContext";
import { CalendarProvider } from "@/context/CalendarContext";
import { UserCircle, PlusCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Calendar() {
  const { user, status, signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/");
    }
  }, [status, navigate]);
  
  const handleNewEvent = () => {
    // Create event at current time
    const eventElement = document.querySelector(".calendar-day-today, .calendar-day") as HTMLElement;
    if (eventElement) {
      eventElement.click();
    } else {
      toast("Create Event", {
        description: "Please select a date on the calendar to create an event.",
      });
    }
  };
  
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-background to-secondary/20">
      <CalendarProvider>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Schedule Manager</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNewEvent}
                className="hidden sm:flex"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Event
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="hidden md:block text-sm text-right">
                  <p className="font-medium">{user?.name || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{user?.name ? user.email : ""}</p>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Log out</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container py-6">
          <CalendarHeader />
          <div className="mt-4">
            <CalendarGrid />
          </div>
        </main>
        
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 sm:hidden">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={handleNewEvent}
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </div>
      </CalendarProvider>
    </div>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}
