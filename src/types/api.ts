// ============================================================
// Factus Easy — API type definitions
// Field names mirror the backend JSON resources exactly.
// ============================================================

// ------------------------------------------------------------
// Envelope & pagination
// ------------------------------------------------------------

/** Standard API envelope returned by the Laravel backend. */
export interface ApiResponse<T = unknown> {
  status: 'ok' | 'error' | 'info'
  code: number
  message: string
  data: T
}

/** Laravel paginator shape (returned inside `data` for list endpoints). */
export interface LaravelPagination<T> {
  current_page: number
  data: T[]
  first_page_url: string | null
  from: number | null
  last_page: number
  last_page_url: string | null
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

/** Custom pagination returned by the document status endpoint. */
export interface DocumentPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
  has_more: boolean
}

// ------------------------------------------------------------
// Enums (string literal unions)
// ------------------------------------------------------------

export type UserType = 'DEVELOPER' | 'GENERAL'

export type DocumentStatusCode =
  | 'GENERATED'
  | 'SIGNED'
  | 'RECEIVED'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'ERROR'
  | 'RETURNED'
  | 'ANNULLED'

export type DocumentTypeCode = '01' | '04' | '06' | '07'

export type CreditNoteType = 'devolucion' | 'descuento'

export type IdentificationType = '04' | '05' | '06' | '07' | '08'

export type ProductKind = 'BIEN' | 'SERVICIO'

// ------------------------------------------------------------
// Auth
// ------------------------------------------------------------

export interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  user_type: UserType
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  user: User
  token?: string
}

// ------------------------------------------------------------
// Company
// ------------------------------------------------------------

export interface CompanyOwner {
  id: number | null
  name: string | null
  email: string | null
}

export interface Company {
  ruc: string
  name: string
  business_name: string
  address: string | null
  phone: string | null
  accounting_required: string
  special_taxpayer: string
  special_taxpayer_number: string | null
  large_taxpayer: string | null
  major_taxpayer: string | null
  sri_resolution_code: string | null
  email: string
  status: string
  environment?: 'test' | 'production' | null
  has_certificate: boolean
  signature_issue_date?: string | null
  signature_expiration_date?: string | null
  has_logo: boolean
  owner: CompanyOwner
}

export interface CompanyInput {
  ruc: string
  name: string
  business_name: string
  address?: string
  phone?: string
  accounting_required: string
  special_taxpayer: string
  special_taxpayer_number?: string
  large_taxpayer?: string
  major_taxpayer?: string
  sri_resolution_code?: string
  email: string
  environment?: 'test' | 'production'
}

export interface CompanyEstablishment {
  id: number
  company_id: number
  code: string
  name: string
  address: string
  status: string
  created_at: string
  updated_at: string
}

export interface CompanyEstablishmentInput {
  code: string
  name: string
  address: string
}

export interface CompanyEmissionPoint {
  id: number
  company_id: number
  establishment_id: number
  code: string
  description: string
  sequential: number
  status: string
  created_at: string
  updated_at: string
}

export interface CompanyEmissionPointInput {
  establishment_id: number
  code: string
  description: string
  sequential?: number
  status?: string
}

// ------------------------------------------------------------
// Customers
// ------------------------------------------------------------

export interface Customer {
  id: number
  company_id: number
  ruc: string
  identification_type: IdentificationType
  identification_number: string
  name: string
  email: string | null
  phone: string | null
  address: string
  is_consumer_final: boolean
  created_at: string
  updated_at: string
}

export interface CustomerInput {
  ruc: string
  identification_type: IdentificationType
  identification_number: string
  name: string
  email?: string
  phone?: string
  address: string
}

// ------------------------------------------------------------
// Products & taxes
// ------------------------------------------------------------

export interface ProductTax {
  id: number
  tax_type: string
  name: string
  percentage: number
  sri_code: string
  sri_percentage_code: string
}

export interface SriTax {
  id: number
  tax_type: string
  name: string
  percentage: number
  sri_code: string
  sri_percentage_code: string
}

export interface ProductOption {
  value: string
  label: string
  sri_code?: string
}

export interface ProductOptions {
  product_kinds: ProductOption[]
  sri_product_types: ProductOption[]
  sri_product_classifications: Record<string, ProductOption[]>
}

export interface Product {
  id: number
  company_id: number
  ruc: string
  product_kind: ProductKind
  product_kind_label: string | null
  auxiliary_code: string | null
  sri_product_type: string
  sri_product_type_label: string | null
  sri_product_classification: string | null
  sri_product_classification_label: string | null
  sri_auxiliary_code: string | null
  description: string
  unit_price: number
  taxes?: ProductTax[]
  created_at: string
  updated_at: string
}

export interface ProductInput {
  ruc: string
  product_kind: ProductKind
  auxiliary_code?: string
  sri_product_type: string
  sri_product_classification?: string
  description: string
  unit_price: number
  taxes: number[]
}

export interface PaymentMethod {
  code: string
  name: string
  description: string | null
}

export interface RetentionConfig {
  name: string
  type: number
  code_sri: string
  percentage: number
}

// ------------------------------------------------------------
// Tax detail (stored in item `impuestos` JSON)
// Note: keys follow SRI XML casing (codigo, codigoPorcentaje, tarifa,
// baseImponible, valor) plus the DB id (sri_tax_id).
// ------------------------------------------------------------

export interface TaxDetail {
  sri_tax_id: number
  codigo: string
  codigoPorcentaje: string
  tarifa: number
  baseImponible: number
  valor: number
}

export interface AdditionalDetail {
  nombre: string
  valor: string
}

// ------------------------------------------------------------
// Quick Invoice
// ------------------------------------------------------------

export interface QuickInvoiceItem {
  id: number
  product_id: number
  cantidad: number
  precio_unitario: number | null
  descuento: number
  detalles_adicionales: AdditionalDetail[] | null
  cantidad_disponible: number | null
  descuento_acumulado: number
  base_imponible: number | null
  total_con_impuestos: number | null
  impuestos: TaxDetail[] | null
  created_at: string
  updated_at: string
}

export interface QuickInvoice {
  id: number
  company_id: number
  ruc: string
  establishment_id: number
  emission_point_id: number
  customer_id: number
  emission_date: string
  series: string
  sequential: string
  payment_method: string
  license_plate: string | null
  additional_info: Record<string, string> | null
  total_sin_impuestos: number | null
  total_impuestos: number | null
  total_descuento: number | null
  total: number | null
  document_type: DocumentTypeCode
  document_id: number | null
  status: string
  items?: QuickInvoiceItem[]
  created_at: string
  updated_at: string
}

/** Request payload for creating/updating a quick invoice (camelCase). */
export interface QuickInvoiceItemInput {
  product_id: number
  cantidad: number
  precioUnitario?: number
  descuento?: number
  detallesAdicionales?: AdditionalDetail[]
}

export interface QuickInvoiceInput {
  ruc: string
  establishment_id: number
  emission_point_id: number
  customer_id: number
  items: QuickInvoiceItemInput[]
  payment_method: string
  license_plate?: string
  additional_info?: Record<string, string>
  emission_date?: string
}

// ------------------------------------------------------------
// Quick Credit Note
// ------------------------------------------------------------

export interface QuickCreditNoteItem {
  id: number
  product_id: number
  cantidad: number
  precio_unitario: number | null
  descuento: number
  detalles_adicionales: AdditionalDetail[] | null
  base_imponible: number | null
  total_con_impuestos: number | null
  impuestos: TaxDetail[] | null
  created_at: string
  updated_at: string
}

export interface QuickCreditNote {
  id: number
  company_id: number
  ruc: string
  establishment_id: number
  emission_point_id: number
  customer_id: number
  emission_date: string
  series: string
  sequential: string
  credit_note_type: CreditNoteType
  motivo: string
  original_invoice_series: string
  original_invoice_sequential: string
  original_invoice_access_key: string | null
  original_invoice_date: string | null
  total: number
  total_sin_impuestos: number | null
  total_impuestos: number | null
  total_descuento: number | null
  additional_info: Record<string, string> | null
  document_id: number | null
  status: string
  items?: QuickCreditNoteItem[]
  created_at: string
  updated_at: string
}

export interface QuickCreditNoteItemInput {
  product_id: number
  cantidad: number
  precioUnitario?: number
  descuento?: number
  detallesAdicionales?: AdditionalDetail[]
}

export interface QuickCreditNoteInput {
  ruc: string
  establishment_id: number
  emission_point_id: number
  customer_id: number
  credit_note_type: CreditNoteType
  motivo: string
  original_invoice_series: string
  original_invoice_sequential: string
  items: QuickCreditNoteItemInput[]
  additional_info?: Record<string, string>
}

// ------------------------------------------------------------
// Documents (status queries)
// ------------------------------------------------------------

export interface DocumentStatus {
  id: number
  external_id: string
  access_key: string
  document_type: DocumentTypeCode
  series: string
  sequential: string
  issue_date: string
  status: DocumentStatusCode
  document_status: string
  authorization_number: string | null
  authorization_date: string | null
  message: string | null
  code: string | null
  notification_email: string | null
  webhook_url: string | null
  created_at: string
  updated_at: string
  xml?: string
  status_info: DocumentStatusInfo
}

export interface DocumentStatusInfo {
  is_finalized: boolean
  is_processing: boolean
  has_xml: boolean
  next_expected_action: string
}

export interface DocumentStatusSummary {
  total_documents: number
  total_invoices: number
  total_credit_notes: number
  total_remission_guides: number
  total_retentions: number
  by_status: Partial<Record<DocumentStatusCode, number>>
  finalized_documents: number
  processing_documents: number
}

export interface DocumentStatusResult {
  documents: DocumentStatus[]
  pagination: DocumentPagination
  summary: DocumentStatusSummary
}

export interface DocumentStatusQuery {
  ruc: string
  tipo?: DocumentTypeCode
  external_id?: string
  access_key?: string
  status?: DocumentStatusCode
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
  include_xml?: boolean
}

// ------------------------------------------------------------
// Received documents (SRI → app, via TXT upload)
// ------------------------------------------------------------

export interface ReceivedDocument {
  id: number
  upload_id: number
  line_number: number | null
  sri_document_code: string
  issuer_ruc: string
  issuer_business_name: string | null
  voucher_type: string | null
  voucher_series: string | null
  access_key: string
  authorized_at: string | null
  issued_on: string | null
  recipient_identification: string | null
  amount_without_taxes: number | null
  vat_amount: number | null
  total_amount: number | null
  modified_document_number: string | null
  has_xml: boolean
  sri_checked_at: string | null
  created_at: string
  updated_at: string
}

export interface ReceivedDocumentsResult {
  documents: ReceivedDocument[]
  pagination: DocumentPagination
}

export interface ReceivedDocumentsQuery {
  ruc: string
  sri_document_code?: string
  issuer_ruc?: string
  access_key?: string
  upload_id?: number
  issued_from?: string
  issued_to?: string
  has_xml?: boolean
  page?: number
  per_page?: number
}

// ------------------------------------------------------------
// Annulments
// ------------------------------------------------------------

export type AnnulmentReason = 'ERROR_IN_ISSUANCE' | 'OPERATION_NOT_REALIZED' | 'OTHERS'

export interface AnnulmentInfo {
  id: number
  verification_code: string
  annulment_type: string
  reason: string
  justification?: string | null
  status: string
  request_date?: string | null
  response_date?: string | null
  annulled_at?: string | null
}

export interface AnnulmentResult {
  document: DocumentStatus
  annulment: AnnulmentInfo
}

export interface AnnulmentListResult {
  document: DocumentStatus
  annulments: AnnulmentInfo[]
  total: number
}

export interface AnnulmentRequestInput {
  reason: AnnulmentReason
  justification?: string
}
