'use client';
import React from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface CustomBarChartProps {
  historicData: boolean;
  isDailyDrilldown: boolean;
  selectedDay: number | null;
  selectedMonth: number | null;
  monthNames: string[];
  monthDate: Date; // equivalent to monthNames[selectedHistoricMonth.getMonth()]
  historicHourlyData: Array<{ production?: number; rejection?: number }>;
  dailyData: any[];
  chartData: any[];
  onBarClick?: (data: any, index: number) => void;
  setIsDailyDrilldown: (value: boolean) => void;
}

export default function BarChartComponent({
  historicData,
  isDailyDrilldown,
  selectedDay,
  selectedMonth,
  monthNames,
  monthDate,
  historicHourlyData,
  dailyData,
  chartData,
  onBarClick,
  setIsDailyDrilldown
}: CustomBarChartProps) {
  return (
    <div className="bg-white p-4 rounded shadow border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">
          {historicData ? (
            isDailyDrilldown && selectedDay !== null && selectedMonth !== null ? (
              `Hourly Data (${selectedDay} ${monthNames[selectedMonth]})`
            ) : (
              `Monthly Summary (${monthNames[monthDate.getMonth()]})`
            )
          ) : (
            'Hourly Data (Live)'
          )}
        </h3>

        {/* ✅ Daily Production & Rejection Count Display */}
        {historicData && isDailyDrilldown && (
          <div className="text-sm font-medium text-gray-700">
            Production:{' '}
            {historicHourlyData.reduce(
              (sum, hour) => sum + (hour.production || 0),
              0
            )}{' '}
            | Rejection:{' '}
            {historicHourlyData.reduce(
              (sum, hour) => sum + (hour.rejection || 0),
              0
            )}
          </div>
        )}

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
            <ReBarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <XAxis
                dataKey={
                  historicData
                    ? isDailyDrilldown
                      ? 'hour'
                      : 'day'
                    : 'hour'
                }
                label={{
                  value: historicData
                    ? isDailyDrilldown
                      ? 'Hour'
                      : 'Day of Month'
                    : 'Hour',
                  position: 'insideBottomRight',
                  offset: -5
                }}
              />
              <YAxis
                label={{
                  value: 'Count',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [`${value}`, name]}
                labelFormatter={(label: number) => {
                  if (historicData && isDailyDrilldown) {
                    const hour = label;
                    const displayHour =
                      hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const period = hour < 12 ? 'AM' : 'PM';
                    return `Time: ${displayHour} ${period}`;
                  } else if (historicData && !isDailyDrilldown) {
                    return `Day: ${label}`;
                  } else {
                    const hour = label;
                    const displayHour =
                      hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const period = hour < 12 ? 'AM' : 'PM';
                    return `Time: ${displayHour} ${period}`;
                  }
                }}
              />
              <Legend />
              <Bar
                dataKey="production"
                stackId="a"
                fill="#3B82F6"
                name="Production Count"
                onClick={
                  historicData && !isDailyDrilldown ? onBarClick : undefined
                }
              />
              <Bar
                dataKey="rejection"
                stackId="a"
                fill="#EF4444"
                name="Rejection Count"
                onClick={
                  historicData && !isDailyDrilldown ? onBarClick : undefined
                }
              />
            </ReBarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
