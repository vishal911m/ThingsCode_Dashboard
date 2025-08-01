'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTasks } from '@/context/taskContext';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import MachineItem from '../Components/MachineItem/MachineItem';

export default function DashboardPage() {
  const {
    getMachines,
    openModalForAddMachine,
    openModalForEditMachine,
    getJobsByDate,
    openModalForDeleteMachine,
    selectedDate, 
    setSelectedDate, 
    processedMachines,
  } = useTasks();  

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
                setSelectedDate(date);
                getJobsByDate(date);
                console.log("Selected date:", date);
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
            onEdit={openModalForEditMachine}
            onDelete={openModalForDeleteMachine}
          />          
        ))}

        <button
          onClick={openModalForAddMachine}
          className="bg-gray-100 w-[15rem] hover:bg-gray-200 p-4 rounded-lg flex items-center justify-center 
          font-semibold text-gray-800 border border-dashed border-gray-400"
        >
          + Add Machine
        </button>
      </div>
    </div>
  );
}
