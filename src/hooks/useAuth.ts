import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/planner';
import { 
  getCurrentUser, 
  isAuthenticated, 
  login as authLogin, 
  logout as authLogout,
  loginAsPlanner,
  loginAsVendor,
  getUserRole
} from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = useCallback(async (
    email: string, 
    password: string, 
    role: 'planner' | 'vendor' = 'planner',
    name?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await authLogin(email, password, role, name);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError('Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const demoLoginPlanner = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await loginAsPlanner();
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError('Demo login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const demoLoginVendor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await loginAsVendor();
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError('Demo login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    role: getUserRole(),
    login,
    logout,
    demoLoginPlanner,
    demoLoginVendor,
  };
}
