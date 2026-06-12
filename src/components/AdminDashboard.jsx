import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { fetchAdminProfile } from '../utils/adminAuth'
import { NAV_GROUPS } from '../config/navigation'
import { getEntityConfig } from '../config/entities'
import Login from './Login'
import OverviewPanel from './OverviewPanel'
import GenericCrudPanel from './GenericCrudPanel'
import { PetPalsBrand } from '@petpals/theme/PetPalsLogo.jsx'
import ThemeToggle from '@petpals/theme/ThemeToggle.jsx'
import * as Icons from 'lucide-react'
import {
  Loader2,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Shield,
  X,
} from 'lucide-react'

const BRAND = 'var(--pp-primary)'
const NAVY = 'var(--pp-text-primary)'
const BG = 'var(--pp-bg)'
const NAV_ACTIVE_BG = 'var(--pp-nav-active-bg)'
const NAV_ACTIVE_TEXT = 'var(--pp-nav-active-text)'

const sidebarBase = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: 40,
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--pp-sidebar-bg)',
  borderRight: '1px solid var(--pp-card-border)',
  boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
  overflowY: 'auto',
  overflowX: 'hidden',
  transition: 'width 0.2s ease',
}

const SIDEBAR_W_EXPANDED = 240
const SIDEBAR_W_COLLAPSED = 72

function findNavItem(sectionId) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.id === sectionId)
    if (item) return { ...item, group: group.label }
  }
  return null
}

const SidebarItem = ({ icon: Icon, label, isActive, collapsed, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={collapsed ? label : undefined}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: collapsed ? '10px 0' : '10px 12px',
      margin: '0 8px 2px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.12s, color 0.12s',
      fontWeight: isActive ? 700 : 500,
      fontSize: 13,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      background: isActive ? NAV_ACTIVE_BG : 'transparent',
      color: isActive ? NAV_ACTIVE_TEXT : 'var(--pp-text-secondary)',
      justifyContent: collapsed ? 'center' : 'flex-start',
      width: 'calc(100% - 16px)',
    }}
    onMouseEnter={(e) => {
      if (!isActive) e.currentTarget.style.background = 'var(--pp-bg)'
    }}
    onMouseLeave={(e) => {
      if (!isActive) e.currentTarget.style.background = 'transparent'
    }}
  >
    <Icon style={{ width: 18, height: 18, color: isActive ? NAV_ACTIVE_TEXT : BRAND, flexShrink: 0 }} />
    {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
  </button>
)

const AdminDashboard = () => {
  const [session, setSession] = useState(null)
  const [adminProfile, setAdminProfile] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  )

  const sidebarW = sidebarCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolveSession = async (s) => {
    setSession(s)
    if (!s) {
      setAdminProfile(null)
      setAuthError(null)
      setInitializing(false)
      return
    }
    const { profile, error } = await fetchAdminProfile(s.user.id)
    if (error) {
      setAuthError(error)
      setAdminProfile(null)
    } else {
      setAdminProfile(profile)
      setAuthError(null)
    }
    setInitializing(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => resolveSession(s))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setInitializing(true)
      resolveSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setActiveSection('overview')
  }

  const navigateTo = (sectionId) => {
    setActiveSection(sectionId)
    setMobileNavOpen(false)
  }

  const currentNav = findNavItem(activeSection)
  const currentLabel =
    activeSection === 'overview' ? 'Dashboard' : getEntityConfig(activeSection)?.title || currentNav?.label || 'Admin'
  const CurrentIcon = currentNav ? Icons[currentNav.icon] || Icons.LayoutDashboard : Icons.LayoutDashboard

  const renderSidebar = (collapsed, mobile = false) => (
    <aside
      style={{
        ...sidebarBase,
        width: mobile ? SIDEBAR_W_EXPANDED : sidebarW,
        position: mobile ? 'relative' : 'fixed',
      }}
      aria-label="Main navigation"
    >
      <div
        style={{
          padding: collapsed && !mobile ? '20px 0' : '20px 16px',
          display: 'flex',
          flexDirection: collapsed && !mobile ? 'column' : 'row',
          gap: collapsed && !mobile ? 12 : 0,
          alignItems: 'center',
          justifyContent: collapsed && !mobile ? 'center' : 'space-between',
          borderBottom: '1px solid var(--pp-card-border)',
          flexShrink: 0,
        }}
      >
        {(!collapsed || mobile) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <PetPalsBrand logoSize="lg" />
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: BRAND,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              Admin App
            </span>
          </div>
        )}
        {collapsed && !mobile && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: BRAND,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
        )}
        {!mobile && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: '1px solid var(--pp-input-border)',
              background: 'var(--pp-input-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              marginLeft: collapsed ? 0 : 'auto',
              color: 'var(--pp-text-muted)',
            }}
          >
            {sidebarCollapsed ? <ChevronRightIcon size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
        {mobile && (
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: '1px solid var(--pp-input-border)',
              background: 'var(--pp-input-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--pp-text-muted)',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {(!collapsed || mobile) && (
              <div
                style={{
                  padding: '0 24px',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--pp-text-muted)',
                  marginBottom: 8,
                  marginTop: group.label === 'Overview' ? 0 : 16,
                }}
              >
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = Icons[item.icon] || Icons.Circle
              return (
                <SidebarItem
                  key={item.id}
                  icon={Icon}
                  label={item.label}
                  isActive={activeSection === item.id}
                  collapsed={collapsed && !mobile}
                  onClick={() => navigateTo(item.id)}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '8px',
          borderTop: '1px solid var(--pp-card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {(!collapsed || mobile) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
            <span style={{ fontSize: 12, color: 'var(--pp-text-muted)', fontWeight: 500, flex: 1 }}>
              Theme
            </span>
            <ThemeToggle />
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed && !mobile ? 'center' : 'flex-start',
            gap: 12,
            padding: '10px 12px',
            background: 'transparent',
            border: 'none',
            color: '#EF4444',
            cursor: 'pointer',
            borderRadius: 8,
          }}
        >
          <LogOut style={{ width: 18, height: 18 }} />
          {(!collapsed || mobile) && <span style={{ fontSize: 13, fontWeight: 600 }}>Log out</span>}
        </button>
      </div>
    </aside>
  )

  if (initializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader2
          style={{
            width: 40,
            height: 40,
            color: BRAND,
            animation: 'spin 1s linear infinite',
            marginBottom: 12,
          }}
        />
        <p style={{ color: 'var(--pp-text-muted)', fontWeight: 500 }}>Initializing admin console…</p>
      </div>
    )
  }

  if (!session) {
    return <Login onLoginSuccess={(user) => resolveSession({ user })} />
  }

  if (authError || !adminProfile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <div
          style={{
            background: 'var(--pp-card-bg)',
            borderRadius: 24,
            border: '1px solid var(--pp-card-border)',
            boxShadow: 'var(--pp-shadow-floating)',
            padding: 40,
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'var(--pp-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Icons.ShieldAlert style={{ width: 32, height: 32, color: '#F59E0B' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Access denied</h2>
          <p style={{ color: 'var(--pp-text-muted)', marginBottom: 24, fontSize: 14 }}>{authError}</p>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'var(--pp-bg)',
              border: '1px solid var(--pp-card-border)',
              borderRadius: 12,
              padding: '10px 20px',
              fontWeight: 600,
              color: NAVY,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  const adminName = adminProfile.user_name || 'Administrator'
  const adminInitial = adminName.charAt(0).toUpperCase()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: BG }}>
      <div className="hidden lg:block">{renderSidebar(sidebarCollapsed)}</div>

      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0"
            style={{ background: 'var(--pp-overlay)' }}
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <div className="relative h-full z-50">{renderSidebar(false, true)}</div>
        </div>
      )}

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: isDesktop ? sidebarW : 0,
          transition: 'margin-left 0.2s ease',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <header
          role="banner"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            height: 60,
            minHeight: 60,
            background: 'var(--pp-header-bg)',
            borderBottom: '1px solid var(--pp-card-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid var(--pp-input-border)',
              background: 'var(--pp-input-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--pp-text-muted)',
            }}
          >
            <Menu size={18} />
          </button>
          <CurrentIcon style={{ width: 18, height: 18, color: BRAND, flexShrink: 0 }} aria-hidden="true" />
          <h1
            style={{ fontSize: 15, fontWeight: 700, color: NAVY, whiteSpace: 'nowrap', margin: 0 }}
            id="page-title"
          >
            {currentLabel}
          </h1>
          <div style={{ flex: 1 }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: 'var(--pp-primary-light)',
              color: 'var(--pp-primary)',
              padding: '3px 10px',
              borderRadius: 99,
              letterSpacing: '0.03em',
            }}
            aria-label="Platform is live"
          >
            LIVE
          </span>
          <div
            title={adminName}
            aria-label={`Administrator: ${adminName}`}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--pp-avatar-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
              color: 'var(--pp-avatar-text)',
              flexShrink: 0,
            }}
          >
            {adminInitial}
          </div>
        </header>

        <div
          role="region"
          aria-label="Section hero"
          style={{
            background: 'var(--pp-hero-bg)',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexShrink: 0,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'var(--pp-hero-text-muted)',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              PetPals Admin
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--pp-hero-text)', margin: '4px 0 2px' }}>
              {adminName}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--pp-hero-text-muted)', margin: 0 }}>{currentLabel}</p>
          </div>
          <Shield style={{ width: 56, height: 56, color: 'var(--pp-hero-icon)', flexShrink: 0 }} aria-hidden="true" />
        </div>

        <div style={{ flex: 1, padding: '24px 32px' }}>
          {activeSection === 'overview' ? (
            <OverviewPanel onNavigate={navigateTo} />
          ) : (
            <GenericCrudPanel entityId={activeSection} />
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
