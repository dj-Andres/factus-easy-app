import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import CompanySelector from './CompanySelector'

export default function Header() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-warm bg-surface px-6">
      <CompanySelector />

      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent">
          {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
        </div>
        <span className="text-[13px] font-medium text-ink">{user?.name ?? user?.email}</span>
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
