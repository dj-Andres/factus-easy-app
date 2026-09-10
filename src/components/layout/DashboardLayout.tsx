import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Button, Spinner } from 'flowbite-react'
import { useCompany } from '../../hooks/useCompany'
import Header from './Header'
import Sidebar from './Sidebar'
import CreateCompanyModal from './CreateCompanyModal'

export default function DashboardLayout() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const { isLoading, isEmpty, error, refetch } = useCompany()

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" color="info" />
        </div>
      )
    }
    if (error) {
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg border border-border-warm bg-surface p-8 text-center shadow-card">
            <p className="text-sm text-muted">{error}</p>
            <Button color="blue" className="mt-4" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        </div>
      )
    }
    if (isEmpty) {
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg border border-border-warm bg-surface p-10 text-center shadow-card">
            <h2 className="text-base font-semibold text-ink">Bienvenido a Factus Easy</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Registra tu empresa para comenzar a facturar electrónicamente con el SRI. Después podrás emitir
              facturas, notas de crédito, guías de remisión y retenciones desde esta aplicación.
            </p>
            <Button color="blue" className="mt-6" onClick={() => setShowCreate(true)}>
              Crear empresa
            </Button>
          </div>
        </div>
      )
    }
    return (
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div key={pathname} className="animate-fade-up">
          <Outlet />
        </div>
      </main>
    )
  }

  return (
    <div className="flex h-screen bg-canvas text-ink">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        {renderContent()}
      </div>
      <CreateCompanyModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => setShowCreate(false)}
      />
    </div>
  )
}
