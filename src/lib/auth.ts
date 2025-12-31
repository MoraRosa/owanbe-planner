// Owambe Planner - Simulated Authentication
// This is a fake auth system for demo purposes - NOT for production use

import type { User } from '@/types/planner';
import { createUser, getUserByEmail, getUser, initDB } from './indexedDb';

const AUTH_KEY = 'owambe_auth';

interface AuthState {
  userId: string | null;
  role: 'planner' | 'vendor' | null;
}

// Get current auth state from localStorage
export const getAuthState = (): AuthState => {
  const data = localStorage.getItem(AUTH_KEY);
  if (!data) return { userId: null, role: null };
  try {
    return JSON.parse(data);
  } catch {
    return { userId: null, role: null };
  }
};

// Set auth state
const setAuthState = (state: AuthState): void => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  const state = getAuthState();
  return !!state.userId;
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  await initDB();
  const state = getAuthState();
  if (!state.userId) return null;
  const user = await getUser(state.userId);
  return user || null;
};

// Simulated login - creates user if doesn't exist
export const login = async (
  email: string, 
  _password: string, // password is ignored in demo mode
  role: 'planner' | 'vendor' = 'planner',
  name?: string
): Promise<User> => {
  await initDB();
  
  // Check if user exists
  let user = await getUserByEmail(email);
  
  if (!user) {
    // Create new user
    user = await createUser({
      email,
      name: name || email.split('@')[0],
      role,
    });
  }
  
  // Set auth state
  setAuthState({ userId: user.id, role: user.role });
  
  return user;
};

// Demo login shortcuts
export const loginAsPlanner = async (): Promise<User> => {
  return login('demo@planner.com', 'demo123', 'planner', 'Demo Planner');
};

export const loginAsVendor = async (): Promise<User> => {
  return login('demo@vendor.com', 'demo123', 'vendor', 'Demo Vendor');
};

// Logout
export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

// Get user role
export const getUserRole = (): 'planner' | 'vendor' | null => {
  return getAuthState().role;
};
