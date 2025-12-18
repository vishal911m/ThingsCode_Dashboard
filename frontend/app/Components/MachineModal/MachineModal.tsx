"use client";
import { useTasks } from "@/context/taskContext";
import { useUserContext } from "@/context/userContext";
import useDetectOutside from "@/hooks/useDetectOutside";
import React, { useEffect, useRef, useState } from "react";


// ----------------------
// Type Definitions
// ----------------------
interface JobItem {
  jobName: string;
  uid: string;
}

interface AddMachineModalProps {
  setShowModal: (v: boolean) => void;
}

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

  const [machineName, setMachineName] = useState<string>("");
  const [machineType, setMachineType] = useState<string>("");
  const [jobList, setJobList] = useState<JobItem[]>(
    Array(5).fill(0).map(()=>({jobName: "", uid: ""}))
  );

  const ref = useRef(null); // This tells react: “Right now, this ref points to nothing. After the component mounts, please attach the actual DOM element here.”

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

    if (success) closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form 
        ref={ref} 
        className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold text-center">
          {modalMode === "edit" ? "Update Machine" : "Create Machine"}
        </h2>

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
    </div>
  );
};

export default MachineModal;


// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import useDetectOutside from "@/hooks/useDetectOutside";
// import { useTasks } from "@/context/taskContext";

// function MachineModal() {
//   const {
//     isEditing,
//     closeModal,
//     modalMode,
//     activeMachine,
//     createMachine,
//     updateMachine,
//   } = useTasks();

//   const [machineName, setMachineName] = useState("");
//   const [machineType, setMachineType] = useState("");
//   const [jobList, setJobList] = useState(
//   Array(5).fill(0).map(() => ({ jobName: "", uid: "" }))
// );

//   const ref = useRef(null);

//   // Close modal when clicking outside
//   useDetectOutside({
//     ref,
//     callback: () => {
//       if (isEditing) closeModal();
//     },
//   });

//   useEffect(() => {
//     if (modalMode === "edit" && activeMachine) {
//       setMachineName(activeMachine.machineName || "");
//       setMachineType(activeMachine.machineType || "");
//       setJobList(activeMachine.jobList || [{ jobName: "", uid: "" }]);
//     }
//   }, [modalMode, activeMachine]);

//   const handleJobChange = (index: number, field: "jobName" | "uid", value: string) => {
//     const newJobs = [...jobList];
//     newJobs[index][field] = value;
//     setJobList(newJobs);
//   };

//   const addJobField = () => {
//     setJobList([...jobList, { jobName: "", uid: "" }]);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const machineData = {
//       machineName,
//       machineType,
//       jobList: jobList.filter(job => job.jobName && job.uid),
//     };

//     let success = false;
//     if (modalMode === "edit") {
//       success = await updateMachine(activeMachine._id, machineData);
//     } else {
//       success = await createMachine(machineData);
//     }

//     if (success) closeModal();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
//       <form
//         ref={ref}
//         onSubmit={handleSubmit}
//         className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg space-y-4"
//       >
//         <h2 className="text-xl font-semibold text-center">
//           {modalMode === "edit" ? "Update Machine" : "Create Machine"}
//         </h2>

//         <div>
//           <label className="block text-sm font-medium">Machine Name</label>
//           <input
//             type="text"
//             value={machineName}
//             onChange={(e) => setMachineName(e.target.value)}
//             className="w-full p-2 mt-1 border rounded bg-gray-50"
//             placeholder="Enter machine name"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Machine Type/Description</label>
//           <input
//             type="text"
//             value={machineType}
//             onChange={(e) => setMachineType(e.target.value)}
//             className="w-full p-2 mt-1 border rounded bg-gray-50"
//             placeholder="Enter description"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Job List</label>
//           {jobList.map((job, index) => (
//             <div key={index} className="flex gap-2 mb-2">
//               <input
//                 type="text"
//                 value={job.jobName}
//                 onChange={(e) => handleJobChange(index, "jobName", e.target.value)}
//                 placeholder="Job Name"
//                 className="flex-1 p-2 border rounded bg-gray-50"
//               />
//               <input
//                 type="text"
//                 value={job.uid}
//                 onChange={(e) => handleJobChange(index, "uid", e.target.value)}
//                 placeholder="UID"
//                 className="flex-1 p-2 border rounded bg-gray-50"
//               />
//             </div>
//           ))}
//           <button
//             type="button"
//             onClick={addJobField}
//             className="text-blue-600 text-sm hover:underline mt-1"
//           >
//             + Add More Jobs
//           </button>
//         </div>

//         <button
//           type="submit"
//           className={`w-full py-2 text-white rounded ${
//             modalMode === "edit" ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
//           }`}
//         >
//           {modalMode === "edit" ? "Update Machine" : "Create Machine"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default MachineModal;
