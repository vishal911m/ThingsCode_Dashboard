'use client'

import { useEffect } from 'react'
import { useTask } from '@/context/taskContext'
import Modal from '../Components/Modal/Modal'
import DeleteModal from '../Components/DeleteModal/DeleteModal'

export default function MachinePage() {
  const {
    machines,
    getTasks,
    openModalForAddMachine,
    openModalForEditMachine,
    openDeleteModal,
    isModalOpen,
    isDeleteModalOpen,
  } = useTask()

  useEffect(() => {
    getTasks()
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Machines</h1>
        <button
          onClick={openModalForAddMachine}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Machine
        </button>
      </div>

      {machines.length === 0 ? (
        <p className="text-gray-600">No machines found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {machines.map((machine : any) => (
            <div
              key={machine._id}
              className="bg-white shadow-md rounded-lg p-4 space-y-2 border"
            >
              <h2 className="text-xl font-semibold">
                {machine.machineName}
              </h2>
              <p className="text-gray-700">
                Type: {machine.machineType}
              </p>
              <div className="flex justify-between mt-3">
                <button
                  onClick={() => openModalForEditMachine(machine)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(machine)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && <Modal />}
      {isDeleteModalOpen && <DeleteModal />}
    </div>
  )
}
