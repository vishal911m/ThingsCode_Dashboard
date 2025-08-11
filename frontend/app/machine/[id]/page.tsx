'use client';
import BarChartComponent from '@/app/Components/BarChart/BarChart';
import MachineInfo from '@/app/Components/MachineInfo/MachineInfo';
import MachineInfoPanel from '@/app/Components/MachineInfoPanel/MachineInfoPanel';
import PieCharts from '@/app/Components/PieCharts/PieCharts';
import { useTasks } from '@/context/taskContext';

export default function MachinePage() {
  const { setSelectedDate,machine,
    selectedJob, setSelectedJob,
    historicData, setHistoricData,
    monthlyStats, setIsDailyDrilldown,
    selectedHistoricMonth, setSelectedHistoricMonth,
    handleViewHistoricData,
    productionValue, pieData,
    rejectionValue, rejectionPieData,
    chartData, onBarClick, setMonthlyJobs,
    isDailyDrilldown, selectedDay, selectedMonth,
    dailyData, historicHourlyData
   } = useTasks();
  
   const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  // 🎨 Pie chart colors (you can add more if you have more jobs)
  const COLORS = ['#3B82F6', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

  return (
    <div className="p-t-1 space-y-1">
      {/* 🔷 Top Section - Machine Info */}
      <MachineInfo
        machine={machine || undefined}
        selectedJob={selectedJob}
        setSelectedJob={setSelectedJob}
      />

      {/* 🔷 Bottom Section */}
      <div className="flex flex-col lg:flex-row gap-2">
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
