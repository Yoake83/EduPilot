import Link from 'next/link';
import { Brand } from './Brand';
import './auth.css';
export function AuthShell({ children, mode }: { children: React.ReactNode; mode: 'login' | 'register' }) {
 return <div className="auth-experience">
  <section className="auth-story" aria-label="Welcome to EduPilot">
   <Link href="/login" className="auth-brand-link"><Brand inverse /></Link>
   <div className="auth-story-copy"><span className="auth-kicker"><i/> A LITTLE CURIOSITY. LIMITLESS POSSIBILITY.</span><h1>Great minds.<br/>Beautiful <em>possibilities.</em></h1><p>A calmer place to teach, a brighter way to learn.<br/>Let your next chapter take flight.</p></div>
   <div className="learning-scene" aria-hidden="true">
    <div className="scene-orbit orbit-a"/><div className="scene-orbit orbit-b"/>
    <div className="scene-spark spark-one">✳</div><div className="scene-spark spark-two">✦</div>
    <div className="scene-note"><span className="note-icon">↗</span><span>A new perspective<small>starts with a question.</small></span></div>
    <div className="scene-book"><div className="book-spine"/><div className="book-cover"><span>THE ART OF</span><strong>Thinking<br/><em>bigger.</em></strong><div className="book-flower">✳</div><small>YOUR NEXT CHAPTER</small></div></div>
    <div className="scene-chip"><span>✦</span> Made for curious minds</div>
    <svg className="scene-flight" viewBox="0 0 260 160"><path d="M8 140C80 160 36 30 115 57S161 128 216 33" fill="none" stroke="#AEC4FA" strokeWidth="1.5" strokeDasharray="5 7"/><path d="M209 29L244 12L230 49L225 33L209 29Z" fill="#D6E4FF"/></svg>
   </div>
   <div className="auth-story-footer"><span>Built around your potential.</span><span>LEARN. CREATE. SOAR. ↗</span></div>
  </section>
  <section className="auth-form-side"><div className="auth-topline"><span>{mode === 'login' ? 'New to EduPilot?' : 'Already a member?'}</span><Link href={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Get started' : 'Sign in'} <span>↗</span></Link></div>
   <div className="auth-form-content"><div className="mobile-auth-brand"><Brand /></div>{children}</div>
   <footer className="auth-form-footer"><span>© {new Date().getFullYear()} EduPilot</span><span>A space to grow, together.</span></footer>
  </section>
 </div>;
}
