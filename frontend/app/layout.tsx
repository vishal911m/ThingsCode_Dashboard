import './globals.css'
import Header from './Components/Header/Header'
import UserProvider from '@/providers/UserProvider'
import { Toaster } from 'react-hot-toast'
import MainContentLayout from '@/providers/MainContentLayout'
import MainLayout from '@/providers/MainLayout'
import ReduxProvider from './providers/ReduxProvider'

export const metadata = { title: 'ThingsCode', description: 'Machine‑job dashboard' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 flex flex-col min-h-screen">
        <ReduxProvider>
          <UserProvider>
          <Toaster position="top-center" />
          <div className="h-full flex overflow-hidden">
            <div className="layout flex-1 flex flex-col">
              <Header />
              <MainContentLayout>
                <MainLayout>{children}</MainLayout>
              </MainContentLayout>
            {/* <main className="flex flex-1 flex-col">{children}</main> */}
            </div>
          </div>
          </UserProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
