"use client";

import { useTasks } from "@/context/taskContext";
import useDetectOutside from "@/hooks/useDetectOutside";
import React, { useEffect, useRef } from "react";

const DeleteModal = () => {
  const {
    isDeleteModalOpen,
    closeDeleteModal,
    selectedMachine,
    deleteMachine,
  } = useTasks();

  useEffect(()=>{},[]);

  const ref = useRef<HTMLDivElement>(null);

  useDetectOutside({
    ref,
    callback: () => {
      closeDeleteModal();
    },
  });

  const handleDelete = async () => {
    if (selectedMachine?._id) {
      await deleteMachine(selectedMachine._id);
      closeDeleteModal();
    }
  };

  if (!isDeleteModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div
        ref={ref}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg space-y-6"
      >
        <h2 className="text-lg font-semibold text-center text-red-600">
          Are you sure you want to delete this machine?
        </h2>

        <p className="text-center text-gray-600">
          <strong>{selectedMachine?.machineName}</strong> will be permanently
          removed.
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={closeDeleteModal}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
