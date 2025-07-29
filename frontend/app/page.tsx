"use client"
import useRedirect from "@/hooks/useUserRedirect";
import Image from "next/image";

// app/page.tsx
export default function HomePage() {
  useRedirect("/login");
  return <div className="p-6 text-center text-xl">Welcome to the ThingsCode Dashboard</div>;
}
