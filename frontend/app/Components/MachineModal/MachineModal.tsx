"use client";

import React, { useEffect, useRef, useState } from "react";
import useDetectOutside from "@/hooks/useDetectOutside";
import { useTasks } from "@/context/taskContext";

function MachineModal() {
  const {
    isEditing,
    closeModal,
    modalMode,
    activeMachine,
    createMachine,
    updateJob,
  } = useTasks();

  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [jobList, setJobList] = useState(
    Array(5).fill({ jobName: "", uid: "" })
  );

  const ref = useRef(null);

  // Close modal when clicking outside
  useDetectOutside({
    ref,
    callback: () => {
      if (isEditing) closeModal();
    },
  });

  useEffect(() => {
    if (modalMode === "edit" && activeMachine) {
      setMachineName(activeMachine.machineName || "");
      setMachineType(activeMachine.machineType || "");
      setJobList(activeMachine.jobList || [{ jobName: "", uid: "" }]);
    }
  }, [modalMode, activeMachine]);

  const handleJobChange = (index: number, field: "jobName" | "uid", value: string) => {
    const newJobs = [...jobList];
    newJobs[index][field] = value;
    setJobList(newJobs);
  };

  const addJobField = () => {
    setJobList([...jobList, { jobName: "", uid: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const jobMapArray = jobList
      .filter(job => job.jobName && job.uid)
      .map(job => new Map([[job.jobName, job.uid]]));

    const machineData = {
      machineName,
      machineType,
      jobList: jobMapArray,
    };

    let success = false;
    if (modalMode === "edit") {
      success = await updateJob(activeMachine._id, machineData);
    } else {
      success = await createMachine(machineData);
    }

    if (success) closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">
          {modalMode === "edit" ? "Update Machine" : "Create Machine"}
        </h2>

        <div>
          <label className="block text-sm font-medium">Machine Name</label>
          <input
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className="w-full p-2 mt-1 border rounded bg-gray-50"
            placeholder="Enter machine name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Machine Type/Description</label>
          <input
            type="text"
            value={machineType}
            onChange={(e) => setMachineType(e.target.value)}
            className="w-full p-2 mt-1 border rounded bg-gray-50"
            placeholder="Enter description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Job List</label>
          {jobList.map((job, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={job.jobName}
                onChange={(e) => handleJobChange(index, "jobName", e.target.value)}
                placeholder="Job Name"
                className="flex-1 p-2 border rounded bg-gray-50"
              />
              <input
                type="text"
                value={job.uid}
                onChange={(e) => handleJobChange(index, "uid", e.target.value)}
                placeholder="UID"
                className="flex-1 p-2 border rounded bg-gray-50"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addJobField}
            className="text-blue-600 text-sm hover:underline mt-1"
          >
            + Add More Jobs
          </button>
        </div>

        <button
          type="submit"
          className={`w-full py-2 text-white rounded ${
            modalMode === "edit" ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {modalMode === "edit" ? "Update Machine" : "Create Machine"}
        </button>
      </form>
    </div>
  );
}

export default MachineModal;
