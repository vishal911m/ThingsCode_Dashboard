'use client';

import MachineModal from "@/app/Components/MachineModal/MachineModal";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useRedirect from '@/hooks/useUserRedirect';
import { RootState } from '@/store';
import { addLiveJob, fetchJobsByDate, setSelectedDate } from '@/store/jobsSlice';
import { fetchMachines } from '@/store/machinesSlice';
import { selectProcessedMachines } from '@/store/selectors';
import { openAddModal, openDeleteModal, openEditModal } from '@/store/uiSlice';
import { CalendarIcon } from "lucide-react";
import { useEffect } from 'react';
import MachineItem from '../Components/MachineItem/MachineItem';
import DeleteModal from "../Components/DeleteModal/DeleteModal";
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function DashboardPage() {
  useRedirect("/login");
  
  const dispatch = useAppDispatch();


  const processedMachines = useAppSelector(selectProcessedMachines);

  const selectedDate = useAppSelector(
    (state: RootState) => state.jobs.selectedDate
  );

  const machines = useAppSelector(
    (state: RootState) => state.machines.machines
  );

  const loading = useAppSelector(
    (state: RootState) => state.machines.loading
  );

  const error = useAppSelector(
    (state: RootState) => state.machines.error
  );
  
  useEffect(() => {
    dispatch(fetchMachines());
    dispatch(fetchJobsByDate(selectedDate));
  }, [dispatch, selectedDate]);

  useEffect(() => {
    const socket = new WebSocket(
      "wss://thingscode-dashboard.onrender.com"
    );

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "NEW_JOB") {
        dispatch(addLiveJob(message.data));
      }
    };

    return () => socket.close();
  }, [dispatch]);

  return (
    <div className="dashboard p-6">
      {/* 👇 Top Section with Calendar */}
      <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 border">
            <CalendarIcon className="h-5 w-5 text-gray-700" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                dispatch(setSelectedDate(date));
                dispatch(fetchJobsByDate(date));
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {processedMachines.map((machine: any) => (
          <MachineItem
            key={machine._id}
            machine={machine}
            onEdit={(machine) =>
              dispatch(openEditModal(machine))
            }
            onDelete={(machine) => dispatch(openDeleteModal(machine))}
          />          
        ))}

        <button
          onClick={() => dispatch(openAddModal())}
          className="bg-gray-100 w-[15rem] hover:bg-gray-200 p-4 rounded-lg flex items-center justify-center 
          font-semibold text-gray-800 border border-dashed border-gray-400"
        >
          + Add Machine
        </button>
      </div>

      {/* Global Modal */}
      <MachineModal />
      <DeleteModal />
    </div>
  );
}
