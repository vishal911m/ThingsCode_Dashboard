"use client";

import { useTasks } from '@/context/taskContext';
import useDetectOutside from '@/hooks/useDetectOutside';
import React, { useEffect, useRef } from 'react';

function Modal() {
  const {
    formData,
    handleInput,
    openModalForAddMachine,
    openModalForEditMachine,
    closeModal,
    selectedMachine,
    isModalOpen,
  } = useTasks();

  const ref = useRef(null);

  // Close modal on outside click
  useDetectOutside({
    ref,
    callback: () => {
      closeModal();
    }
  });

  const isEdit = Boolean(selectedMachine);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        isEdit
          ? `https://your-api-url.com/api/machine/${selectedMachine._id}`
          : 'https://your-api-url.com/api/machine',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        closeModal();
      } else {
        console.error('Failed to save machine');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">
          {isEdit ? 'Edit Machine' : 'Add New Machine'}
        </h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="machineName">Machine Name</label>
          <input
            type="text"
            name="machineName"
            id="machineName"
            className="border p-2 rounded-md"
            value={formData.machineName}
            onChange={handleInput}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="machineType">Machine Type</label>
          <input
            type="text"
            name="machineType"
            id="machineType"
            className="border p-2 rounded-md"
            value={formData.machineType}
            onChange={handleInput}
            required
          />
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className={`w-full py-2 rounded-md text-white transition ${
              isEdit ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isEdit ? 'Update Machine' : 'Create Machine'}
          </button>
        </div>

        <button
          type="button"
          onClick={closeModal}
          className="w-full py-2 mt-2 border rounded-md hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default Modal;
