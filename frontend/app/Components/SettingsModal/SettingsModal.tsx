"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FaCog } from "react-icons/fa";
import { useState } from "react";

export default function SettingsModal() {
  const [refreshInterval, setRefreshInterval] = useState("10s");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 rounded-full hover:bg-gray-700 text-white">
          <FaCog />
        </button>
      </DialogTrigger>

      <DialogContent className="bg-[#1F1F1F] text-white border border-gray-700 max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full mt-4">
          {/* Tabs Header */}
          <TabsList className="grid grid-cols-4 bg-gray-800 text-gray-300 rounded-lg">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span>Auto Refresh Interval</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="bg-gray-800 text-white p-2 rounded-lg"
              >
                <option>5s</option>
                <option>10s</option>
                <option>30s</option>
                <option>60s</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <input type="checkbox" className="h-5 w-5" />
            </div>

            <div className="flex items-center justify-between">
              <span>Compact Dashboard</span>
              <input type="checkbox" className="h-5 w-5" />
            </div>
          </TabsContent>

          {/* DISPLAY TAB */}
          <TabsContent value="display" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span>Show Machine Cards</span>
              <input type="checkbox" className="h-5 w-5" />
            </div>

            <div className="flex items-center justify-between">
              <span>Animations</span>
              <input type="checkbox" className="h-5 w-5" />
            </div>

            <div className="flex items-center justify-between">
              <span>Card Density</span>
              <select className="bg-gray-800 text-white p-2 rounded-lg">
                <option>Normal</option>
                <option>Compact</option>
                <option>Comfortable</option>
              </select>
            </div>
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span>Machine Offline Alerts</span>
              <input type="checkbox" className="h-5 w-5" />
            </div>

            <div className="flex items-center justify-between">
              <span>High Rejection Warning</span>
              <input type="checkbox" className="h-5 w-5" />
            </div>

            <div className="flex items-center justify-between">
              <span>Job Failure Notifications</span>
              <input type="checkbox" className="h-5 w-5" />
            </div>
          </TabsContent>

          {/* SYSTEM TAB */}
          <TabsContent value="system" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span>App Version</span>
              <span className="text-gray-400">1.0.0</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Backend Status</span>
              <span className="text-green-400">Online</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Clear Cache</span>
              <Button className="bg-red-600 hover:bg-red-700">Clear</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
