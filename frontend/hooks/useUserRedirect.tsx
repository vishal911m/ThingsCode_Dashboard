'use client';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/userContext';

export default function useRedirect(redirect: string) {
  const { user } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!user || !user.email) router.push(redirect);
  }, [user, redirect, router]);
}
