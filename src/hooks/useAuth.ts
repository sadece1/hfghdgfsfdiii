import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'

export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  phone?: string
  avatar_url?: string
  role: 'user' | 'admin'
}

export interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  userProfile: any | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: false,
    userProfile: null,
  })

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiService.setToken(token);
      // You could decode the token to get user info or make a request to verify it
      setAuthState(prev => ({ ...prev, loading: false }));
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const response = await apiService.register({
        username: userData.username || email.split('@')[0],
        email,
        password,
        full_name: userData.full_name,
        phone: userData.phone,
      });
      
      setAuthState({
        user: response.user,
        session: { user: response.user },
        loading: false,
        userProfile: response.user,
      });
      
      return response;
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const response = await apiService.login(email, password);
      
      setAuthState({
        user: response.user,
        session: { user: response.user },
        loading: false,
        userProfile: response.user,
      });
      
      return response;
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }

  const signOut = async () => {
    try {
      apiService.logout();
      setAuthState({
        user: null,
        session: null,
        loading: false,
        userProfile: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  const updateProfile = async (userData: any) => {
    if (!authState.user) throw new Error('No user logged in');
    
    try {
      // This would need to be implemented in the backend
      console.log('Update profile called with:', userData);
      return userData;
    } catch (error) {
      throw error;
    }
  }

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
}

