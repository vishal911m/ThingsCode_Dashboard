"use client"
import { useUserContext } from '@/context/userContext';
import React, { Children } from 'react'

interface MainContentLayoutProps {
  children: React.ReactNode;
}

function MainContentLayout({children}: MainContentLayoutProps) {
  const userId = useUserContext().user._id;
  return (
    <main className={`MainContentLayout ${userId ? 'pr-[20rem]' : ''} pb-[1.5rem] flex h-full`}>
      {children}
    </main>
  )
}

export default MainContentLayout