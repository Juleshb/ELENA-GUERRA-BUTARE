import { createContext, useContext, useEffect, useState } from 'react';
import portalApi from '../api/portalClient';

const PortalAuthContext = createContext(null);

export function PortalAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('portalToken');
    if (!token) {
      setLoading(false);
      return;
    }
    portalApi
      .get('/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('portalToken'))
      .finally(() => setLoading(false));
  }, []);

  const verifyOtp = async ({ email, code, name, phone, messageId, purpose = 'REGISTER' }) => {
    const { data } = await portalApi.post('/otp/verify', {
      email,
      code,
      name,
      phone,
      messageId,
      purpose,
    });
    localStorage.setItem('portalToken', data.token);
    setUser(data.user);
    return data.user;
  };

  const sendOtp = async (email, purpose = 'LOGIN', name) => {
    const { data } = await portalApi.post('/otp/send', { email, purpose, name });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('portalToken');
    setUser(null);
  };

  return (
    <PortalAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        verifyOtp,
        sendOtp,
        logout,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  return useContext(PortalAuthContext);
}
