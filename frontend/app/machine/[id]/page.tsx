'use client'

import { useParams } from 'next/navigation'
import React from 'react'

export default function MachineDetailPage() {
  const { id } = useParams()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Machine Detail Page</h1>
      <p className="text-lg">You are viewing machine with ID: <strong>{id}</strong></p>
    </div>
  )
}
