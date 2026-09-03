import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useCompany } from '../../hooks/useCompany'

interface NavItem {
  label: string
  path: string
  icon: ReactNode
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      {
        label: 'Dashboard',
        path: '/',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Documentos',
    items: [
      {
        label: 'Facturas',
        path: '/quick-invoices',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7v5h5v13H7z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 12h6M10 16h6" />
          </svg>
        ),
      },
      {
        label: 'Notas de Crédito',
        path: '/quick-credit-notes',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6M9 13h6" />
          </svg>
        ),
      },
      {
        label: 'Guías de Remisión',
        path: '/quick-remission-guides',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h9v9H3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9h4l3 3v3h-7z" />
            <circle cx="7" cy="18" r="1.5" />
            <circle cx="17" cy="18" r="1.5" />
          </svg>
        ),
      },
      {
        label: 'Documentos',
        path: '/documents',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h12M8 12h12M8 18h12" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h2M3 12h2M3 18h2" />
          </svg>
        ),
      },
      {
        label: 'Recibidos',
        path: '/received-documents',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h4l2 3h4l2-3h4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Catálogos',
    items: [
      {
        label: 'Clientes',
        path: '/customers',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 11a4 4 0 100-8 4 4 0 000 8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 00-3-4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3a4 4 0 010 7" />
          </svg>
        ),
      },
      {
        label: 'Productos',
        path: '/products',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4v12l-8 4-8-4V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M4 6l8 4 8-4" />
          </svg>
        ),
      },
      {
        label: 'Transportistas',
        path: '/transporters',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h9v9H3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9h4l3 3v3h-7z" />
            <circle cx="7" cy="18" r="1.5" />
            <circle cx="17" cy="18" r="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        label: 'Configuración',
        path: '/settings',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5" />
            <circle cx="16" cy="6" r="2" />
            <circle cx="8" cy="12" r="2" />
            <circle cx="13" cy="18" r="2" />
          </svg>
        ),
      },
      {
        label: 'Establecimientos',
        path: '/settings/establishments',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
          </svg>
        ),
      },
      {
        label: 'Puntos de emisión',
        path: '/settings/emission-points',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6-7-11a7 7 0 1114 0c0 5-7 11-7 11z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        ),
      },
      {
        label: 'Impuestos SRI',
        path: '/settings/taxes',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 15.5L15.5 8.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h1M14 14h1" />
          </svg>
        ),
      },
      {
        label: 'Formas de Pago',
        path: '/settings/payment-methods',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <rect x="3" y="6" width="18" height="13" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
          </svg>
        ),
      },
      {
        label: 'Retenciones',
        path: '/settings/retentions',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v6M15 3v6M9 15v6M15 15v6" />
          </svg>
        ),
      },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export default function AppSidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { selectedCompany } = useCompany()
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (label: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }))

  const handleNavigate = () => {
    if (mobileOpen) onCloseMobile()
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border-warm bg-surface transition-transform duration-200 ease-out lg:static lg:z-auto lg:shrink-0 lg:transition-[width] ${
          collapsed ? 'lg:w-[68px]' : 'lg:w-60'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo + collapse toggle */}
        <div className="flex h-14 shrink-0 items-center border-b border-border-warm px-5">
          <div className={`flex min-w-0 flex-1 items-center gap-2.5 ${collapsed ? 'lg:hidden' : ''}`}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent font-mono text-sm font-bold text-white">
              F
            </span>
            <span className="truncate text-sm font-semibold tracking-tight text-ink">Factus Easy</span>
          </div>

          <button
            type="button"
            onClick={onToggleCollapsed}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-ink lg:flex"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {navGroups.map((group) => {
            const isGroupCollapsed = collapsedGroups[group.label]
            return (
              <div key={group.label} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className={`flex w-full items-center rounded-md text-[11px] font-semibold uppercase tracking-wider text-faint transition-colors duration-150 hover:text-muted ${
                    collapsed ? 'lg:justify-center lg:py-2' : 'justify-between px-2.5 py-1.5'
                  }`}
                  title={collapsed ? group.label : undefined}
                >
                  <span className={collapsed ? 'lg:hidden' : ''}>{group.label}</span>
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-200 lg:hidden ${
                      isGroupCollapsed ? '-rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isGroupCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                  }`}
                >
                  <div className={`overflow-hidden ${collapsed ? 'lg:pt-1' : ''}`}>
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/' || item.path === '/settings'}
                        onClick={handleNavigate}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          `group relative mb-0.5 flex items-center gap-2.5 rounded-md text-[13px] font-medium transition-colors duration-150 ${
                            collapsed ? 'lg:justify-center lg:px-0' : 'px-2.5'
                          } py-2 ${
                            isActive
                              ? 'bg-accent-soft text-accent'
                              : 'text-muted hover:bg-surface-2 hover:text-ink'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                            )}
                            <span
                              className={`shrink-0 transition-colors duration-150 ${
                                isActive ? 'text-accent' : 'text-faint group-hover:text-muted'
                              }`}
                            >
                              {item.icon}
                            </span>
                            <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* Company card */}
        <div className="shrink-0 border-t border-border-warm p-3">
          {selectedCompany && (
            <div className="rounded-md border border-border-warm bg-canvas px-3 py-2.5">
              <div className={`flex items-center gap-2 ${collapsed ? 'lg:justify-center' : ''}`}>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                <span className={`truncate text-[12px] font-medium text-ink ${collapsed ? 'lg:hidden' : ''}`}>
                  {selectedCompany.name}
                </span>
              </div>
              <div className={`mt-1 truncate font-mono text-[11px] text-faint ${collapsed ? 'lg:hidden' : ''}`}>
                {selectedCompany.ruc}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
