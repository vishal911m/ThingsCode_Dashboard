import { TaskProvider } from '@/context/taskContext';
import { UserProvider } from '@/context/userContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <TaskProvider>{children}</TaskProvider>
    </UserProvider>
  );
}
