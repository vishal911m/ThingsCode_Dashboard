'use client';
import { useTasks } from '@/context/taskContext';

interface Job {
  _id: string;
  jobName: string;
}

export default function MachineInfo() {
  const { machine, selectedJob, setSelectedJob } = useTasks();

  return (
    <div className="MachineInfo bg-white shadow rounded p-1 border space-y-4">
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
            <option value="" disabled>Select Job</option>
            {machine?.jobList?.map((job: Job) => (
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
