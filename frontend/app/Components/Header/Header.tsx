"use client";
import { FaSyncAlt, FaUser, FaInfoCircle, FaCog, FaDesktop } from "react-icons/fa";
import React from "react";

function Header() {
  return (
    <header className="header w-full bg-gray-800 text-white flex items-center justify-between px-6 py-4 shadow-md">
      {/* 🔵 Left: Brand and Status */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Weldtech</h1>
        <span className="text-gray-300 text-md">Overall Status</span>
      </div>

      {/* 🟣 Right: Shift Info, Date, Icons */}
      <div className="flex items-center gap-8">
        {/* Shift and Date */}
        <div className="flex flex-col text-right">
          <span className="text-sm text-green-400 font-semibold">Shift 1 Running</span>
          <span className="text-sm text-gray-300">23 / 6 / 2021</span>
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
          <button className="p-2 rounded-full hover:bg-gray-700">
            <FaSyncAlt />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
