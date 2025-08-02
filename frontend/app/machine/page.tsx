'use client'

import React, { useState } from 'react'

export default function MachinePage() {
  const jobList = ["Job #1 - Running", "Job #2 - Completed", "Job #3 - Queued"];
  const [selectedJob, setSelectedJob] = useState("Job #1")

  return (
    <div className="p-t-1 space-y-6">

      {/* 🔷 Top Section - Machine Info */}
      <div className="bg-white shadow rounded p-1 border space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">

          {/* Machine Name - Left */}
          <h1 className="text-2xl font-bold text-left w-full md:w-1/3">Machine: ABC-123</h1>

          {/* Status - Center */}
          <div className="text-center w-full md:w-1/3">
            <span className="text-lg font-medium">Status: </span>
            <span className="font-semibold text-green-600">On</span>
          </div>

          {/* Job Selector - Right */}
          <div className="w-full md:w-1/3 flex justify-end">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm"
            >
              {jobList.map((job, index) => (
                <option key={index} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job List */}
        
      </div>

      {/* 🔷 Bottom Section */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* 🟩 Left Column */}
        <div className="space-y-4 w-full lg:w-[300px] flex-shrink-0">

          {/* Row 1 - Component Count */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="text-xl font-semibold mb-2">Component Count</h3>
            <h1 className="text-base">Total Count: 1234</h1>
            <h1 className="text-base">Rejection Count: 12</h1>
          </div>

          {/* Row 2 - Historic Data */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="text-xl font-semibold mb-2">Historic Data</h3>
            {/* Month and Year Input */}
            <h1 className="text-base">
              Month:&nbsp;
              <input
                type="month"
                className="border rounded px-2 py-1 text-sm"
                value={new Date().toISOString().slice(0, 7)} // Default: current YYYY-MM
                onChange={() => {}} // You can hook this up later
              />
            </h1>
                      
            {/* Total Count */}
            <h1 className="text-base">Total Count: 12345</h1>
                      
            {/* Rejection Count */}
            <h1 className="text-base">Rejection Count: 123</h1>
          </div>

          {/* Row 3 - Live Tool Data */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="text-xl font-semibold mb-2">Live Tool Data</h3>
            <p className="text-gray-600">Tool RPM, temperature, and status</p>
          </div>
        </div>

        {/* 🟦 Right Column */}
        <div className="space-y-4 flex-grow">

          {/* Top - Production Chart + Machine Chart */}
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
            <h3 className="text-xl font-semibold mb-2">Live Data (Bar Chart)</h3>
            <div className="h-48 bg-gray-100 rounded">[Bar Chart Placeholder]</div>
          </div>
        </div>
      </div>
    </div>
  )
}
