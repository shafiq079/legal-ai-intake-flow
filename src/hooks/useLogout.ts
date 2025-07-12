
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const logoutUser = async () => {
  const { data } = await axios.post('/api/auth/logout');
  return data;
};

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({ 
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear user session/token from client-side storage
      localStorage.removeItem('token'); // Or your preferred storage method
      
      // Redirect to login page
      navigate('/login');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Logout failed. Please try again.';
      toast.error(errorMessage);
    },
  });
};
