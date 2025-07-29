'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTasks } from '@/context/taskContext';

export default function DashboardPage() {
  const {
    machines,
    getMachines,
    openModalForAddMachine,
    getJobs,
    jobs,
  } = useTasks();

  useEffect(() => {
    getMachines();
    getJobs();
  }, []);

  const machinesWithProduction = machines.map((machine: any) => {
  const matchingJobs = jobs.filter(
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

  return {
    ...machine,
    productionCount,
    rejectionCount,
  };
});

  return (
    <div className="dashboard p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {machines.map((machine: any) => (
          <Link key={machine._id} href={`/machine/${machine._id}`}>
            <div className="w-[15rem] rounded-lg overflow-hidden shadow hover:shadow-md transition cursor-pointer border border-gray-300 bg-white">

              {/* Top - Machine Name + Icons */}
              <div className="bg-red-600 text-white p-2 flex justify-between items-center">
                <h2 className="text-md font-bold">{machine.machineName}</h2>
                <div className="flex gap-2 text-white text-sm">
                  <button title="Edit" className="hover:text-gray-200">✏️</button>
                  <button title="Delete" className="hover:text-gray-200">🗑️</button>
                </div>
              </div>

              {/* Middle - Production & Rejection */}
              <div className="grid grid-cols-2 divide-x border-t border-b">
                <div className="p-2 text-center">
                  <p className="text-xs font-semibold text-gray-700">Production Count</p>
                  <p className="text-green-600 font-bold">{machine.productionCount ?? 0}</p>
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs font-semibold text-gray-700">Rejection Count</p>
                  <p className="text-red-600 font-bold">{machine.rejectionCount ?? 0}</p>
                </div>
              </div>

              {/* Bottom - Machine Status & Live Tools */}
              <div className="grid grid-cols-2 divide-x  text-center">
                <div className='p-2'>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Machine</p>
                  <div className="flex justify-center gap-1 items-center">
                    <span className="text-green-600 text-lg">🟢</span>
                    <span className="text-xs font-bold text-green-600">ON</span>
                    <span className="text-red-600 text-lg">🔴</span>
                    <span className="text-xs font-bold text-red-600">OFF</span>
                  </div>
                </div>
                <div className='p-2'>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Live Tools Details</p>
                  <p className="text-blue-600 font-bold text-sm">{machine.productionCount ?? 0}</p>
                </div>
              </div>

            </div>
          </Link>
        ))}

        <button
          onClick={openModalForAddMachine}
          className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg flex items-center justify-center font-semibold text-gray-800 border border-dashed border-gray-400"
        >
          + Add Machine
        </button>
      </div>
    </div>
  );
}
