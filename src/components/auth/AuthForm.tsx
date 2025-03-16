import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type AuthMode = "signIn" | "signUp";

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "name") {
      setName(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast("Error: Please fill in all required fields.");
      return;
    }
    
    if (mode === "signUp" && password.length < 6) {
      toast("Error: Password must be at least 6 characters long.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (mode === "signIn") {
        await signIn(email, password);
      } else {
        await signUp(email, password, name || undefined);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prevMode => (prevMode === "signIn" ? "signUp" : "signIn"));
  };

  return (
    <Card className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-xl border border-white/20 animate-scale-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {mode === "signIn" ? "Sign In" : "Create an Account"}
        </CardTitle>
        <CardDescription>
          {mode === "signIn"
            ? "Enter your credentials to access your calendar"
            : "Fill in the information below to create an account"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {mode === "signUp" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={name}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>{mode === "signIn" ? "Signing In..." : "Creating Account..."}</span>
              </div>
            ) : (
              <span>{mode === "signIn" ? "Sign In" : "Create Account"}</span>
            )}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            {mode === "signIn" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:underline focus:outline-none"
            >
              {mode === "signIn" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
