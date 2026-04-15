'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const MASTER_EMAIL = 'gardaszconsultoria@gmail.com'
const ADMIN_EMAILS = [MASTER_EMAIL, 'murilodesaferreira@gmail.com']

interface NavItem {
  id: string
  href: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const iconProps = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const NAV_ITEMS: NavItem[] = [
  { id: 'painel', href: '/painel', label: 'Painel', icon: <svg {...iconProps}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg> },
  { id: 'gerar', href: '/gerar', label: 'Gerar Documento', icon: <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M12 12v6"/><path d="M9 15h6"/></svg> },
  { id: 'chat', href: '/chat', label: 'Consulta Juridica', icon: <svg {...iconProps}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id: 'analisar', href: '/analisar', label: 'Analise de Risco', icon: <svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg> },
  { id: 'modelos', href: '/modelos', label: 'Meus Modelos', icon: <svg {...iconProps}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { id: 'admin', href: '/admin', label: 'Admin', icon: <svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, adminOnly: true },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('cai_user') : null
    if (userStr) { try { setUser(JSON.parse(userStr)) } catch {} }
  }, [])

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email)
  const isMaster = user?.email === MASTER_EMAIL

  const logout = () => {
    localStorage.removeItem('cai_token')
    localStorage.removeItem('cai_user')
    router.push('/')
  }

  const filteredNav = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)
  const activeId = NAV_ITEMS.find(n => pathname.startsWith(n.href))?.id || 'painel'

  return (
    <div className="app-shell">
      <style>{`
        .app-shell { display: flex; min-height: 100vh; }

        /* Sidebar desktop */
        .app-sidebar {
          width: 240px; flex-shrink: 0; position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
          background: rgba(9,9,15,0.88); backdrop-filter: blur(24px) saturate(140%);
          border-right: 1px solid var(--border); display: flex; flex-direction: column;
          transition: width 0.25s ease;
        }
        .app-sidebar .logo {
          height: 64px; display: flex; align-items: center; gap: 10px; padding: 0 20px;
          border-bottom: 1px solid var(--border);
        }
        .app-sidebar .logo-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700; color: #fff;
        }
        .app-sidebar .logo-text {
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px;
          color: var(--text); white-space: nowrap;
        }
        .app-sidebar nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .app-sidebar .nav-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px;
          font-size: 14px; color: var(--text2); transition: all 0.2s; text-decoration: none; position: relative;
        }
        .app-sidebar .nav-item:hover { background: rgba(59,130,246,0.06); color: var(--text); }
        .app-sidebar .nav-item.active {
          background: rgba(59,130,246,0.1); color: var(--text);
        }
        .app-sidebar .nav-item.active::before {
          content: ''; position: absolute; left: 0; top: 6px; bottom: 6px; width: 3px;
          border-radius: 0 3px 3px 0; background: linear-gradient(180deg, var(--blue), var(--cyan));
        }
        .app-sidebar .nav-item svg { flex-shrink: 0; }
        .app-sidebar .nav-label { white-space: nowrap; }
        .app-sidebar .sidebar-footer {
          padding: 12px 16px; border-top: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 8px;
        }
        .app-sidebar .user-info { display: flex; align-items: center; gap: 10px; }
        .app-sidebar .user-avatar {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: rgba(59,130,246,0.12); display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: var(--blue-light);
        }
        .app-sidebar .user-name { font-size: 13px; font-weight: 500; color: var(--text); line-height: 1.2; }
        .app-sidebar .user-plan { font-size: 11px; color: var(--text3); }
        .app-sidebar .btn-logout {
          font-size: 12px; color: var(--text3); padding: 6px 0; text-align: left;
          transition: color 0.2s;
        }
        .app-sidebar .btn-logout:hover { color: #f87171; }
        .app-sidebar .badge-role {
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; margin-left: auto;
        }

        /* Main content */
        .app-main { flex: 1; margin-left: 240px; min-height: 100vh; }

        /* Topbar mobile */
        .app-topbar-mobile {
          display: none; height: 56px; position: fixed; top: 0; left: 0; right: 0; z-index: 40;
          background: rgba(9,9,15,0.95); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border); align-items: center; justify-content: space-between;
          padding: 0 16px;
        }

        /* Bottom nav mobile */
        .app-bottomnav {
          display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
          height: 60px; background: rgba(9,9,15,0.95); backdrop-filter: blur(20px);
          border-top: 1px solid var(--border);
          padding: 0 8px; padding-bottom: env(safe-area-inset-bottom, 0);
        }
        .app-bottomnav nav {
          display: flex; align-items: center; justify-content: space-around; height: 100%;
        }
        .app-bottomnav .bnav-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 6px 12px; border-radius: 10px; color: var(--text3); font-size: 10px;
          transition: all 0.2s; text-decoration: none;
        }
        .app-bottomnav .bnav-item.active { color: var(--blue-light); }
        .app-bottomnav .bnav-item svg { width: 22px; height: 22px; }

        /* Tablet: collapsed sidebar */
        @media (max-width: 900px) {
          .app-sidebar { width: 64px; }
          .app-sidebar .logo-text { display: none; }
          .app-sidebar .logo { padding: 0; justify-content: center; }
          .app-sidebar .nav-item { padding: 10px; justify-content: center; }
          .app-sidebar .nav-label { display: none; }
          .app-sidebar .nav-item.active::before { display: none; }
          .app-sidebar .badge-role { display: none; }
          .app-sidebar .sidebar-footer { padding: 8px; align-items: center; }
          .app-sidebar .user-info .user-name, .app-sidebar .user-info .user-plan { display: none; }
          .app-sidebar .btn-logout { display: none; }
          .app-main { margin-left: 64px; }
        }

        /* Mobile: no sidebar, bottom nav */
        @media (max-width: 640px) {
          .app-sidebar { display: none; }
          .app-topbar-mobile { display: flex; }
          .app-bottomnav { display: block; }
          .app-main { margin-left: 0; padding-top: 56px; padding-bottom: 68px; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="logo">
          <div className="logo-icon">C</div>
          <span className="logo-text">ContratoAI</span>
        </div>
        <nav>
          {filteredNav.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className={`nav-item ${activeId === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
              {item.id === 'admin' && (
                <span className="badge-role" style={{ background: isMaster ? 'rgba(168,85,247,0.15)' : 'rgba(239,68,68,0.15)', color: isMaster ? '#a855f7' : '#f87171' }}>
                  {isMaster ? 'MASTER' : 'ADMIN'}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.nome?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div className="user-name">{user?.nome || user?.email?.split('@')[0] || ''}</div>
              <div className="user-plan">{user?.plano === 'mensal' ? 'Plano Mensal' : 'Free'}</div>
            </div>
          </div>
          <button onClick={logout} className="btn-logout">Sair da conta</button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="app-topbar-mobile">
        <Link href="/painel" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,var(--blue),var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>C</div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16 }}>ContratoAI</span>
        </Link>
        <button onClick={logout} style={{ fontSize: 12, color: 'var(--text3)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>Sair</button>
      </div>

      {/* Bottom nav mobile */}
      <div className="app-bottomnav">
        <nav>
          {filteredNav.filter(n => n.id !== 'admin').map(item => (
            <Link key={item.id} href={item.href} className={`bnav-item ${activeId === item.id ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}
