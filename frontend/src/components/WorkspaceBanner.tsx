import Link from 'next/link';
export function WorkspaceBanner({ eyebrow, title, description, count, noun, action }: { eyebrow:string; title:string; description:string; count:number; noun:string; action?:{href:string;label:string} }) {
 return <section className="workspace-banner"><div><span className="workspace-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p>{action && <Link className="workspace-text-link" href={action.href}>{action.label} <span aria-hidden="true">↗</span></Link>}</div><div className="workspace-banner-art" aria-hidden="true"><div className="banner-ring"/><span className="banner-star">✳</span><div className="banner-number"><strong>{String(count).padStart(2,'0')}</strong><span>{noun}</span></div><span className="banner-dot"/></div></section>;
}
