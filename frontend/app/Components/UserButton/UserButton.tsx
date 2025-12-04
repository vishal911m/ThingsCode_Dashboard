"use client";

import { useState, useRef, useEffect } from "react";
import { useUserContext } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";

export default function UserButton() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const { user, logoutUser } = useUserContext();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Circle */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-gray-700 transition"
      >
        <FaUser />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white text-[#343A40] border shadow-lg rounded-xl p-2 z-50">
          <div className="px-3 py-2 border-b">
            <p className="text-sm font-medium">{user?.name || "User"}</p>
            <p className="text-xs text-gray-600">{user?.email || ""}</p>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              router.push("/dashboard");
            }}
            className="block w-full text-left text-[#343A40] px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Profile
          </button>

          <button
            onClick={() => {
              setOpen(false);
              router.push("/dashboard");
            }}
            className="block w-full text-left text-[#343A40] px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Settings
          </button>

          <button
            onClick={async () => {
              setOpen(false);
              await logoutUser(); // context handles redirect
            }}
            className="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
