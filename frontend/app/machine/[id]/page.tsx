'use client'

import { useTasks } from '@/context/taskContext';
import moment from 'moment';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Machine = {
  _id: string;
  machineName: string;
  machineType: string;
  productionCount: number;
  rejectionCount: number;
  liveToolName: string;
  latestStatus: string;
};

export default function MachinePage() {
  const jobList = ["Job #1 - Running", "Job #2 - Completed", "Job #3 - Queued"];
  const [selectedJob, setSelectedJob] = useState("Job #1");
  const { id } = useParams(); // dynamic route param
  const { processedMachines, todayJobs, getJobsByMonth, selectedDate, setSelectedDate} = useTasks();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [monthlyJobs, setMonthlyJobs] = useState<any[]>([]); // ⬅️ Add this

  useEffect(() => {
    if (processedMachines.length === 0) return;
    const found = processedMachines.find((m: any) => m._id === id);
    if (found) {
      setMachine(found);
    }
  }, [id, processedMachines]);

  // Fetch jobs for selected month
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    (async () => {
      const jobs = await getJobsByMonth(year, month); // ⬅️ Assumes this returns the job array
      setMonthlyJobs(jobs);
    })();
  }, [selectedDate, getJobsByMonth]);

  const hourlyData = useMemo(() => {
  const data = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    production: 0,
    rejection: 0,
  }));

  if (!machine) return data;

  for (const job of todayJobs) {
    if (job.machineId === machine._id) {
      const jobHour = moment(job.createdAt).hour();
      data[jobHour].production += job.jobCount || 0;
      data[jobHour].rejection += job.rejectionCount || 0;
    }
  }

  return data;
}, [todayJobs, machine]);

  // 📊 Historic Totals
  const monthlyStats = useMemo(() => {
  if (!machine || !Array.isArray(monthlyJobs)) {
      return { production: 0, rejection: 0 };
    }

    const machineJobs = monthlyJobs.filter((job) => job.machineId === machine._id);

    const production = machineJobs.reduce((sum, job) => sum + (job.jobCount || 0), 0);
    const rejection = machineJobs.reduce((sum, job) => sum + (job.rejectionCount || 0), 0);

    return { production, rejection };
  }, [monthlyJobs, machine]);

  return (
    <div className="p-t-1 space-y-6">

      {/* 🔷 Top Section - Machine Info */}
      <div className="bg-white shadow rounded p-1 border space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">

          {/* Machine Name - Left */}
          <h1 className="text-2xl font-bold text-left w-full md:w-1/3">
            Machine: {machine?.machineName}
          </h1>

          {/* Status - Center */}
          <div className="text-center w-full md:w-1/3">
            <span className="text-lg font-medium">Status: </span>
            <span className={`font-semibold ${machine?.latestStatus === 'on' ? 'text-green-600' : 'text-red-500'}`}>
              {machine?.latestStatus?.toUpperCase()}
            </span>
          </div>

          {/* Job Selector - Right */}
          <div className="w-full md:w-1/3 flex justify-end">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm"
            >
              {jobList.map((job, index) => (
                <option key={index} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job List */}
        
      </div>

      {/* 🔷 Bottom Section */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* 🟩 Left Column */}
        <div className="space-y-4 w-full lg:w-[300px] flex-shrink-0">

          {/* Row 1 - Live Component Count */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="text-xl font-semibold mb-2">Component Count</h3>
            <h1 className="text-base">Production Count: {machine?.productionCount}</h1>
            <h1 className="text-base">Rejection Count: {machine?.rejectionCount}</h1>
          </div>

          {/* Row 2 - Historic Data */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="text-xl font-semibold mb-2">Historic Data</h3>
            {/* Month and Year Input */}
            <h1 className="text-base">
              Month:&nbsp;
              <input
                type="month"
                className="border rounded px-2 py-1 text-sm"
                value={selectedDate.toISOString().slice(0, 7)}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-').map(Number);
                  setSelectedDate(new Date(year, month - 1));
                }}
              />
            </h1>
                      
            {/* Total Count */}
            <h1 className="text-base">Total Count: {monthlyStats.production}</h1>
                      
            {/* Rejection Count */}
            <h1 className="text-base">Rejection Count: {monthlyStats.rejection}</h1>
          </div>

          {/* Row 3 - Live Tool Data */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="text-xl font-semibold mb-2">Live Tool Data</h3>
            <span className="font-semibold">{machine?.liveToolName}</span>
          </div>
        </div>

        {/* 🟦 Right Column */}
        <div className="space-y-4 flex-grow">

          {/* Top - Production Chart + Machine Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow border">
              <h3 className="text-xl font-semibold mb-2">Production Chart</h3>
              <div className="h-40 bg-gray-100 rounded">[Chart Placeholder]</div>
            </div>
            <div className="bg-white p-4 rounded shadow border">
              <h3 className="text-xl font-semibold mb-2">Machine Chart</h3>
              <div className="h-40 bg-gray-100 rounded">[Chart Placeholder]</div>
            </div>
          </div>

          {/* Bottom - Live Data Bar Chart */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="text-xl font-semibold mb-2">Live Data (Bar Chart)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <XAxis dataKey="hour" label={{ value: 'Time (0-23)', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}`, name]}
                    labelFormatter={(label: number) => {
                      const suffix = label < 12 ? 'AM' : 'PM';
                      const hourFormatted = label === 0 ? 12 : label > 12 ? label - 12 : label;
                      return `Time: ${hourFormatted} ${suffix}`;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="production" stackId="a" fill="#3B82F6" name="Production Count" />
                  <Bar dataKey="rejection" stackId="a" fill="#EF4444" name="Rejection Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
