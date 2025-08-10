'use client';
import React from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer
} from 'recharts';

interface PieChartsProps {
  productionValue: number;
  pieData: Array<{ name: string; value: number }>;
  rejectionValue: number;
  rejectionPieData: Array<{ name: string; value: number }>;
  colors: string[];
}

export default function PieCharts({
  productionValue,
  pieData,
  rejectionValue,
  rejectionPieData,
  colors
}: PieChartsProps) {
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
              No production data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={false}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
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
              No rejection data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={rejectionPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={false}
                >
                  {rejectionPieData.map((_, index) => (
                    <Cell
                      key={`cell-reject-${index}`}
                      fill={colors[index % colors.length]}
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
