'use client';

import { useTasks } from '@/context/taskContext';
import moment from 'moment';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
  const jobList = ['Job #1 - Running', 'Job #2 - Completed', 'Job #3 - Queued'];
  const [selectedJob, setSelectedJob] = useState('Job #1');
  const [historicData, setHistoricData] = useState(false);
  const { id } = useParams(); // dynamic route param
  const { processedMachines, todayJobs, getJobsByMonth, selectedDate, setSelectedDate } = useTasks();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [monthlyJobs, setMonthlyJobs] = useState<any[]>([]);

  useEffect(() => {
    if (processedMachines.length === 0) return;
    const found = processedMachines.find((m: any) => m._id === id);
    if (found) {
      setMachine(found);
    }
  }, [id, processedMachines]);

  // Manual fetch on "VIEW" button
  const handleFetchHistoricData = async () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const jobs = await getJobsByMonth(year, month);
    setMonthlyJobs(jobs);
    setHistoricData(true);
  };

  const hourlyData = useMemo(() => {
    const data = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      production: 0,
      rejection: 0,
    }));

    if (!machine || historicData) return data;

    for (const job of todayJobs) {
      if (job.machineId === machine._id) {
        const jobHour = moment(job.createdAt).hour();
        data[jobHour].production += job.jobCount || 0;
        data[jobHour].rejection += job.rejectionCount || 0;
      }
    }

    return data;
  }, [todayJobs, machine, historicData]);

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
          <h1 className="text-2xl font-bold text-left w-full md:w-1/3">
            Machine: {machine?.machineName}
          </h1>
          <div className="text-center w-full md:w-1/3">
            <span className="text-lg font-medium">Status: </span>
            <span className={`font-semibold ${machine?.latestStatus === 'on' ? 'text-green-600' : 'text-red-500'}`}>
              {machine?.latestStatus?.toUpperCase()}
            </span>
          </div>
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
      </div>

      {/* 🔷 Bottom Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 🟩 Left Column */}
        <div className="space-y-4 w-full lg:w-[300px] flex-shrink-0">
          {/* Row 1 - Component Count */}
          <div className="bg-white p-4 rounded shadow border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Component Count</h3>
              <button
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  !historicData
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-black hover:bg-gray-400'
                }`}
                onClick={() => setHistoricData(false)}
              >
                LIVE
              </button>
            </div>
            <h1 className="text-base">
              Production Count: {historicData ? 'N/A' : machine?.productionCount}
            </h1>
            <h1 className="text-base">
              Rejection Count: {historicData ? 'N/A' : machine?.rejectionCount}
            </h1>
          </div>

          {/* Row 2 - Historic Data */}
          <div className="bg-white p-4 rounded shadow border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Historic Data</h3>
              <button
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  historicData
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-black hover:bg-gray-400'
                }`}
                onClick={handleFetchHistoricData}
              >
                VIEW
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-base">Month:</label>
              <input
                type="month"
                className="border rounded px-2 py-1 text-sm"
                value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-').map(Number);
                  setSelectedDate(new Date(year, month - 1));
                  // Do not reset historicData here
                }}
              />
            </div>
            <h1 className="text-base">
              Total Count: {historicData ? monthlyStats.production : 'N/A'}
            </h1>
            <h1 className="text-base">
              Rejection Count: {historicData ? monthlyStats.rejection : 'N/A'}
            </h1>
          </div>

          {/* Row 3 - Live Tool Data */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="text-xl font-semibold mb-2">Live Tool Data</h3>
            <span className="font-semibold">{machine?.liveToolName}</span>
          </div>
        </div>

        {/* 🟦 Right Column */}
        <div className="space-y-4 flex-grow">
          {/* Top Charts */}
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
                    formatter={(value: number, name: string) =>
                      historicData ? ['N/A', name] : [`${value}`, name]
                    }
                    labelFormatter={(label: number) => {
                      const suffix = label < 12 ? 'AM' : 'PM';
                      const hourFormatted = label === 0 ? 12 : label > 12 ? label - 12 : label;
                      return `Time: ${hourFormatted} ${suffix}`;
                    }}
                  />
                  <Legend />
                  {!historicData && (
                    <>
                      <Bar dataKey="production" stackId="a" fill="#3B82F6" name="Production Count" />
                      <Bar dataKey="rejection" stackId="a" fill="#EF4444" name="Rejection Count" />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
