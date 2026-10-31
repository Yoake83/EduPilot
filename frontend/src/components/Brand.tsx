export function Brand({ compact = false, inverse = false, className = '' }: { compact?: boolean; inverse?: boolean; className?: string }) {
 return <span className={`edupilot-brand ${inverse ? 'brand-inverse' : ''} ${className}`} aria-label="EduPilot">
  <svg width="42" height="42" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect width="48" height="48" rx="15" fill={inverse ? '#FFFFFF' : '#315ED8'}/><path d="M10 16.5C15.8 16.5 19.5 18 24 21V36C19.5 33 15.8 31.5 10 31.5V16.5Z" fill={inverse ? '#315ED8' : '#FFFFFF'}/><path d="M26 21L39 11L34 32L26 36V21Z" fill={inverse ? '#315ED8' : '#B9D1FF'}/><path d="M26 21L34 23L39 11L26 21Z" fill={inverse ? '#173775' : '#FFFFFF'}/></svg>
  {!compact && <span className="edupilot-wordmark">edu<span>pilot</span><i /></span>}
 </span>;
}
