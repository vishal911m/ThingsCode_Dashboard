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
  jobList: Array<{
    jobName: string;
    uid: string;
    _id: string;
  }>;
};

export default function MachinePage() {
  const [historicData, setHistoricData] = useState(false);
  const { id } = useParams(); // dynamic route param
  const { processedMachines, todayJobs, getJobsByMonth, selectedDate, setSelectedDate } = useTasks();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [monthlyJobs, setMonthlyJobs] = useState<any[]>([]);
  const [historicViewDate, setHistoricViewDate] = useState<Date | null>(null);
  const [selectedJob, setSelectedJob] = useState('');
  const [isDailyDrilldown, setIsDailyDrilldown] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    if (processedMachines.length === 0) return;
    const found = processedMachines.find((m: any) => m._id === id);
    if (found) {
      setMachine(found);
    }
  }, [id, processedMachines]);

  useEffect(() => {
    const fetchData = async () => {
      if (!historicData) return;

      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const jobs = await getJobsByMonth(year, month);
      setMonthlyJobs(jobs);
      setHistoricViewDate(new Date(selectedDate));
    };

    fetchData();
  }, [selectedDate, historicData]);


  const handleViewHistoricData = () => {
    setHistoricData(true);        // ✅ always turns ON historic view
    setIsDailyDrilldown(false);   // optional: reset drill-down when switching months
  };

  const hourlyData = useMemo(() => {
    // console.log('Recalculating hourlyData...');
    
    const data = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      production: 0,
      rejection: 0,
    }));

    // console.log('Initialized data:', data);

    if (!machine || historicData){
      // console.log('Machine not loaded OR in historic mode → returning empty buckets');
      return data;
    } 

    for (const job of todayJobs) {
      if (job.machineId === machine._id) {
        const jobHour = moment(job.createdAt).hour();
        // console.log(`Job for this machine at hour ${jobHour}`, job);

        data[jobHour].production += job.jobCount || 0;
        data[jobHour].rejection += job.rejectionCount || 0;

      //   console.log(
      //   `After adding jobCount=${job.jobCount}, rejectionCount=${job.rejectionCount}`,
      //   data[jobHour]
      // );  
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

  const dailyData = useMemo(() => {
    if (!machine || !historicData || !monthlyJobs.length || !historicViewDate) return [];

    const daysInMonth = new Date(
      historicViewDate.getFullYear(),
      historicViewDate.getMonth() + 1,
      0
    ).getDate();

    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      production: 0,
      rejection: 0,
    }));

    for (const job of monthlyJobs) {
      if (job.machineId === machine._id) {
        const jobDate = moment(job.createdAt);

        // Ensure the job is from the selected month
        if (
          jobDate.month() === historicViewDate.getMonth() &&
          jobDate.year() === historicViewDate.getFullYear()
        ) {
          const jobDay = jobDate.date() - 1; // index from 0
          if (data[jobDay]) {
            data[jobDay].production += job.jobCount || 0;
            data[jobDay].rejection += job.rejectionCount || 0;
          }
        }
      }
    }

    return data;
  }, [machine, monthlyJobs, historicData, historicViewDate]);

  const onBarClick = (data: any) => {
    if (!historicData || !historicViewDate) return;
    const clickedDay = data.day; // e.g. 14

    const year = historicViewDate.getFullYear();
    const month = historicViewDate.getMonth(); // 0 based
    const newDate = new Date(year, month, clickedDay);

    // Set this as the new selected date and go back to live/daily mode
    setSelectedDate(newDate);
    setIsDailyDrilldown(true);       // <— remember we drilled down
    setSelectedDay(clickedDay); // item.day = 5
    setSelectedMonth(month); // pass this from your month selection
  };

  const historicHourlyData = useMemo(() => {
    const data = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      production: 0,
      rejection: 0,
    }));

    if (!machine || !historicData || !isDailyDrilldown) return data;

    for (const job of monthlyJobs) {
      if (job.machineId === machine._id) {
        const jobDate = moment(job.createdAt);
        if (
          jobDate.isSame(selectedDate, 'day')  // only for selected day
        ) {
          const h = jobDate.hour();
          data[h].production += job.jobCount || 0;
          data[h].rejection += job.rejectionCount || 0;
        }
      }
    }
    return data;
  }, [machine, monthlyJobs, historicData, isDailyDrilldown, selectedDate]);

  const chartData = historicData
  ? (isDailyDrilldown ? historicHourlyData  : dailyData)
  : hourlyData;

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
              {/* Placeholder */}
              <option value="" disabled>
                Select Job
              </option>

              {/* Actual jobs */}
              {machine?.jobList?.map((job) => (
                <option key={job._id} value={job.jobName}>
                  {job.jobName}
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
                onClick={() => {
                  setHistoricData(false);
                  setMonthlyJobs([]); // optional but safe
                  setSelectedDate(new Date()); // reset month picker to current month
                }}
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">
                {historicData ? (
                  isDailyDrilldown && selectedDay !== null && selectedMonth !== null ? (
                    `Hourly Data (${selectedDay} ${monthNames[selectedMonth]})`
                  ) : (
                    `Monthly Summary (${monthNames[selectedDate.getMonth()]})`
                  )
                ) : (
                  'Hourly Data (Live)'
                )}
              </h3>
              {historicData && isDailyDrilldown && (
                <button
                  onClick={() => setIsDailyDrilldown(false)}
                  className="inline-block bg-gray-200 hover:bg-gray-300 text-xs px-2 py-1 rounded"
                >
                  ← Back to Month View
                </button>
              )}
            </div>
            <div className="h-64">
              {historicData && dailyData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for this month.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <XAxis
                      dataKey={
                        historicData
                          ? (isDailyDrilldown ? 'hour' : 'day')
                          : 'hour'
                      }
                      label={{
                        value: historicData
                          ? (isDailyDrilldown ? 'Hour' : 'Day of Month')
                          : 'Hour',
                        position: 'insideBottomRight',
                        offset: -5
                      }}
                    />
                    <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value}`, name]}
                      labelFormatter={(label: number) => {
                        if (historicData && isDailyDrilldown) {
                          // Show time (12hr format)
                          const hour = label;
                          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                          const period = hour < 12 ? 'AM' : 'PM';
                          return `Time: ${displayHour} ${period}`;
                        } else if (historicData && !isDailyDrilldown) {
                          return `Day: ${label}`;
                        } else {
                          // Live hourly
                          const hour = label;
                          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                          const period = hour < 12 ? 'AM' : 'PM';
                          return `Time: ${displayHour} ${period}`;
                        }
                      }}
                    />
                    <Legend />
                    <Bar dataKey="production" stackId="a" fill="#3B82F6" name="Production Count" onClick={historicData && !isDailyDrilldown ? onBarClick : undefined} />
                    <Bar dataKey="rejection" stackId="a" fill="#EF4444" name="Rejection Count" onClick={historicData && !isDailyDrilldown ? onBarClick : undefined} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
