import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import CompanyPage from '../pages/config/CompanyPage'
import EmissionPointsPage from '../pages/config/EmissionPointsPage'
import EstablishmentsPage from '../pages/config/EstablishmentsPage'
import PaymentMethodsPage from '../pages/config/PaymentMethodsPage'
import RetentionConfigsPage from '../pages/config/RetentionConfigsPage'
import SriTaxesPage from '../pages/config/SriTaxesPage'
import CustomerListPage from '../pages/customers/CustomerListPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import DocumentStatusPage from '../pages/documents/DocumentStatusPage'
import ReceivedDocumentsPage from '../pages/documents/ReceivedDocumentsPage'
import QuickInvoiceFormPage from '../pages/invoices/QuickInvoiceFormPage'
import QuickInvoiceListPage from '../pages/invoices/QuickInvoiceListPage'
import QuickCreditNoteFormPage from '../pages/credit-notes/QuickCreditNoteFormPage'
import QuickCreditNoteListPage from '../pages/credit-notes/QuickCreditNoteListPage'
import QuickRemissionGuideFormPage from '../pages/remission-guides/QuickRemissionGuideFormPage'
import QuickRemissionGuideListPage from '../pages/remission-guides/QuickRemissionGuideListPage'
import ProductListPage from '../pages/products/ProductListPage'
import TransporterListPage from '../pages/transporters/TransporterListPage'
import GuestRoute from './GuestRoute'
import ProtectedRoute from './ProtectedRoute'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/transporters" element={<TransporterListPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/quick-invoices" element={<QuickInvoiceListPage />} />
          <Route path="/quick-invoices/new" element={<QuickInvoiceFormPage />} />
          <Route path="/quick-invoices/:id" element={<QuickInvoiceFormPage />} />
          <Route path="/quick-invoices/:id/edit" element={<QuickInvoiceFormPage />} />
          <Route path="/quick-credit-notes" element={<QuickCreditNoteListPage />} />
          <Route path="/quick-credit-notes/new" element={<QuickCreditNoteFormPage />} />
          <Route path="/quick-credit-notes/:id" element={<QuickCreditNoteFormPage />} />
          <Route path="/quick-credit-notes/:id/edit" element={<QuickCreditNoteFormPage />} />
          <Route path="/quick-remission-guides" element={<QuickRemissionGuideListPage />} />
          <Route path="/quick-remission-guides/new" element={<QuickRemissionGuideFormPage />} />
          <Route path="/quick-remission-guides/:id" element={<QuickRemissionGuideFormPage />} />
          <Route path="/quick-remission-guides/:id/edit" element={<QuickRemissionGuideFormPage />} />
          <Route path="/documents" element={<DocumentStatusPage />} />
          <Route path="/received-documents" element={<ReceivedDocumentsPage />} />
          <Route path="/settings" element={<CompanyPage />} />
          <Route path="/settings/establishments" element={<EstablishmentsPage />} />
          <Route path="/settings/emission-points" element={<EmissionPointsPage />} />
          <Route path="/settings/taxes" element={<SriTaxesPage />} />
          <Route path="/settings/payment-methods" element={<PaymentMethodsPage />} />
          <Route path="/settings/retentions" element={<RetentionConfigsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
