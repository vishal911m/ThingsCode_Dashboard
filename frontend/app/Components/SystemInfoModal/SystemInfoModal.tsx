"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { useUserContext } from "@/context/userContext";

export default function SystemInfoModal() {
  const [open, setOpen] = useState(false);
  const { user } = useUserContext();

  const handleOpen = () => {
    if (!user) {
      toast.error("Please login to view system info");
      return;
    }
    setOpen(true);
  };

  // Fetch system & browser info
  const browser = typeof window !== "undefined" ? navigator.userAgent : "Unknown";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={handleOpen}
          className="p-2 rounded-full hover:bg-gray-700"
        >
          <FaInfoCircle className="text-lg" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">System Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* About App */}
          <section>
            <h2 className="font-semibold text-[#343A40]">About ThingsCode</h2>
            <p className="text-gray-400">
              ThingsCode is a real-time production monitoring system built using
              Next.js, Node.js, MongoDB, and WebSockets. It helps industries 
              track machine data, production counts, and job activity efficiently.
            </p>
          </section>

          {/* Version */}
          <section>
            <h2 className="font-semibold text-[#343A40]">App Version</h2>
            <p className="text-gray-400">Frontend: v0.1.0</p>
            <p className="text-gray-400">Next.js version: 15.4.3</p>
            <p className="text-gray-400">React version: 19.1.0</p>
          </section>

          {/* System Details */}
          <section>
            <h2 className="font-semibold text-[#343A40]">Device & Browser</h2>
            <p className="text-gray-400 break-all">{browser}</p>
          </section>

          {/* API Info */}
          <section>
            <h2 className="font-semibold text-[#343A40]">Backend API</h2>
            <p className="text-gray-400">Connected: Yes (Render Deployment)</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
