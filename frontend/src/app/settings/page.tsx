const sections = [
  {
    title: 'Profile',
    items: [
      { label: 'School Name', value: 'Delhi Public School', type: 'text' },
      { label: 'Location', value: 'Bokaro Steel City', type: 'text' },
      { label: 'Email', value: 'admin@dps-bokaro.edu.in', type: 'email' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { label: 'Default Language', value: 'English', type: 'select' },
      { label: 'Default Question Count', value: '10', type: 'number' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { label: 'Email Notifications', value: 'Enabled', type: 'toggle' },
      { label: 'Assignment Reminders', value: 'Enabled', type: 'toggle' },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '16px 24px' }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>Manage your account and preferences</p>
      </div>

      <div style={{ flex: 1, overflow: 'auto', background: '#F2F2F2', padding: 24 }}>
        <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((section) => (
            <div key={section.title} style={{ background: '#fff', borderRadius: 14, border: '1px solid #EBEBEB', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6' }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>{section.title}</h2>
              </div>
              {section.items.map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: i < section.items.length - 1 ? '1px solid #F9FAFB' : 'none',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
                  {item.type === 'toggle' ? (
                    <div style={{ width: 40, height: 22, background: '#22C55E', borderRadius: 999, position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, right: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}/>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: '#9CA3AF' }}>{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          ))}

          <button style={{ padding: '11px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}