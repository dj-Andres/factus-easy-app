import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Spinner } from 'flowbite-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCompany } from '../../hooks/useCompany'
import { useEstablishments } from '../../hooks/useEstablishments'
import { useEmissionPoints } from '../../hooks/useEmissionPoints'
import {
  useCreateQuickRetention,
  useQuickRetention,
  useSendQuickRetention,
  useUpdateQuickRetention,
} from '../../hooks/useQuickRetentions'
import { useRetentionConfigs } from '../../hooks/useRetentionConfigs'
import { getCustomers } from '../../api/customers'
import { retentionStatusLabel, retentionStatusTone } from '../../lib/quickRetentions'
import { toErrorMessage } from '../../lib/errors'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import RetentionDetailEditor from './components/RetentionDetailEditor'
import { IDENTIFICATION_TYPES, maxIdLength, type FormRetentionDetail, type InfoRow } from './retentionForm'
import type { Customer, QuickRetentionInput } from '../../types/api'

function dateString(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

function currentPeriod(): string {
  const now = new Date()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${m}/${now.getFullYear()}`
}

export default function QuickRetentionFormPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const selectedRuc = useAuthStore((state) => state.selectedRuc)
  const { isLoading: companyLoading } = useCompany()
  const retentionId = id ? Number(id) : null
  const mode: 'create' | 'edit' | 'view' = retentionId
    ? location.pathname.endsWith('/edit')
      ? 'edit'
      : 'view'
    : 'create'
  const isReadonly = mode === 'view'

  const keyCounter = useRef(1)
  const nextKey = () => `k-${keyCounter.current++}`

  const { data: establishments, isPending: establishmentsLoading } = useEstablishments(selectedRuc)
  const { data: retention, isPending: retentionLoading } = useQuickRetention(selectedRuc, retentionId)
  const { data: retentionConfigs = [] } = useRetentionConfigs()

  const [establishmentId, setEstablishmentId] = useState<number | ''>('')
  const [emissionPointId, setEmissionPointId] = useState<number | ''>('')
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [tipoIdentificacion, setTipoIdentificacion] = useState('04')
  const [identificacion, setIdentificacion] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [direccion, setDireccion] = useState('')
  const [periodoFiscal, setPeriodoFiscal] = useState(() => currentPeriod())
  const [additionalInfo, setAdditionalInfo] = useState<InfoRow[]>([])
  const [details, setDetails] = useState<FormRetentionDetail[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [showSendConfirm, setShowSendConfirm] = useState(false)

  const { data: emissionPoints, isPending: emissionPointsLoading } = useEmissionPoints(
    selectedRuc,
    establishmentId || undefined,
  )

  const customersQuery = useQuery({
    queryKey: ['customers', 'all', selectedRuc],
    queryFn: () => getCustomers({ ruc: selectedRuc!, per_page: 500 }),
    enabled: !!selectedRuc,
  })
  const customers = customersQuery.data?.data ?? []

  const createMutation = useCreateQuickRetention()
  const updateMutation = useUpdateQuickRetention()
  const sendMutation = useSendQuickRetention()

  const applyCustomer = (c: Customer) => {
    setCustomerId(c.id)
    setTipoIdentificacion(c.identification_type)
    setIdentificacion(c.identification_number)
    setRazonSocial(c.name)
    setDireccion(c.address ?? '')
  }

  useEffect(() => {
    if (!retention) return
    setEstablishmentId(retention.establishment_id)
    setEmissionPointId(retention.emission_point_id)
    if (retention.customer) setCustomerId(retention.customer.id)
    setTipoIdentificacion(retention.tipo_identificacion_sujeto_retenido)
    setIdentificacion(retention.identificacion_sujeto_retenido)
    setRazonSocial(retention.razon_social_sujeto_retenido)
    setDireccion(retention.direccion_sujeto_retenido ?? '')
    setPeriodoFiscal(retention.periodo_fiscal)
    setAdditionalInfo(
      Object.entries(retention.additional_info ?? {}).map(([clave, valor]) => ({ clave, valor })),
    )
    setDetails(
      (retention.details ?? []).map((d) => ({
        key: nextKey(),
        retentionConfigId: d.retention_config_id ?? '',
        codigo: d.codigo,
        codigoRetencion: d.codigo_retencion,
        descripcion: d.descripcion ?? '',
        baseImponible: String(d.base_imponible),
        porcentajeRetener: String(d.porcentaje_retener),
        valorRetenido: String(d.valor_retenido),
        codDocSustento: d.cod_doc_sustento,
        numDocSustento: d.num_doc_sustento,
        fechaEmisionDocSustento: d.fecha_emision_doc_sustento,
      })),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retention])

  useEffect(() => {
    if (retentionId) return
    if (establishmentId === '' && establishments && establishments.length > 0) {
      const active = establishments.find((e) => e.status === 'ACTIVE') ?? establishments[0]
      setEstablishmentId(active.id)
    }
  }, [establishments, establishmentId, retentionId])

  useEffect(() => {
    if (retentionId) return
    if (emissionPoints && emissionPoints.length > 0) {
      const current = emissionPoints.find((p) => p.id === emissionPointId)
      if (!current) {
        const active = emissionPoints.find((p) => p.status === 'ACTIVE') ?? emissionPoints[0]
        setEmissionPointId(active.id)
      }
    }
  }, [emissionPoints, emissionPointId, retentionId])

  const addDetail = () => setDetails((prev) => [...prev, emptyDetailFromKey(nextKey())])

  function emptyDetailFromKey(key: string): FormRetentionDetail {
    return {
      key,
      retentionConfigId: '',
      codigo: '1',
      codigoRetencion: '',
      descripcion: '',
      baseImponible: '',
      porcentajeRetener: '',
      valorRetenido: '',
      codDocSustento: '01',
      numDocSustento: '',
      fechaEmisionDocSustento: '',
    }
  }

  const updateDetail = (key: string, patch: Partial<FormRetentionDetail>) => {
    setDetails((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)))
  }

  const removeDetail = (key: string) => {
    setDetails((prev) => prev.filter((d) => d.key !== key))
  }

  const addInfoRow = () => setAdditionalInfo((prev) => [...prev, { clave: '', valor: '' }])
  const updateInfoRow = (index: number, patch: Partial<InfoRow>) =>
    setAdditionalInfo((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  const removeInfoRow = (index: number) => setAdditionalInfo((prev) => prev.filter((_, i) => i !== index))

  const establishment = establishments?.find((e) => e.id === establishmentId) ?? null
  const emissionPoint = emissionPoints?.find((p) => p.id === emissionPointId) ?? null

  const buildPayload = (): QuickRetentionInput | null => {
    if (!selectedRuc || establishmentId === '' || emissionPointId === '') {
      setApiError('Debe seleccionar establecimiento y punto de emisión.')
      return null
    }
    if (identificacion.trim() === '' || razonSocial.trim() === '') {
      setApiError('Debe indicar la identificación y razón social del sujeto retenido.')
      return null
    }
    if (periodoFiscal.trim() === '') {
      setApiError('Debe indicar el periodo fiscal.')
      return null
    }
    if (details.length === 0) {
      setApiError('Debe agregar al menos una línea de retención.')
      return null
    }

    let hasInvalidSustento = false
    for (const d of details) {
      if (!/^\d{3}-\d{3}-\d{9}$/.test(d.numDocSustento.trim())) hasInvalidSustento = true
      if (d.fechaEmisionDocSustento === '') hasInvalidSustento = true
    }
    if (hasInvalidSustento) {
      setApiError('Cada retención debe tener número (000-000-000000000) y fecha de documento sustento.')
      return null
    }

    const infoRecord: Record<string, string> = {}
    for (const row of additionalInfo) {
      if (row.clave.trim() !== '') infoRecord[row.clave.trim()] = row.valor
    }

    return {
      ruc: selectedRuc,
      establishment_id: Number(establishmentId),
      emission_point_id: Number(emissionPointId),
      customer_id: customerId === '' ? undefined : Number(customerId),
      emission_date: dateString(),
      periodo_fiscal: periodoFiscal,
      tipo_identificacion_sujeto_retenido: tipoIdentificacion as QuickRetentionInput['tipo_identificacion_sujeto_retenido'],
      identificacion_sujeto_retenido: identificacion.trim(),
      razon_social_sujeto_retenido: razonSocial.trim(),
      direccion_sujeto_retenido: direccion.trim() === '' ? undefined : direccion.trim(),
      additional_info: Object.keys(infoRecord).length > 0 ? infoRecord : undefined,
      details: details.map((d) => ({
        retention_config_id: d.retentionConfigId === '' ? undefined : Number(d.retentionConfigId),
        codigo: d.codigo,
        codigo_retencion: d.codigoRetencion.trim(),
        descripcion: d.descripcion.trim(),
        base_imponible: Number(d.baseImponible) || 0,
        porcentaje_retener: Number(d.porcentajeRetener) || 0,
        valor_retenido: Number(d.valorRetenido) || 0,
        cod_doc_sustento: d.codDocSustento,
        num_doc_sustento: d.numDocSustento.trim(),
        fecha_emision_doc_sustento: d.fechaEmisionDocSustento,
      })),
    }
  }

  const handleSave = () => {
    setApiError(null)
    const payload = buildPayload()
    if (!payload) return

    const onSuccess = () => navigate('/quick-retentions')
    const onError = (err: unknown) => setApiError(toErrorMessage(err))

    if (mode === 'edit' && retentionId) {
      updateMutation.mutate({ id: retentionId, data: payload }, { onSuccess, onError })
    } else {
      createMutation.mutate(payload, { onSuccess, onError })
    }
  }

  const handleSend = () => {
    if (!selectedRuc || !retentionId) return
    setApiError(null)

    const doSend = () =>
      sendMutation.mutate(
        { id: retentionId, ruc: selectedRuc },
        {
          onSuccess: () => navigate('/quick-retentions'),
          onError: (err) => setApiError(toErrorMessage(err)),
        },
      )

    if (mode === 'edit') {
      const payload = buildPayload()
      if (!payload) return
      updateMutation.mutate(
        { id: retentionId, data: payload },
        {
          onSuccess: doSend,
          onError: (err) => setApiError(toErrorMessage(err)),
        },
      )
      return
    }

    doSend()
  }

  const handleSaveAndSend = () => {
    setApiError(null)
    const payload = buildPayload()
    if (!payload || !selectedRuc) return
    createMutation.mutate(payload, {
      onSuccess: (created) => {
        sendMutation.mutate(
          { id: created.id, ruc: selectedRuc },
          {
            onSuccess: () => navigate('/quick-retentions'),
            onError: (err) => setApiError(toErrorMessage(err)),
          },
        )
      },
      onError: (err) => setApiError(toErrorMessage(err)),
    })
  }

  const busy = createMutation.isPending || updateMutation.isPending || sendMutation.isPending

  const isInitialLoading =
    companyLoading ||
    establishmentsLoading ||
    emissionPointsLoading ||
    customersQuery.isPending ||
    (retentionId !== null && retentionLoading)

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" color="info" />
      </div>
    )
  }

  if (retentionId && !retention) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-sm text-muted">No se encontró la retención</span>
        <button
          type="button"
          onClick={() => navigate('/quick-retentions')}
          className="mt-2 text-sm font-medium text-accent hover:text-accent-hover"
        >
          Volver al listado
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/quick-retentions')}
              className="text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              ← Volver
            </button>
            {retention && (
              <Badge tone={retentionStatusTone(retention.status, retention.document_status)}>
                {retentionStatusLabel(retention.status, retention.document_status)}
              </Badge>
            )}
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            {mode === 'create'
              ? 'Nueva Retención'
              : mode === 'edit'
                ? 'Editar Retención'
                : 'Detalle de Retención'}
          </h1>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {mode === 'create' && (
            <>
              <Button type="button" color="gray" onClick={handleSave} disabled={busy} className="active:scale-[0.98]">
                Guardar
              </Button>
              <Button type="button" color="blue" onClick={handleSaveAndSend} disabled={busy} className="active:scale-[0.98]">
                {sendMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Guardar y Enviar
              </Button>
            </>
          )}
          {mode === 'edit' && (
            <>
              <Button type="button" color="gray" onClick={handleSave} disabled={busy} className="active:scale-[0.98]">
                {updateMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Guardar cambios
              </Button>
              <Button type="button" color="blue" onClick={() => setShowSendConfirm(true)} disabled={busy} className="active:scale-[0.98]">
                {sendMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Enviar
              </Button>
            </>
          )}
          {mode === 'view' && (
            <Button type="button" color="blue" onClick={() => navigate('/quick-retentions')}>
              Volver
            </Button>
          )}
        </div>
      </div>

      {apiError && (
        <Alert color="red" onDismiss={() => setApiError(null)} className="animate-slide-down">
          {apiError}
        </Alert>
      )}

      <div className="animate-fade-up overflow-hidden rounded-lg border border-border-warm bg-surface shadow-card">
        <div className="grid grid-cols-1 gap-3 border-b border-border-warm p-6 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-muted">Establecimiento</label>
            <select
              value={establishmentId}
              onChange={(e) => {
                setEstablishmentId(e.target.value ? Number(e.target.value) : '')
                setEmissionPointId('')
              }}
              disabled={isReadonly}
              className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {(establishments ?? []).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code} - {e.address || e.name || 'Establecimiento'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-muted">Punto de emisión</label>
            <select
              value={emissionPointId}
              onChange={(e) => setEmissionPointId(e.target.value ? Number(e.target.value) : '')}
              disabled={isReadonly}
              className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {(emissionPoints ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-muted">Serie (prevista)</label>
            <div className="rounded-md border border-border-warm bg-surface-2 px-3 py-2 font-mono text-[13px] text-muted">
              {retention
                ? `${retention.series}-${retention.sequential}`
                : establishment && emissionPoint
                  ? `${establishment.code}-${emissionPoint.code}-000000001`
                  : '—'}
            </div>
          </div>
        </div>

        <div className="border-b border-border-warm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Sujeto retenido</h3>
            {isReadonly ? (
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-faint">
                <span className="font-medium text-muted">
                  {tipoIdentificacion} · {identificacion}
                </span>
                <span className="text-muted">{razonSocial}</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={customerId}
                  onChange={(e) => {
                    const value = e.target.value
                    const cust = customers.find((c) => c.id === Number(value))
                    if (value === '') {
                      setCustomerId('')
                    } else if (cust) {
                      applyCustomer(cust)
                    }
                  }}
                  disabled={isReadonly}
                  className="rounded-md border border-border-warm bg-canvas px-3 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
                >
                  <option value="">Cliente o libre...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.identification_number}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-muted">Tipo de documento</label>
              <select
                value={tipoIdentificacion}
                onChange={(e) => setTipoIdentificacion(e.target.value)}
                disabled={isReadonly}
                className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
              >
                {Object.entries(IDENTIFICATION_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-muted">Identificación</label>
              <input
                type="text"
                value={identificacion}
                maxLength={maxIdLength(tipoIdentificacion)}
                onChange={(e) => setIdentificacion(e.target.value)}
                disabled={isReadonly}
                className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-muted">Razón social</label>
              <input
                type="text"
                value={razonSocial}
                maxLength={150}
                onChange={(e) => setRazonSocial(e.target.value)}
                disabled={isReadonly}
                className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-muted">Periodo fiscal</label>
              <input
                type="text"
                value={periodoFiscal}
                placeholder="mm/yyyy"
                onChange={(e) => setPeriodoFiscal(e.target.value)}
                disabled={isReadonly}
                className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="mb-1 block text-[12px] font-medium text-muted">Dirección</label>
              <input
                type="text"
                value={direccion}
                maxLength={300}
                onChange={(e) => setDireccion(e.target.value)}
                disabled={isReadonly}
                className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-border-warm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Líneas de retención</h3>
            {!isReadonly && (
              <button
                type="button"
                onClick={addDetail}
                className="rounded-md border border-border-warm px-3 py-1 text-[12px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
              >
                + Agregar retención
              </button>
            )}
          </div>

          {details.length === 0 ? (
            <p className="mt-3 text-[12px] text-faint">
              {isReadonly ? 'Sin líneas de retención' : 'Agregue al menos una retención para este comprobante.'}
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {details.map((d, index) => (
                <RetentionDetailEditor
                  key={d.key}
                  detail={d}
                  index={index}
                  configs={retentionConfigs}
                  readonly={isReadonly}
                  canRemove={details.length > 1}
                  onUpdate={updateDetail}
                  onRemove={removeDetail}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-border-warm p-6 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <label className="mb-1 block text-[12px] font-medium text-muted">Información adicional</label>
              {!isReadonly && (
                <button
                  type="button"
                  onClick={addInfoRow}
                  className="mb-1 rounded-md border border-border-warm px-2 py-0.5 text-[11px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                >
                  + Agregar
                </button>
              )}
            </div>
            {additionalInfo.length === 0 && <p className="text-[12px] text-faint">Sin información adicional</p>}
            <div className="space-y-2">
              {additionalInfo.map((row, index) => (
                <div key={index} className="animate-fade-in flex items-center gap-2">
                  <input
                    type="text"
                    value={row.clave}
                    onChange={(e) => updateInfoRow(index, { clave: e.target.value })}
                    disabled={isReadonly}
                    placeholder="Clave"
                    className="w-1/2 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                  />
                  <input
                    type="text"
                    value={row.valor}
                    onChange={(e) => updateInfoRow(index, { valor: e.target.value })}
                    disabled={isReadonly}
                    placeholder="Valor"
                    className="w-1/2 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                  />
                  {!isReadonly && (
                    <button
                      type="button"
                      onClick={() => removeInfoRow(index)}
                      className="rounded-md px-2 py-1 text-[13px] font-medium text-danger transition-colors duration-150 hover:bg-danger/10"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        onConfirm={() => {
          setShowSendConfirm(false)
          handleSend()
        }}
        title="Enviar al SRI"
        message="¿Está seguro de que desea enviar esta retención al SRI?"
        confirmLabel="Enviar"
        confirmColor="blue"
        loading={sendMutation.isPending}
      />
    </div>
  )
}