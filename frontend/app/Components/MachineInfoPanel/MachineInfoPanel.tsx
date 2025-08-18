'use client';
import { useTasks } from '@/context/taskContext';
import { useEffect } from 'react';

export default function MachineInfoPanel() {
  const {
    machine, historicData,
    monthlyStats, selectedHistoricMonth,
    setSelectedHistoricMonth, handleViewHistoricData,
    setHistoricData, setIsDailyDrilldown,
    setSelectedDate, setMonthlyJobs,
    setSelectedJob, selectedJob
  } = useTasks();    

  const onLiveClick = () => {
    setHistoricData(false);
    setIsDailyDrilldown(false);
    setSelectedDate(new Date());
    setMonthlyJobs([]);
    setSelectedHistoricMonth(new Date());
  };

  useEffect(() => {
    // ✅ Always reset historicData when the page loads
    setHistoricData(false);
    setSelectedHistoricMonth(new Date());
    setSelectedDate(new Date());

    return () => {
      // ✅ Ensure cleanup when leaving the page
      setHistoricData(false);
      setSelectedHistoricMonth(new Date());
      setSelectedDate(new Date());
    };
  }, []);

  return (
    <div className="MachineInfoPanel space-y-1 w-full lg:w-[300px] flex-shrink-0">
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
            onClick={onLiveClick}
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
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-black hover:bg-gray-400'
            }`}
            onClick={handleViewHistoricData}
          >
            VIEW
          </button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-base">Month:</label>
          <input
            type="month"
            className="border rounded px-2 py-1 text-sm"
            value={`${selectedHistoricMonth.getFullYear()}-${String(selectedHistoricMonth.getMonth() + 1).padStart(2, '0')}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-').map(Number);
              setSelectedHistoricMonth(new Date(year, month - 1));
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

      {/* Job Selector */}
      <div className="bg-white p-4 rounded shadow border">
        <h3 className="text-xl font-semibold mb-2">Select Job</h3>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm w-full"
        >
          <option value="" disabled>Select Job</option>
          {machine?.jobList?.map((job: any) => (
            <option key={job._id} value={job.jobName}>
              {job.jobName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
