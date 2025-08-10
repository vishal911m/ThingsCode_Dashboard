'use client';
import BarChartComponent from '@/app/Components/BarChart/BarChart';
import MachineInfo from '@/app/Components/MachineInfo/MachineInfo';
import MachineInfoPanel from '@/app/Components/MachineInfoPanel/MachineInfoPanel';
import PieCharts from '@/app/Components/PieCharts/PieCharts';
import { useTasks } from '@/context/taskContext';
import moment from 'moment';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

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
  const [selectedHistoricMonth, setSelectedHistoricMonth] = useState<Date>(new Date());
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  // 🎨 Pie chart colors (you can add more if you have more jobs)
  const COLORS = ['#3B82F6', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

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

  // ✅ Pie chart data for rejection: jobName vs total rejection count
  const rejectionPieData = useMemo(() => {
    if (!machine || !Array.isArray(machine.jobList)) return [];

    const jobRejectionCounts: Record<string, number> = {};

    let sourceJobs: any[] = [];

    if (isDailyDrilldown && historicData) {
      // Filter monthlyJobs to the selected day
      sourceJobs = monthlyJobs.filter(job =>
        String(job.machineId) === String(machine._id) &&
        moment(job.createdAt).isSame(selectedDate, 'day')
      );
    } else {
      sourceJobs = historicData ? monthlyJobs : todayJobs;
      sourceJobs = sourceJobs.filter(job => String(job.machineId) === String(machine._id));
    }

    sourceJobs.forEach((job: { rfid?: string; rejectionCount?: number }) => {
      const matchedJob = machine.jobList.find(j => j.uid === job.rfid);
      const name = matchedJob?.jobName?.trim();
      if (name) {
        jobRejectionCounts[name] = (jobRejectionCounts[name] || 0) + (job.rejectionCount || 0);
      }
    });

    return Object.entries(jobRejectionCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [machine, todayJobs, monthlyJobs, historicData, isDailyDrilldown, selectedDate]);

  // ✅ Pie chart data: jobName vs total production count
  const pieData = useMemo(() => {
    if (!machine || !Array.isArray(machine.jobList)) return [];

    const jobCounts: Record<string, number> = {};

    let sourceJobs: any[] = [];

    if (isDailyDrilldown && historicData) {
      // Filter monthlyJobs to the selected day
      sourceJobs = monthlyJobs.filter(job =>
        String(job.machineId) === String(machine._id) &&
        moment(job.createdAt).isSame(selectedDate, 'day')
      );
    } else {
      sourceJobs = historicData ? monthlyJobs : todayJobs;
      sourceJobs = sourceJobs.filter(job => String(job.machineId) === String(machine._id));
    }

    sourceJobs.forEach((job: { rfid?: string; jobCount?: number }) => {
      const matchedJob = machine.jobList.find(j => j.uid === job.rfid);
      const name = matchedJob?.jobName?.trim();
      if (name) {
        jobCounts[name] = (jobCounts[name] || 0) + (job.jobCount || 0);
      }
    });

    return Object.entries(jobCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [machine, todayJobs, monthlyJobs, historicData, isDailyDrilldown, selectedDate]);

  useEffect(() => {
    if (processedMachines.length === 0) return;
    const found = processedMachines.find((m: any) => m._id === id);
    if (found) {
      setMachine(found);
    }
  }, [id, processedMachines]);

  useEffect(() => {
    if (!historicData) return; // only run if in Historic mode
  
    const fetchData = async () => {
      const year = selectedHistoricMonth.getFullYear();
      const month = selectedHistoricMonth.getMonth() + 1;
    
      const jobs = await getJobsByMonth(year, month);
      setMonthlyJobs(jobs);
      setHistoricViewDate(new Date(selectedHistoricMonth));
    };
  
    fetchData();
  }, [selectedHistoricMonth, historicData]);


  // 🟢 NEW handleViewHistoricData
  const handleViewHistoricData = async () => {
    setIsDailyDrilldown(false);

    // 1. Fetch the data first
    const year = selectedHistoricMonth.getFullYear();
    const month = selectedHistoricMonth.getMonth() + 1;

    const jobs = await getJobsByMonth(year, month);

    // 2. Update monthly data and date
    setMonthlyJobs(jobs);
    setHistoricViewDate(new Date(selectedHistoricMonth));

    // 3. Flip into Historic mode (now we already have data)
    setHistoricData(true);
  };

  const monthlyStats = useMemo(() => {
    if (!machine || !Array.isArray(monthlyJobs)) {
      return { production: 0, rejection: 0 };
    }

    const machineJobs = monthlyJobs.filter((job) => job.machineId === machine._id);

    const production = machineJobs.reduce((sum, job) => sum + (job.jobCount || 0), 0);
    const rejection = machineJobs.reduce((sum, job) => sum + (job.rejectionCount || 0), 0);

    return { production, rejection };
  }, [monthlyJobs, machine]);

  // ✅ Total production value
  const productionValue = useMemo(() => {
    if (isDailyDrilldown && historicData) {
      return historicHourlyData.reduce((sum, h) => sum + (h.production || 0), 0);
    }
    if (historicData) {
      return monthlyStats.production || 0;
    }
    return machine?.productionCount || 0;
  }, [isDailyDrilldown, historicData, historicHourlyData, monthlyStats.production, machine?.productionCount]);

  // ✅ Total rejection value
  const rejectionValue = useMemo(() => {
    if (isDailyDrilldown && historicData) {
      return historicHourlyData.reduce((sum, h) => sum + (h.rejection || 0), 0);
    }
    if (historicData) {
      return monthlyStats.rejection || 0;
    }
    return machine?.rejectionCount || 0;
  }, [isDailyDrilldown, historicData, historicHourlyData, monthlyStats.rejection, machine?.rejectionCount]);

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

  const chartData = historicData
  ? (isDailyDrilldown ? historicHourlyData  : dailyData)
  : hourlyData;

  return (
    <div className="p-t-1 space-y-6">
      {/* 🔷 Top Section - Machine Info */}
      <MachineInfo
        machine={machine || undefined}
        selectedJob={selectedJob}
        setSelectedJob={setSelectedJob}
      />

      {/* 🔷 Bottom Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 🟩 Left Column */}
        <MachineInfoPanel
          machine={machine}
          historicData={historicData}
          monthlyStats={monthlyStats}
          selectedHistoricMonth={selectedHistoricMonth}
          setSelectedHistoricMonth={setSelectedHistoricMonth}
          handleViewHistoricData={handleViewHistoricData}
          onLiveClick={() => {
            setHistoricData(false);
            setIsDailyDrilldown(false);
            setSelectedDate(new Date());
            setMonthlyJobs([]);
            setSelectedHistoricMonth(new Date());
          }}
          selectedJob={selectedJob}
          setSelectedJob={setSelectedJob}
        />

        {/* 🟦 Right Column */}
        <div className="space-y-4 flex-grow">
          {/* Top Charts */}
          <PieCharts
            productionValue={productionValue}
            pieData={pieData}
            rejectionValue={rejectionValue}
            rejectionPieData={rejectionPieData}
            colors={COLORS}
          />

          {/* Bottom - Live Data Bar Chart */}
          <BarChartComponent
            historicData={historicData}
            isDailyDrilldown={isDailyDrilldown}
            selectedDay={selectedDay}
            selectedMonth={selectedMonth}
            monthNames={monthNames}
            monthDate={selectedHistoricMonth}
            historicHourlyData={historicHourlyData}
            dailyData={dailyData}
            chartData={chartData}
            onBarClick={onBarClick}
            setIsDailyDrilldown={setIsDailyDrilldown}
          />
        </div>
      </div>
    </div>
  );
}
