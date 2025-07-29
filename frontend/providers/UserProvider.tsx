import { TasksProvider } from '@/context/taskContext';
import { UserContextProvider } from '@/context/userContext';
import React, { ReactNode } from 'react'

interface Props{
  children: ReactNode;
}

const UserProvider = ({children}: Props) => {
  return (
    <UserContextProvider>
      <TasksProvider>
        {children}
      </TasksProvider>
    </UserContextProvider>
    
  )
}

export default UserProvider