import Link from 'next/link';
import { Brand } from './Brand';
import './auth.css';
export function AuthShell({ children, mode }: { children: React.ReactNode; mode: 'login' | 'register' }) {
 return <div className="auth-experience">
  <section className="auth-story" aria-label="Welcome to EduPilot">
   <Link href="/login" className="auth-brand-link"><Brand /></Link>
   <div className="auth-story-copy"><span className="auth-kicker"><i/> YOUR POTENTIAL, READY FOR TAKEOFF</span><h1>A brighter way<br/>to learn.<br/><em>A little more you.</em></h1><p>Bring your curiosity. Build your next big idea.<br/>One thoughtful space for learning and teaching.</p></div>
   <div className="auth-benefits">
    <div className="auth-benefit"><span className="benefit-icon">✦</span><div><strong>A little help. A big head start.</strong><p>AI tools for lessons, quizzes, and your next question.</p></div></div>
    <div className="auth-benefit"><span className="benefit-icon">◫</span><div><strong>Your classroom, connected.</strong><p>Classes, assignments, and conversations in one place.</p></div></div>
    <div className="auth-benefit"><span className="benefit-icon">↗</span><div><strong>See how far you can go.</strong><p>Thoughtful insights to keep your learning moving.</p></div></div>
   </div>
   <div className="auth-purpose"><span>✳</span><div><strong>Made for curious minds.</strong><p>You bring the spark. We help it take flight.</p></div></div>
   <div className="auth-story-footer"><span>Built around your potential.</span><span>LEARN. CREATE. SOAR. ↗</span></div>
  </section>
  <section className="auth-form-side"><div className="auth-topline"><span>{mode === 'login' ? 'New to EduPilot?' : 'Already a member?'}</span><Link href={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Get started' : 'Sign in'} <span>↗</span></Link></div>
   <div className="auth-form-content"><span className="auth-portal"><i/> YOUR EDUPILOT WORKSPACE</span><div className="mobile-auth-brand"><Brand /></div>{children}</div>
   <footer className="auth-form-footer"><span>© {new Date().getFullYear()} EduPilot</span><span>A space to grow, together.</span></footer>
  </section>
 </div>;
}
