'use client';

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const UserContext = React.createContext();

axios.defaults.withCredentials = true;

// const serverUrl = 'https://monitr-119w.onrender.com';
const serverUrl = "http://localhost:8000";

export const UserContextProvider = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [userState, setUserState] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Dynamic form handler
  const handleUserInput = (name) => (e) => {
    setUserState((prev) => ({ ...prev, [name]: e.target.value }));
  };

  // ---------- Register ----------
  const registerUser = async (e) => {
    e.preventDefault();
    const { name, email, password } = userState;

    if (!email.includes('@') || !password || password.length < 6) {
      toast.error('Enter valid email and password (min 6 characters)');
      return;
    }

    try {
      await axios.post(`${serverUrl}/api/v1/register`, { name, email, password });
      toast.success('Registration successful');
      setUserState({ name: '', email: '', password: '' });
      router.push('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

//   // ---------- Login ----------
//   const loginUser = async (email, password) => {
//   try {
//     await axios.post(`${serverUrl}/api/v1/login`, { email, password });
//     toast.success('Login successful');
//     setUserState({ email: '', password: '' });
//     await getUser();
//     router.push('/');
//   } catch (error) {
//     toast.error(error.response?.data?.message || 'Login failed');
//   }
// };

  // login the user
  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/login`,
        {
          email: userState.email,
          password: userState.password,
        },
        {
          withCredentials: true, // send cookies to the server
        }
      );

      toast.success("User logged in successfully");

      // clear the form
      setUserState({
        email: "",
        password: "",
      });

      // refresh the user details
      await getUser(); // fetch before redirecting

      // push user to the dashboard page
      router.push("/");
    } catch (error) {
      console.log("Error logging in user", error);
      // toast.error(error.response.data.message);
    }
  };


  // ---------- Logout ----------
  const logoutUser = async () => {
    try {
      await axios.get(`${serverUrl}/api/v1/logout`, {
        withCredentials: true, // send cookies to the server
      });
      toast.success('Logged out');
      setUser({});
      router.push('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  };

  // get user details
  const getUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/v1/user`, {
        withCredentials: true, // send cookies to the server
      });

      setUser((prevState) => {
        return {
          ...prevState,
          ...res.data,
        };
      });

      setLoading(false);
    } catch (error) {
      console.log("Error getting user details", error);
      setLoading(false);
      // toast.error(error.response.data.message);
    }
  };

  // // ---------- Check Login Status ----------
  // const userLoginStatus = async () => {
  //   try {
  //     const res = await axios.get(`${serverUrl}/api/v1/login-status`);
  //     return !!res.data;
  //   } catch (error) {
  //     console.error('Login status error:', error);
  //     return false;
  //   }
  // };

  // get user Looged in Status
  const userLoginStatus = async () => {
    let loggedIn = false;
    try {
      const res = await axios.get(`${serverUrl}/api/v1/login-status`, {
        withCredentials: true, // send cookies to the server
      });

      // coerce the string to boolean
      loggedIn = !!res.data;
      setLoading(false);

      if (!loggedIn) {
        router.push("/login");
      }
    } catch (error) {
      console.log("Error getting user login status", error);
    }

    return loggedIn;
  };

  // ---------- Update User ----------
  const updateUser = async (e, data) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.patch(`${serverUrl}/api/v1/user`, data);
      setUser((prev) => ({ ...prev, ...res.data }));
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Send Email Verification ----------
  const emailVerification = async () => {
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/verify-email`);
      toast.success('Verification email sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Verify User Token ----------
  const verifyUser = async (token) => {
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/verify-user/${token}`);
      toast.success('Email verified');
      await getUser();
      router.push('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Forgot Password Email ----------
  const forgotPasswordEmail = async (email) => {
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/forgot-password`, { email });
      toast.success('Reset link sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Reset Password ----------
  const resetPassword = async (token, password) => {
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/reset-password/${token}`, { password });
      toast.success('Password reset');
      router.push('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Change Password ----------
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      await axios.patch(`${serverUrl}/api/v1/change-password`, { currentPassword, newPassword });
      toast.success('Password changed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Change failed');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Admin: Get All Users ----------
  const getAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/v1/admin/users`);
      setAllUsers(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Admin: Delete User ----------
  const deleteUser = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${serverUrl}/api/v1/admin/users/${id}`);
      toast.success('User deleted');
      getAllUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  // // ---------- Initial Mount ----------
  // useEffect(() => {
  //   const init = async () => {
  //     const loggedIn = await userLoginStatus();
  //     if (loggedIn) await getUser();
  //   };
  //   init();
  // }, []);

  useEffect(() => {
    const loginStatusGetUser = async () => {
      const isLoggedIn = await userLoginStatus();

      if (isLoggedIn) {
        await getUser();
      }
    };

    loginStatusGetUser();
  }, []);

  // useEffect(() => {
  //   if (user?.role === 'admin') getAllUsers();
  // }, [user?.role]);

  return (
    <UserContext.Provider
      value={{
        registerUser,
        userState,
        handleUserInput,
        loginUser,
        logoutUser,
        userLoginStatus,
        user,
        updateUser,
        emailVerification,
        verifyUser,
        forgotPasswordEmail,
        resetPassword,
        changePassword,
        allUsers,
        deleteUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};