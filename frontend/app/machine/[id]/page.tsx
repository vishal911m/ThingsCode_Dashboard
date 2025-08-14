'use client';
import MachineInfo from '@/app/Components/MachineInfo/MachineInfo';
import MachineInfoPanel from '@/app/Components/MachineInfoPanel/MachineInfoPanel';
import PieCharts from '@/app/Components/PieCharts/PieCharts';
import BarChartComponent from '@/app/Components/BarChart/BarChart';
import useRedirect from '@/hooks/useUserRedirect';
import { useEffect } from 'react';
import { useTasks } from '@/context/taskContext';

export default function MachinePage() {
  useRedirect("/login");

  const {setHistoricData} = useTasks();

  useEffect(() => {
    // ✅ Always reset historicData when the page loads
    setHistoricData(false);

    return () => {
      // ✅ Ensure cleanup when leaving the page
      setHistoricData(false);
    };
  }, []);

  return (
    <div className="MachinePage p-t-1 space-y-1">
      {/* 🔷 Top Section - Machine Info */}
      <MachineInfo />

      {/* 🔷 Bottom Section */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* 🟩 Left Column */}
        <MachineInfoPanel />

        {/* 🟦 Right Column */}
        <div className="space-y-4 flex-grow">
          {/* Top Charts */}
          <PieCharts />

          {/* Bottom - Live Data Bar Chart */}
          <BarChartComponent />
        </div>
      </div>
    </div>
  );
}
