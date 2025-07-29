"use client";
import { FaSyncAlt, FaUser, FaInfoCircle, FaCog, FaDesktop, FaSignOutAlt } from "react-icons/fa";
import React from "react";
import moment from "moment";
import { useUserContext } from "@/context/userContext";

function Header() {
  const currentDate = moment().format("DD / MM / YYYY");
  const {logoutUser} = useUserContext();

  // Get current time in 24-hour format
  const currentTime = moment();
  const hour = currentTime.hour();
  const minute = currentTime.minute();

  // Function to determine shift
  const getCurrentShift = () => {
    const totalMinutes = hour * 60 + minute;

    const morningStart = 9 * 60;         // 9:00 AM
    const morningEnd = 18 * 60;          // 6:00 PM
    const nightStart = 18 * 60 + 30;     // 6:30 PM
    const nightEnd = 5 * 60 + 30;        // 5:30 AM (next day)

    if (totalMinutes >= morningStart && totalMinutes < morningEnd) {
      return "Morning Shift Running";
    } else if (
      totalMinutes >= nightStart || totalMinutes < nightEnd
    ) {
      return "Night Shift Running";
    } else {
      return "Factory Closed";
    }
  };

  const shiftLabel = getCurrentShift();
  return (
    <header className="header w-full text-white flex items-center justify-between px-6 py-4 shadow-md bg-[#343A40]">
      {/* 🔵 Left: Brand and Status */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white">ThingsCode</h1>
        <span className="text-white text-md">Overall Status</span>
      </div>

      {/* 🟣 Right: Shift Info, Date, Icons */}
      <div className="flex items-center gap-8">
        {/* Shift and Date */}
        <div className="flex flex-col text-right">
          <span className="text-sm text-green-400 font-semibold">{shiftLabel}</span>
          <span className="text-sm text-gray-300">{currentDate}</span>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 text-lg">
          <button className="p-2 rounded-full hover:bg-gray-700">
            <FaDesktop />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-700">
            <FaCog />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-700">
            <FaInfoCircle />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-700">
            <FaUser />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-700" 
            onClick={logoutUser}
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
