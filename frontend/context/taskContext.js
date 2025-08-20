'use client';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDateLocal } from '@/utils/date';
import { useUserContext } from './userContext';
import moment from 'moment';
import { useParams } from 'next/navigation';

const TaskContext = createContext();

// const BASE_URL = 'https://your-backend-url.com/api'; // 🔁 Replace with your backend URL
// const BASE_URL = "http://localhost:8000/api/v1";
const BASE_URL = "https://thingscode-dashboard.onrender.com/api/v1";

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

  // ===== New machine page states =====
  const [historicData, setHistoricData] = useState(false);
  // const [machine, setMachine] = useState<Machine | null>(null);
  const [monthlyJobs, setMonthlyJobs] = useState([]);
  const [historicViewDate, setHistoricViewDate] = useState(null);
  const [selectedJob, setSelectedJob] = useState('');
  const [isDailyDrilldown, setIsDailyDrilldown] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedHistoricMonth, setSelectedHistoricMonth] = useState(new Date());
  const { id } = useParams(); // dynamic route param

  const { user } = useUserContext();
  const userId = user?._id;

  // ====== Chart + derived data ======
  const historicHourlyData = useMemo(() => {
    const data = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      production: 0,
      rejection: 0,
    }));

    if (!machine || !historicData || !isDailyDrilldown) return data;

    for (const job of monthlyJobs) {
      if (job.machineId === machine._id) {
        const jobDate = moment(job.createdAt);
        if (
          jobDate.isSame(selectedDate, 'day')  // only for selected day
        ) {
          const h = jobDate.hour();
          data[h].production += job.jobCount || 0;
          data[h].rejection += job.rejectionCount || 0;
        }
      }
    }
    return data;
  }, [machine, monthlyJobs, historicData, isDailyDrilldown, selectedDate]);

  // ✅ Pie chart data for rejection: jobName vs total rejection count
  const rejectionPieData = useMemo(() => {
    if (!machine || !Array.isArray(machine.jobList)) return [];

    const jobRejectionCounts = {};

    let sourceJobs = [];

    if (isDailyDrilldown && historicData) {
      // Filter monthlyJobs to the selected day
      sourceJobs = monthlyJobs.filter(job =>
        String(job.machineId) === String(machine._id) &&
        moment(job.createdAt).isSame(selectedDate, 'day')
      );
    } else {
      sourceJobs = historicData ? monthlyJobs : todayJobs;
      sourceJobs = sourceJobs.filter(job => String(job.machineId) === String(machine._id));
    }

    sourceJobs.forEach((job) => {
      const matchedJob = machine.jobList.find(j => j.uid === job.rfid);
      const name = matchedJob?.jobName?.trim();
      if (name) {
        jobRejectionCounts[name] = (jobRejectionCounts[name] || 0) + (job.rejectionCount || 0);
      }
    });

    return Object.entries(jobRejectionCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [machine, todayJobs, monthlyJobs, historicData, isDailyDrilldown, selectedDate]);
  
  // ✅ Pie chart data: jobName vs total production count
  const pieData = useMemo(() => {
    if (!machine || !Array.isArray(machine.jobList)) return [];

    const jobCounts = {};

    let sourceJobs = [];

    if (isDailyDrilldown && historicData) {
      // Filter monthlyJobs to the selected day
      sourceJobs = monthlyJobs.filter(job =>
        String(job.machineId) === String(machine._id) &&
        moment(job.createdAt).isSame(selectedDate, 'day')
      );
    } else {
      sourceJobs = historicData ? monthlyJobs : todayJobs;
      sourceJobs = sourceJobs.filter(job => String(job.machineId) === String(machine._id));
    }

    sourceJobs.forEach((job) => {
      const matchedJob = machine.jobList.find(j => j.uid === job.rfid);
      const name = matchedJob?.jobName?.trim();
      if (name) {
        jobCounts[name] = (jobCounts[name] || 0) + (job.jobCount || 0);
      }
    });

    return Object.entries(jobCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [machine, todayJobs, monthlyJobs, historicData, isDailyDrilldown, selectedDate]);

  const monthlyStats = useMemo(() => {
    if (!machine || !Array.isArray(monthlyJobs)) {
      return { production: 0, rejection: 0 };
    }

    const machineJobs = monthlyJobs.filter((job) => job.machineId === machine._id);

    const production = machineJobs.reduce((sum, job) => sum + (job.jobCount || 0), 0);
    const rejection = machineJobs.reduce((sum, job) => sum + (job.rejectionCount || 0), 0);

    return { production, rejection };
  }, [monthlyJobs, machine]);

  // ✅ Total production value
  const productionValue = useMemo(() => {
    if (isDailyDrilldown && historicData) {
      return historicHourlyData.reduce((sum, h) => sum + (h.production || 0), 0);
    }
    if (historicData) {
      return monthlyStats.production || 0;
    }
    return machine?.productionCount || 0;
  }, [isDailyDrilldown, historicData, historicHourlyData, monthlyStats.production, machine?.productionCount]);

  // ✅ Total rejection value
  const rejectionValue = useMemo(() => {
    if (isDailyDrilldown && historicData) {
      return historicHourlyData.reduce((sum, h) => sum + (h.rejection || 0), 0);
    }
    if (historicData) {
      return monthlyStats.rejection || 0;
    }
    return machine?.rejectionCount || 0;
  }, [isDailyDrilldown, historicData, historicHourlyData, monthlyStats.rejection, machine?.rejectionCount]);

  const hourlyData = useMemo(() => {
    // console.log('Recalculating hourlyData...');
    
    const data = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      production: 0,
      rejection: 0,
    }));

    // console.log('Initialized data:', data);

    if (!machine || historicData){
      // console.log('Machine not loaded OR in historic mode → returning empty buckets');
      return data;
    } 

    for (const job of todayJobs) {
      if (job.machineId === machine._id) {
        const jobHour = moment(job.createdAt).hour();
        // console.log(`Job for this machine at hour ${jobHour}`, job);

        data[jobHour].production += job.jobCount || 0;
        data[jobHour].rejection += job.rejectionCount || 0;

      //   console.log(
      //   `After adding jobCount=${job.jobCount}, rejectionCount=${job.rejectionCount}`,
      //   data[jobHour]
      // );  
      }
    }

    return data;
  }, [todayJobs, machine, historicData]);

  const dailyData = useMemo(() => {
    if (!machine || !historicData || !monthlyJobs.length || !historicViewDate) return [];

    const daysInMonth = new Date(
      historicViewDate.getFullYear(),
      historicViewDate.getMonth() + 1,
      0
    ).getDate();

    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      production: 0,
      rejection: 0,
    }));

    for (const job of monthlyJobs) {
      if (job.machineId === machine._id) {
        const jobDate = moment(job.createdAt);

        // Ensure the job is from the selected month
        if (
          jobDate.month() === historicViewDate.getMonth() &&
          jobDate.year() === historicViewDate.getFullYear()
        ) {
          const jobDay = jobDate.date() - 1; // index from 0
          if (data[jobDay]) {
            data[jobDay].production += job.jobCount || 0;
            data[jobDay].rejection += job.rejectionCount || 0;
          }
        }
      }
    }

    return data;
  }, [machine, monthlyJobs, historicData, historicViewDate]);

  const chartData = historicData
  ? (isDailyDrilldown ? historicHourlyData  : dailyData)
  : hourlyData;

  // 🟢 NEW handleViewHistoricData
  const handleViewHistoricData = async () => {
    setIsDailyDrilldown(false);

    // 1. Fetch the data first
    const year = selectedHistoricMonth.getFullYear();
    const month = selectedHistoricMonth.getMonth() + 1;

    const jobs = await getJobsByMonth(year, month);

    // 2. Update monthly data and date
    setMonthlyJobs(jobs);
    setHistoricViewDate(new Date(selectedHistoricMonth));

    // 3. Flip into Historic mode (now we already have data)
    setHistoricData(true);
  };

  const onBarClick = (data) => {
    if (!historicData || !historicViewDate) return;
    const clickedDay = data.day; // e.g. 14

    const year = historicViewDate.getFullYear();
    const month = historicViewDate.getMonth(); // 0 based
    const newDate = new Date(year, month, clickedDay);

    // Set this as the new selected date and go back to live/daily mode
    setSelectedDate(newDate);
    setIsDailyDrilldown(true);       // <— remember we drilled down
    setSelectedDay(clickedDay); // item.day = 5
    setSelectedMonth(month); // pass this from your month selection
  };

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

  const getJobsByMonth = async (year , month) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/jobs/by-month?year=${year}&month=${month}`, {
        withCredentials: true,
      });
      return res.data; // ✅ return job list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch jobs for selected month');
      return []; // Return empty list on failure
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
      // 1. Filter today's jobs for this specific machine
      const matchingJobs = todayJobs.filter(
        (job) => job.machineId === machine._id
      );

      // 2. Calculate total production count for this machine
      const productionCount = matchingJobs.reduce(
        (sum, job) => sum + (job.jobCount || 0),
        0
      );

      // 3. Calculate total rejection count for this machine
      const rejectionCount = matchingJobs.reduce(
        (sum, job) => sum + (job.rejectionCount || 0),
        0
      );

      // 4. Find the **latest job** (based on createdAt date)
      const latestJob = matchingJobs.reduce(
        (latest, current) =>
          !latest || new Date(current.createdAt) > new Date(latest.createdAt)
            ? current
            : latest,
        null
      );

      // 5. Extract latest RFID + machine status
      const latestRFID = latestJob?.rfid;
      const latestStatus = latestJob?.status ?? 'off';

      // 6. Find the tool name corresponding to that RFID
      let liveToolName = 'N/A';
      if (latestRFID && Array.isArray(machine.jobList)) {
        const matchedJob = machine.jobList.find(job => job.uid === latestRFID);
        if (matchedJob) {
          liveToolName = matchedJob.jobName || 'Unnamed Tool';
        }
      }

      // 7. Return enriched machine data with computed fields
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

    const socket = new WebSocket(
      window.location.hostname === 'localhost'
        // ? 'ws://localhost:8000'
        ? 'wss://thingscode-dashboard.onrender.com'
        : 'wss://thingscode-dashboard.onrender.com'
    );

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
    if (!userId || !liveData) return; // wait until user context is ready

    const dateStr = moment(selectedDate).format('YYYY-MM-DD');
    getJobsByDate(dateStr);
  }, [selectedDate, userId, liveData]);

  useEffect(() => {
    if (!userId) return;

    getMachines();
    // getTodayJobs();
  }, [userId]);

    // ====== Machine load effect ======
  useEffect(() => {
    if (processedMachines.length === 0) return;
    const found = processedMachines.find((m) => m._id === id);
    if (found) {
      setMachine(found);
    }
  }, [id, processedMachines]);

  // ====== Historic data fetch ======
  useEffect(() => {
    if (!historicData) return; // only run if in Historic mode
  
    const fetchData = async () => {
      const year = selectedHistoricMonth.getFullYear();
      const month = selectedHistoricMonth.getMonth() + 1;
    
      const jobs = await getJobsByMonth(year, month);
      setMonthlyJobs(jobs);
      setHistoricViewDate(new Date(selectedHistoricMonth));

      // 🚀 Reset drilldown if user changes month
      setIsDailyDrilldown(false);
      setSelectedDay(null);
      setSelectedDate(new Date(selectedHistoricMonth))
    };
  
    fetchData();
  }, [selectedHistoricMonth, historicData]);

  return (
    <TaskContext.Provider
      value={{
        jobs, todayJobs, machines, loading,
        isEditing, modalMode, activeMachine, machineToDelete,
        showDeleteModal, selectedDate, processedMachines, liveData,           
        createJob, setSelectedDate, getJobs, getJobById,
        updateJob, deleteMachine, createMachine, getMachines,
        getTodayJobs, getJobsByDate, handleInput, openModalForAddMachine,
        openModalForEditMachine, openModalForDeleteMachine, closeModal, getJobsByMonth,
        processedMachines,  todayJobs, setTodayJobs,
        selectedDate, setSelectedDate, historicData, setHistoricData,
        machine, setMachine, monthlyJobs, setMonthlyJobs,
        historicViewDate, setHistoricViewDate, selectedJob, setSelectedJob,
        isDailyDrilldown, setIsDailyDrilldown, selectedDay, setSelectedDay,
        selectedMonth, setSelectedMonth, selectedHistoricMonth, setSelectedHistoricMonth,
        historicHourlyData, rejectionPieData, pieData, monthlyStats,
        productionValue, rejectionValue, hourlyData, dailyData,
        chartData, handleViewHistoricData, onBarClick, getJobsByMonth
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
