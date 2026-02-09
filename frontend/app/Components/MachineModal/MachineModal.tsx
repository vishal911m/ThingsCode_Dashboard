"use client";
import Modal from "@/components/ui/Modal";
import { useTasks } from "@/context/taskContext";
import { useUserContext } from "@/context/userContext";
import React, { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

// ----------------------
// Type Definitions
// ----------------------
interface JobItem {
  jobName: string;
  uid: string;
}

// ----------------------
// Sleep helper (200ms animation)
// ----------------------
const sleep = (s: number) =>
  new Promise(resolve => setTimeout(resolve, s * 1000));

const MachineModal =  ()=>{
  const { 
    createMachine, 
    isEditing, 
    closeModal,
    modalMode,
    activeMachine,
    updateMachine
  } = useTasks();
  const { user } = useUserContext();

  const open = modalMode === "add" || modalMode === "edit";

  const [machineName, setMachineName] = useState<string>("");
  const [machineType, setMachineType] = useState<string>("");
  const [jobList, setJobList] = useState<JobItem[]>(
    Array(5).fill(0).map(()=>({jobName: "", uid: ""}))
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null); // This tells react: “Right now, this ref points to nothing. After the component mounts, please attach the actual DOM element here.”

  // ----------------------
  // Sync modalMode → isOpen
  // ----------------------
  useEffect(() => {
    const shouldOpen = modalMode === "add" || modalMode === "edit";
    setIsOpen(shouldOpen);
  }, [modalMode]);
  
  useEffect(() => {
    if (modalMode === "edit" && activeMachine) {
      setMachineName(activeMachine.machineName || "");
      setMachineType(activeMachine.machineType || "");
      setJobList(activeMachine.jobList || [{ jobName: "", uid: "" }]);
    }

    if (modalMode === "add") {
      setMachineName("");
      setMachineType("");
      setJobList(Array(5).fill(0).map(() => ({ jobName: "", uid: "" })));
    }
  }, [modalMode, activeMachine]);

  // ----------------------
  // Close with animation
  // ----------------------
  const handleClose = async () => {
    setIsOpen(false);      // 1️⃣ start exit animation
    await sleep(0.2);     // 2️⃣ wait for CSS animation
    closeModal();         // 3️⃣ unmount & cleanup
  };

  // -------------------------------
  // 1️⃣ CURRIED HANDLER FOR SIMPLE INPUTS
  // -------------------------------
  const handleSimpleInput = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => { //React.Dispatch<T> --- Dispatch means: "a function that accepts a value of type T"
    setter(e.target.value);
  };

  // -------------------------------
  // 2️⃣ CURRIED HANDLER FOR JOB LIST INPUTS
  // -------------------------------
  const handleJobInput = (index: number, field: keyof JobItem) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newJobs = jobList.map(job => ({ ...job })); // deep clone each job object
    newJobs[index][field] = e.target.value;
    setJobList(newJobs);
  };

  // -------------------------------
  // Add new job row
  // -------------------------------
  const addJobRow = () => {
    setJobList([...jobList, { jobName: "", uid: "" }]);
  };

  // -------------------------------
  // Submit handler
  // -------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!machineName || !machineType) {
      alert("Please fill machine name and type");
      return;
    }

    const payload = {
      machineName,
      machineType,
      jobList: jobList.filter(job => job.jobName && job.uid) //Filter out empty joblist field before pushing the data
    };

    let success = false;
    if (modalMode === "edit") {
      success = await updateMachine(activeMachine._id, payload);
    } else {
      success = await createMachine(payload);
    }

    if (success){
      handleClose(); // 🔥 animated close
    } 
  };

  return (
    <Modal open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <form 
        ref={formRef} 
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 space-y-4" 
      >
        <Dialog.Title className="text-xl font-semibold text-center">
          {modalMode === "edit" ? "Update Machine" : "Create Machine"}
        </Dialog.Title>

        <div>
          {/* Machine Name */}
          <label className="block text-sm font-medium">Machine Name</label>
          <input
            type="text"
            placeholder="Enter Machine Name"
            value={machineName}
            onChange={handleSimpleInput(setMachineName)}
            className="w-full p-2 mt-1 border rounded bg-gray-50"
          />
        </div>

        <div>
          {/* Machine Type */}
          <label className="block text-sm font-medium">Machine Type/Description</label>
          <input
            type="text"
            placeholder="Machine Type"
            value={machineType}
            onChange={handleSimpleInput(setMachineType)}
            className="w-full p-2 mt-1 border rounded bg-gray-50"
          />
        </div>

        {/* Job List */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Job List</label>

          {jobList.map((job, index) => (
            <div key={index} className="flex gap-2 mb-1">
              <input
                type="text"
                placeholder="Job Name"
                value={job.jobName}
                onChange={handleJobInput(index, "jobName")}
                className="flex-1 p-1 border rounded bg-gray-50"
              />

              <input
                type="text"
                placeholder="UID"
                value={job.uid}
                onChange={handleJobInput(index, "uid")}
                className="flex-1 p-1 border rounded bg-gray-50"
              />
            </div>
          ))}

          {/* <button
            onClick={addJobRow}
            className="text-blue-600 mt-2 underline"
          >
            + Add Another Job
          </button> */}
          <button
            type="button"
            onClick={addJobRow}
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
      </Modal>
    // </div>
  );
};

export default MachineModal;