import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import CompanySelector from './CompanySelector'

interface HeaderProps {
  onOpenMobile: () => void
}

export default function Header({ onOpenMobile }: HeaderProps) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
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
        <CompanySelector />
      </div>

      <div className="flex shrink-0 items-center gap-3">
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
