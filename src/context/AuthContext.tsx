
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, AuthStatus } from '@/types';
import { toast } from "@/components/ui/sonner";

// Mock data store for users
const USERS_STORAGE_KEY = 'calendar_users';
const CURRENT_USER_KEY = 'calendar_current_user';

interface StoredUser extends User {
  password: string;
}

// Initialize empty auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Initialize on mount
  useEffect(() => {
    // Check local storage for logged in user
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        setStatus('authenticated');
      } catch (error) {
        console.error('Error parsing stored user:', error);
        setStatus('unauthenticated');
      }
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  // Get users from storage
  const getUsers = (): StoredUser[] => {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  };

  // Save users to storage
  const saveUsers = (users: StoredUser[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  // Authentication methods
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password before storing in state
      const { password: _, ...userWithoutPassword } = user;
      
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      setStatus('authenticated');
      
      toast('Success', {
        description: 'You have successfully signed in.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast('Error', {
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string): Promise<void> => {
    try {
      const users = getUsers();
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        email,
        password,
        name,
      };
      
      // Save new user
      saveUsers([...users, newUser]);
      
      // Remove password before storing in state
      const { password: _, ...userWithoutPassword } = newUser;
      
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      setStatus('authenticated');
      
      toast('Success', {
        description: 'Your account has been created.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast('Error', {
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    setStatus('unauthenticated');
    toast('Signed out', {
      description: 'You have been signed out successfully.',
    });
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
