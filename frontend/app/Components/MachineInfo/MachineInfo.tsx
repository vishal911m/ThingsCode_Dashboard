'use client';
import React from 'react';

interface Job {
  _id: string;
  jobName: string;
}

interface Machine {
  machineName?: string;
  latestStatus?: string;
  jobList?: Job[];
}

interface MachineInfoProps {
  machine?: Machine;
  selectedJob: string;
  setSelectedJob: (value: string) => void;
}

export default function MachineInfo({
  machine,
  selectedJob,
  setSelectedJob
}: MachineInfoProps) {
  return (
    <div className="bg-white shadow rounded p-1 border space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
        
        {/* Machine Name */}
        <h1 className="text-2xl font-bold text-left w-full md:w-1/3">
          Machine: {machine?.machineName}
        </h1>
        
        {/* Status */}
        <div className="text-center w-full md:w-1/3">
          <span className="text-lg font-medium">Status: </span>
          <span
            className={`font-semibold ${
              machine?.latestStatus === 'on'
                ? 'text-green-600'
                : 'text-red-500'
            }`}
          >
            {machine?.latestStatus?.toUpperCase()}
          </span>
        </div>
        
        {/* Job Selector */}
        <div className="w-full md:w-1/3 flex justify-end">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm"
          >
            {/* Placeholder */}
            <option value="" disabled>
              Select Job
            </option>

            {/* Jobs */}
            {machine?.jobList?.map((job) => (
              <option key={job._id} value={job.jobName}>
                {job.jobName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
