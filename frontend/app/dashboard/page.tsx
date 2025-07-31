'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTasks } from '@/context/taskContext';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

export default function DashboardPage() {
  const {
    machines,
    getMachines,
    openModalForAddMachine,
    openModalForEditMachine,
    getJobs,
    jobs,
    getTodayJobs,
    todayJobs,
    getJobsByDate,
    openModalForDeleteMachine
  } = useTasks();

  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    getMachines();
    getTodayJobs();
  }, []);

  // Enhance each machine with production & rejection count
  const machinesWithProduction = machines.map((machine: any) => {
    

    const matchingJobs = todayJobs.filter(
      (job: any) => job.machineId === machine._id
    );

    const productionCount = matchingJobs.reduce(
      (sum: number, job: any) => sum + (job.jobCount || 0),
      0
    );

    const rejectionCount = matchingJobs.reduce(
      (sum: number, job: any) => sum + (job.rejectionCount || 0),
      0
    );

    // 👉 latest job for RFID + status
    const latestJob = matchingJobs.reduce(
      (latest: any, current: any) =>
        !latest || new Date(current.createdAt) > new Date(latest.createdAt)
          ? current
          : latest,
      null
    );

    // Get RFID from latest job
    const latestRFID = latestJob?.rfid;
    const latestStatus = latestJob?.status ?? 'off';

    console.log('Latest Job for machine', machine.machineName, latestJob);


    // Match rfid in jobList to get job name
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
        {machinesWithProduction.map((machine: any) => (
          
            <div className="w-[15rem] rounded-lg overflow-hidden shadow hover:shadow-md transition cursor-pointer border border-gray-300 bg-white">

              {/* Top - Machine Name + Icons */}
              <div className="bg-red-600 text-white p-2 flex justify-between items-center">
                <Link key={machine._id} href={`/machine/${machine._id}`}>
                <h2 className="text-md font-bold">{machine.machineName}</h2>
                </Link>
                <div className="flex gap-2 text-white text-sm">
                  <button title="Edit" className="hover:text-gray-200"
                    onClick={()=>openModalForEditMachine(machine)}
                  > 
                    ✏️
                  </button>
                  <button title="Delete" className="hover:text-gray-200"
                    onClick={()=>openModalForDeleteMachine(machine)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Middle - Production & Rejection */}
              <div className="grid grid-cols-2 divide-x border-t border-b">
                <div className="p-2 text-center">
                  <p className="text-xs font-semibold text-gray-700">Production Count</p>
                  <p className="text-green-600 font-bold">{machine.productionCount}</p>
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs font-semibold text-gray-700">Rejection Count</p>
                  <p className="text-red-600 font-bold">{machine.rejectionCount}</p>
                </div>
              </div>

              {/* Bottom - Machine Status & Live Tools */}
              <div className="grid grid-cols-2 divide-x  text-center">
                <div className='p-2'>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Machine Status</p>
                  <div className="flex justify-center gap-1 items-center">
                    {machine.latestStatus === 'on' ? (
                      <>
                        <span className="text-green-600 text-lg">🟢</span>
                        <span className="text-xs font-bold text-green-600">ON</span>
                      </>
                    ) : (
                      <>
                        <span className="text-red-600 text-lg">🔴</span>
                        <span className="text-xs font-bold text-red-600">OFF</span>
                      </>
                    )}
                  </div>
                </div>
                <div className='p-2'>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Live Tools Details</p>
                  <p className="text-blue-600 font-bold text-sm">{machine.liveToolName}</p>
                </div>
              </div>

            </div>
          
        ))}

        <button
          onClick={openModalForAddMachine}
          className="bg-gray-100 w-[15rem] hover:bg-gray-200 p-4 rounded-lg flex items-center justify-center font-semibold text-gray-800 border border-dashed border-gray-400"
        >
          + Add Machine
        </button>
      </div>
    </div>
  );
}
