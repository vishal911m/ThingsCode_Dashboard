'use client';
import { useTasks } from '@/context/taskContext';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer
} from 'recharts';

// Define the type for each slice of the chart
interface ChartData {
  name: string;
  value: number;
}

export default function PieCharts() {
  const {
    productionValue,
    pieData,
    rejectionValue,
    rejectionPieData
  } = useTasks();

  const COLORS = ['#3B82F6', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Production Chart */}
      <div className="bg-white p-4 rounded shadow border">
        <h3 className="text-xl font-semibold mb-2">
          Production Chart: {productionValue}
        </h3>
        <div className="h-40">
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              N/A
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((_: ChartData, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ReTooltip />
              </RePieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Rejection Chart */}
      <div className="bg-white p-4 rounded shadow border">
        <h3 className="text-xl font-semibold mb-2">
          Rejection Chart: {rejectionValue}
        </h3>
        <div className="h-40">
          {rejectionPieData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              N/A
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={rejectionPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {rejectionPieData.map((_: ChartData, index: number) => (
                    <Cell
                      key={`cell-reject-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ReTooltip />
              </RePieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
