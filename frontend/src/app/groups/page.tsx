export default function GroupsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '16px 24px' }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>My Groups</h1>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>Manage your student groups and classes</p>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F2F2', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 48 }}>👥</span>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>No groups yet</p>
        <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Create groups to organize your students</p>
        <button style={{ marginTop: 8, padding: '10px 22px', background: '#111', color: '#fff', border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Create Group
        </button>
      </div>
    </div>
  );
}