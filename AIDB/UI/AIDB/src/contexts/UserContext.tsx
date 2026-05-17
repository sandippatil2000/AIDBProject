import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User, AuthState } from '../types';
import { authService } from '../services/api';

interface UserContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Rehydrate user from localStorage on mount
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('auth_user');
    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { token, user } = await authService.login(email, password);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <UserContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
