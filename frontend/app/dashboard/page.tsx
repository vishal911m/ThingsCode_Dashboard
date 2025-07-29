'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTasks } from '@/context/taskContext';

export default function DashboardPage() {
  const {
    machines,
    getMachines,
    openModalForAddMachine,
  } = useTasks();

  useEffect(() => {
    getMachines();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {machines.map((machine: any) => (
          <Link key={machine._id} href={`/machine/${machine._id}`}>
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">{machine.machineName}</h2>
              <p>
                <span className="font-medium">Production:</span>{' '}
                {machine.productionCount ?? 0}
              </p>
              <p>
                <span className="font-medium">Rejected:</span>{' '}
                {machine.rejectionCount ?? 0}
              </p>
              <p>
                <span className="font-medium">Status:</span>{' '}
                <span
                  className={`${
                    machine.status === 'on'
                      ? 'text-green-600'
                      : 'text-red-600'
                  } font-bold`}
                >
                  {machine.status?.toUpperCase() || 'OFF'}
                </span>
              </p>
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
