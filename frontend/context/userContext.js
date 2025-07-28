'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const router = useRouter();

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  const axiosAuth = axios.create({
    baseURL: 'https://your-api-url.com/api',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // ---------- Register User ----------
  const registerUser = async (formData) => {
    try {
      const res = await axios.post(
        'https://your-api-url.com/api/users/register',
        formData
      );
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  // ---------- Login User ----------
  const loginUser = async (formData) => {
    try {
      const res = await axios.post(
        'https://your-api-url.com/api/users/login',
        formData
      );
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // ---------- Check User Login Status ----------
  const userLoginStatus = async () => {
    try {
      const res = await axiosAuth.get('/users/status');
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('User status check failed:', err);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // ---------- Logout User ----------
  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  // ---------- Get Current User Info ----------
  const getUser = async () => {
    try {
      const res = await axiosAuth.get('/users/me');
      return res.data;
    } catch (err) {
      console.error('Get user failed:', err);
    }
  };

  useEffect(() => {
    if (token) {
      userLoginStatus();
    } else {
      setAuthLoading(false);
    }
  }, [token]);

  return (
    <UserContext.Provider
      value={{
        user,
        authLoading,
        registerUser,
        loginUser,
        userLoginStatus,
        logoutUser,
        getUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};