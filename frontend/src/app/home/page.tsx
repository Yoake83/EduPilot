'use client';

import { useAuth } from '@/hooks/useAuth';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F0E8' }}>
        <div style={{ width: 28, height: 28, border: '3px solid #F2B759', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (user.role === 'student') return <StudentDashboard />;
  return <TeacherDashboard />;
}