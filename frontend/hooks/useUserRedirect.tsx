'use client';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/userContext';

export default function useUserRedirect() {
  const { user } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);
}
