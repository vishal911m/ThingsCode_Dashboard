import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./index";

/*
  Memoized selector for processed machines
  - Calculates production count
  - Calculates rejection count
  - Finds latest job
  - Extracts latest RFID
  - Maps RFID to tool name
  - Gets latest machine status
*/

export const selectProcessedMachines = createSelector(
  [
    (state: RootState) => state.machines.machines,
    (state: RootState) => state.jobs.todayJobs,
  ],
  (machines, todayJobs) => {
    return machines.map((machine: any) => {
      const matchingJobs = todayJobs.filter(
        (job: any) => job.machineId === machine._id
      );

      const productionCount = matchingJobs.reduce(
        (sum: number, job: any) => sum + (job.jobCount || 0),
        0
      );

      const rejectionCount = matchingJobs.reduce(
        (sum: number, job: any) => sum + (job.rejectionCount || 0),
        0
      );

      const latestJob = matchingJobs.reduce(
        (latest: any, current: any) =>
          !latest ||
          new Date(current.createdAt) > new Date(latest.createdAt)
            ? current
            : latest,
        null
      );

      const latestRFID = latestJob?.rfid;
      const latestStatus = latestJob?.status ?? "off";

      let liveToolName = "N/A";

      if (latestRFID && Array.isArray(machine.jobList)) {
        const matched = machine.jobList.find(
          (job: any) => job.uid === latestRFID
        );

        if (matched) {
          liveToolName = matched.jobName || "Unnamed Tool";
        }
      }

      return {
        ...machine,
        productionCount,
        rejectionCount,
        liveToolName,
        latestStatus,
      };
    });
  }
);
