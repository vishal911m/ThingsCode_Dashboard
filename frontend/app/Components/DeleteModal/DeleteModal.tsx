"use client";

import useDetectOutside from "@/hooks/useDetectOutside";
import { RootState } from "@/store";
import { deleteMachine } from "@/store/machinesSlice";
import { closeDeleteModal, closeModal } from "@/store/uiSlice";
import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const DeleteModal = () => {

  const dispatch = useAppDispatch();

  const showDeleteModal = useAppSelector(
    (state: RootState) => state.ui.showDeleteModal
  );

  const machineToDelete = useAppSelector(
    (state: RootState) => state.ui.activeMachine
  );

  const ref = useRef<HTMLDivElement>(null);

  useDetectOutside({
    ref,
    callback: () => {
      dispatch(closeDeleteModal());
    },
  });

  const handleDelete = async () => {
    if (machineToDelete?._id) {
      await dispatch(deleteMachine(machineToDelete._id));
      dispatch(closeDeleteModal());
    }
  };

  if (!showDeleteModal) return null;

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
          <strong>{machineToDelete?.machineName}</strong> will be permanently
          removed.
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => dispatch(closeDeleteModal())}
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
