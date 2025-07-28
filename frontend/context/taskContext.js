'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const TaskContext = createContext();

export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [formData, setFormData] = useState({
    machineName: '',
    machineType: '',
    jobList: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  // ----------- Modal Actions -----------
  const openModalForAddMachine = () => {
    setFormData({ machineName: '', machineType: '', jobList: [] });
    setSelectedMachine(null);
    setIsModalOpen(true);
  };

  const openModalForEditMachine = (machine) => {
    setFormData({
      machineName: machine.machineName,
      machineType: machine.machineType,
      jobList: machine.jobList || [],
    });
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
    setFormData({ machineName: '', machineType: '', jobList: [] });
  };

  const openDeleteModal = (machine) => {
    setSelectedMachine(machine);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedMachine(null);
  };

  // ----------- Input Handler -----------
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ----------- API Functions -----------
  const getTasks = async () => {
    try {
      const res = await axiosAuth.get('/machine');
      setMachines(res.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const getTask = async (id) => {
    try {
      const res = await axiosAuth.get(`/machine/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching machine:', error);
    }
  };

  const deleteMachine = async () => {
    if (!selectedMachine) return;
    try {
      await axiosAuth.delete(`/machine/${selectedMachine._id}`);
      setMachines((prev) =>
        prev.filter((m) => m._id !== selectedMachine._id)
      );
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting machine:', error);
    }
  };

  // Fetch machines on mount
  useEffect(() => {
    if (token) getTasks();
  }, [token]);

  return (
    <TaskContext.Provider
      value={{
        machines,
        formData,
        selectedMachine,
        isModalOpen,
        isDeleteModalOpen,
        openModalForAddMachine,
        openModalForEditMachine,
        closeModal,
        getTasks,
        getTask,
        deleteMachine,
        openDeleteModal,
        closeDeleteModal,
        handleInput,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = ()=>{
  return React.useContext(TaskContext);
}; 