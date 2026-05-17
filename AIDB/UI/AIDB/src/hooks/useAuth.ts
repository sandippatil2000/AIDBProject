import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useUser();
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
      navigate('/dashboard');
    },
    [login, navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  };
};
