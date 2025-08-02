'use client';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDateLocal } from '@/utils/date';
import { useUserContext } from './userContext';
import moment from 'moment';

const TaskContext = createContext();

// const BASE_URL = 'https://your-backend-url.com/api'; // 🔁 Replace with your backend URL
const BASE_URL = "http://localhost:8000/api/v1";

export const TasksProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [todayJobs, setTodayJobs] = useState([]);
  const [machines, setMachines] = useState([]);
  const [machine, setMachine] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeMachine, setActiveMachine] = useState(null);
  const [modalMode, setModalMode] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);
  const [jobList, setJobList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day').toDate());
  const [liveData, setLiveData] = useState(true);

  const { user } = useUserContext();
  const userId = user?._id;

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
  
  // Load jobs for selected date
  const loadJobsByDate = async (date) => {
    try {
      const res = await axios.get(`/api/v1/jobs?date=${date.toISOString()}`);
      setJobList(res.data);
    } catch (err) {
      console.error('Error loading jobs:', err);
    }
  };

  const processedMachines = useMemo(() => {
    return machines.map((machine) => {
      const matchingJobs = todayJobs.filter(
        (job) => job.machineId === machine._id
      );

      const productionCount = matchingJobs.reduce(
        (sum, job) => sum + (job.jobCount || 0),
        0
      );

      const rejectionCount = matchingJobs.reduce(
        (sum, job) => sum + (job.rejectionCount || 0),
        0
      );

      const latestJob = matchingJobs.reduce(
        (latest, current) =>
          !latest || new Date(current.createdAt) > new Date(latest.createdAt)
            ? current
            : latest,
        null
      );

      const latestRFID = latestJob?.rfid;
      const latestStatus = latestJob?.status ?? 'off';

      let liveToolName = 'N/A';
      if (latestRFID && Array.isArray(machine.jobList)) {
        for (const jobEntry of machine.jobList) {
          const [name, value] = Object.entries(jobEntry)[0];
          if (value === latestRFID) {
            liveToolName = name;
            break;
          }
        }
      }

      return {
        ...machine,
        productionCount,
        rejectionCount,
        liveToolName,
        latestStatus,
      };
    });
  }, [machines, todayJobs]);

  // Update liveData based on selectedDate
  useEffect(() => {
    const isToday = moment(selectedDate).isSame(moment(), 'day');
    setLiveData(isToday);
  }, [selectedDate]);

  // WebSocket: only listen when liveData is true
  useEffect(() => {
    if (!liveData) return;

    const socket = new WebSocket('ws://localhost:8000');

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'NEW_JOB') {
        const newJob = message.data;
        const jobDate = moment(newJob.createdAt).startOf('day');
        const today = moment().startOf('day');

        if (jobDate.isSame(today)) {
          setTodayJobs((prev) => [newJob, ...prev]);
        }
      }
    };

    return () => socket.close();
  }, [liveData]);

  // Refetch jobs on selected date change
  // 👇 Wait for userId before calling API
  useEffect(() => {
    if (!userId) return; // wait until user context is ready

    const dateStr = moment(selectedDate).format('YYYY-MM-DD');
    getJobsByDate(dateStr);
  }, [selectedDate, userId]);

  useEffect(() => {
    if (!userId) return;

    getMachines();
    // getTodayJobs();
  }, [userId]);

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
        selectedDate,        
        processedMachines,
        liveData,           
        createJob,
        setSelectedDate,     
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
        closeModal,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
