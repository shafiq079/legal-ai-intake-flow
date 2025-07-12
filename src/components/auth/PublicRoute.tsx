import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PublicRouteProps {
  children: JSX.Element;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (user) {
    // User is authenticated, redirect to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated, render the public page (Login, Signup)
  return children;
};
