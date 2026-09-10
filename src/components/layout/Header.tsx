import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useTour } from '../../hooks/useTour'
import CompanySelector from './CompanySelector'

interface HeaderProps {
  onOpenMobile: () => void
}

export default function Header({ onOpenMobile }: HeaderProps) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { start, reset } = useTour('dashboard')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleRestartTour = () => {
    reset()
    if (pathname === '/') {
      start()
    } else {
      navigate('/')
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border-warm bg-surface px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-ink lg:hidden"
          title="Abrir menú"
          aria-label="Abrir menú"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div data-guide="company-selector">
          <CompanySelector />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={handleRestartTour}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
          title="Recorrer tutorial"
          aria-label="Recorrer tutorial"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.1 9a3 3 0 015.83 1c0 2-3 2.4-3 4" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </button>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent">
          {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
        </div>
        <span className="hidden text-[13px] font-medium text-ink sm:block">{user?.name ?? user?.email}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-border-warm px-3 py-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-danger"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
