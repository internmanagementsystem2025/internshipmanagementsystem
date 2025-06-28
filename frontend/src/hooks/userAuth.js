// useAzureAuth.js hook
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAzureAuth = () => {
  const [azureUser, setAzureUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('azureUser');
    if (userData) {
      setAzureUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('azureUser');
    setAzureUser(null);
    navigate('/login');
  };

  return { azureUser, logout };
};