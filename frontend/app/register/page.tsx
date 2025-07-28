'use client'
import { useState } from 'react'
import { useUserContext } from '@/context/userContext'

export default function RegisterPage() {
  const { register } = useUserContext()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="flex items-center justify-center flex-1">
      <form
        onSubmit={(e) => { e.preventDefault(); register(name, email, password) }}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6">Register</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring"
        />
        <button type="submit" className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  )
}
