import { createContext, useContext, useState, useEffect,type ReactNode } from 'react';
import { type User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // Persist token in localStorage so sessions survive page refresh
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);
  
  // On mount, validate the saved token and restore the user session
  useEffect(() => {
    // Token is invalid/expired — clear it so user is forced to re-login
    const initAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          // Store token and update state together so they stay in sync
        } catch {
          // Clear all auth state — triggers redirect via protected route logic
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => setUser(updatedUser);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
