
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { status } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (status === "authenticated") {
      navigate("/calendar");
    }
  }, [status, navigate]);
  
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-accent/10 p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="text-center animate-fade-in">
          <div className="mb-4 flex justify-center">
            <CalendarIcon className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Schedule Manager</h1>
          <p className="text-muted-foreground">
            A beautiful, minimalist calendar for managing your schedule
          </p>
        </div>
        
        <AuthForm />
        
        <div className="text-sm text-center text-muted-foreground mt-8 animate-fade-in">
          <p>
            A simple, elegant way to manage your time.
            <br />
            Sign in or create an account to get started.
          </p>
        </div>
      </div>
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
