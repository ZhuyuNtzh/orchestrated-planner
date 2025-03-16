
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, AuthStatus } from '@/types';
import { toast } from "sonner";

// Mock data store for users
const USERS_STORAGE_KEY = 'calendar_users';
const CURRENT_USER_KEY = 'calendar_current_user';

// Initialize authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Load current user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setStatus('unauthenticated');
      }
    };

    loadUser();
  }, []);

  // Helper to get existing users from localStorage
  const getUsers = (): User[] => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  };

  // Helper to save users to localStorage
  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const users = getUsers();
    
    // Find user by email
    const user = users.find(user => user.email === email);
    
    if (!user) {
      toast("Error: User not found. Please check your email or register.");
      return;
    }
    
    // In a real app, we would validate the password with a proper encryption
    // Here we just check if a user with this email exists
    
    // Set user as logged in
    setUser(user);
    setStatus('authenticated');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    toast(`Welcome back${user.name ? ', ' + user.name : ''}!`);
  };

  // Sign up function
  const signUp = async (email: string, password: string, name?: string) => {
    const users = getUsers();
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      toast("Error: User with this email already exists.");
      return;
    }
    
    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
    };
    
    // Save new user
    saveUsers([...users, newUser]);
    
    // Set user as logged in
    setUser(newUser);
    setStatus('authenticated');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    toast(`Welcome, ${name || email}!`);
  };

  // Sign out function
  const signOut = async () => {
    setUser(null);
    setStatus('unauthenticated');
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const value: AuthContextType = {
    user,
    status,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
