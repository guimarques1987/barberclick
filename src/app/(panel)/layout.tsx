import Providers from '@/components/Providers';
import Sidebar from '@/components/layout/Sidebar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <Providers>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {children}
        </div>
      </div>
    </Providers>
  );
}
