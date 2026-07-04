import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('access_token'));
  const [role, setRole] = useState<string | null>(sessionStorage.getItem('user_role'));
  const navigate = useNavigate();

  const login = (newToken: string, newRole: string) => {
    setToken(newToken);
    setRole(newRole);
    sessionStorage.setItem('access_token', newToken);
    sessionStorage.setItem('user_role', newRole);
    
    // Redirect based on role
    if (newRole === 'DOCTOR') navigate('/doctor');
    else if (newRole === 'RECEPTIONIST') navigate('/receptionist');
    else if (newRole === 'ADMIN') navigate('/admin');
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_role');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
