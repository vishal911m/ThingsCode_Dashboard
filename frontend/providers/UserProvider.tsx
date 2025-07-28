import { TaskProvider } from '@/context/taskContext';
import { UserContextProvider } from '@/context/userContext';
import React, { ReactNode } from 'react'

interface Props{
  children: ReactNode;
}

const UserProvider = ({children}: Props) => {
  return (
    <UserContextProvider>
      <TaskProvider>
        {children}
      </TaskProvider>
    </UserContextProvider>
    
  )
}

export default UserProvider