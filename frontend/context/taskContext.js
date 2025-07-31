'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDateLocal } from '@/utils/date';
import { useUserContext } from './userContext';

const TaskContext = createContext();

// const BASE_URL = 'https://your-backend-url.com/api'; // 🔁 Replace with your backend URL
const BASE_URL = "http://localhost:8000/api/v1";

export const TasksProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [todayJobs, setTodayJobs] = useState([]);
  const [machines, setMachines] = useState([]);
  const [machine, setMachine] = useState({});
  const [loading, setLoading] = useState(false);
  const userId = useUserContext().user._id;
  const [isEditing, setIsEditing] = useState(false);
  const [activeMachine, setActiveMachine] = useState(null);
  const [modalMode, setModalMode] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);

  // 👉 Open Add Task Modal
  const openModalForAddMachine = () => {
    setModalMode("add");
    setIsEditing(true);
    setMachine({});
  };

  // 👉 Open Edit Task Modal
  const openModalForEditMachine = (machine) => {
    setModalMode("edit");
    setIsEditing(true);
    setActiveMachine(machine);
    setMachine(machine);
  };

  // 👉 Open Delete Modal for a Task
  const openModalForDeleteMachine = (machine) => {
    setMachineToDelete(machine);
    setShowDeleteModal(true);
  };

  // 👉 Close All Modals
  const closeModal = () => {
    setIsEditing(false);
    setModalMode("");
    setActiveMachine(null);
    setMachine({});
    setShowDeleteModal(false);
    setMachineToDelete(null);
  };

  // 👉 Handle Form Input
  const handleInput = (name) => (e) => {
    if (name === "setTask") {
      setMachine(e);
    } else {
      let value = e.target.value;
      if (name === "completed") value = value === "true";
      setMachine({ ...task, [name]: value });
    }
  };

  // --- JOB FUNCTIONS ---

  const createJob = async (jobData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/jobs`, jobData, {
        withCredentials: true,
      });
      setJobs((prev) => [...prev, res.data]);
      toast.success('Job created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const getJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/jobs`, {
        withCredentials: true,
      });
      setJobs(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const getTodayJobs = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`${BASE_URL}/jobs/today`, {
      withCredentials: true,
    });
    setTodayJobs(res.data); // replace current jobs state with today's jobs
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to fetch today\'s jobs');
  } finally {
    setLoading(false);
  }
  };

  const getJobsByDate = async (date) => {
  try {
      setLoading(true);

      const localDateString = formatDateLocal(new Date(date)); // e.g., "2025-07-31"

      const res = await axios.get(`${BASE_URL}/jobs/by-date?date=${localDateString}`, {
        withCredentials: true,
      });

      setTodayJobs(res.data); // Or setDateFilteredJobs if you want a separate state
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch jobs for selected date');
    } finally {
      setLoading(false);
    }
  };


  const getJobById = async (id) => {
    try {
      const res = await axios.get(`${BASE_URL}/jobs/${id}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get job');
      return null;
    }
  };

  const updateJob = async (id, updatedData) => {
    try {
      setLoading(true);
      const res = await axios.put(`${BASE_URL}/tasks/machines/${id}`, updatedData, {
        withCredentials: true,
      });
      setJobs((prev) =>
        prev.map((job) => (job._id === id ? res.data : job))
      );
      getMachines();
      toast.success('Updated successfully');
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const deleteMachine = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${BASE_URL}/tasks/machines/${id}`, {
        withCredentials: true,
      });
      setJobs((prev) => prev.filter((job) => job._id !== id));
      getMachines();
      toast.success('Machine deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete machine');
    } finally {
      setLoading(false);
    }
  };

  // --- MACHINE FUNCTIONS ---

  const createMachine = async (machineData) => {
    //console.log("Sending to backend:", machineData); // ← ADD THIS
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/tasks/machines`, machineData, {
        withCredentials: true,
      });
      setMachines((prev) => [...prev, res.data]);
      toast.success('Machine created successfully');
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create machine');
    } finally {
      setLoading(false);
    }
  };

  const getMachines = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/tasks/machines`, {
        withCredentials: true,
      });
      setMachines(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch machines');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        jobs,
        todayJobs,
        machines,
        loading,
        isEditing,
        modalMode,
        activeMachine,
        machineToDelete,
        showDeleteModal,
        createJob,
        getJobs,
        getJobById,
        updateJob,
        deleteMachine,
        createMachine,
        getMachines,
        getTodayJobs,
        getJobsByDate,
        handleInput,
        openModalForAddMachine,
        openModalForEditMachine,
        openModalForDeleteMachine,
        closeModal
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
