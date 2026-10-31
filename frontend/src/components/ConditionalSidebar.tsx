'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
export function ConditionalSidebar() {
 const pathname = usePathname();
 const [open, setOpen] = useState(false);
 const trigger = useRef<HTMLButtonElement>(null);
 const dialog = useRef<HTMLDialogElement>(null);
 useEffect(() => { setOpen(false); }, [pathname]);
 useEffect(() => {
  if (open) dialog.current?.showModal(); else dialog.current?.close();
 }, [open]);
 if (['/login', '/register'].some(route => pathname.startsWith(route))) return null;
 return <><div className="desktop-navigation"><Sidebar/></div>
 <button ref={trigger} className="mobile-menu-button icon-button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg></button>
 <dialog ref={dialog} className="mobile-navigation" onCancel={() => setOpen(false)} onClose={() => { setOpen(false); trigger.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }} aria-label="Navigation"><button className="drawer-close icon-button" aria-label="Close navigation" onClick={() => setOpen(false)}>×</button><Sidebar/></dialog></>;
}
