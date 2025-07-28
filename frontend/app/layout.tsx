import './globals.css'
import { TaskProvider } from '@/context/taskContext'
import Header from './Components/Header/Header'
import UserProvider from '@/providers/UserProvider'
import { Toaster } from 'react-hot-toast'

export const metadata = { title: 'ThingsCode', description: 'Machine‑job dashboard' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 flex flex-col min-h-screen">
        <UserProvider>
          <Toaster position="top-center" />
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
        </UserProvider>
      </body>
    </html>
  )
}
