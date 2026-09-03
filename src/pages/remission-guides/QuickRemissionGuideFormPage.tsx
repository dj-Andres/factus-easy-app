import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Spinner } from 'flowbite-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCompany } from '../../hooks/useCompany'
import { useEstablishments } from '../../hooks/useEstablishments'
import { useEmissionPoints } from '../../hooks/useEmissionPoints'
import { getTransporters } from '../../api/transporters'
import {
  useQuickRemissionGuide,
  useCreateQuickRemissionGuide,
  useUpdateQuickRemissionGuide,
  useSendQuickRemissionGuide,
} from '../../hooks/useQuickRemissionGuides'
import { getProducts } from '../../api/products'
import { remissionGuideStatusLabel, remissionGuideStatusTone } from '../../lib/quickRemissionGuides'
import { toErrorMessage } from '../../lib/errors'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import TransportDetails from './components/TransportDetails'
import DestinatarioEditor from './components/DestinatarioEditor'
import GuideFooter from './components/GuideFooter'
import {
  buildDestinatarioPayload,
  type FormDestinatario,
  type FormGuideItem,
  type InfoRow,
} from './remissionGuideForm'
import type { Product, QuickRemissionGuideInput } from '../../types/api'

function dateString(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export default function QuickRemissionGuideFormPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const selectedRuc = useAuthStore((state) => state.selectedRuc)
  const { selectedCompany, isLoading: companyLoading } = useCompany()

  const guideId = id ? Number(id) : null
  const mode: 'create' | 'edit' | 'view' = guideId
    ? location.pathname.endsWith('/edit')
      ? 'edit'
      : 'view'
    : 'create'
  const isReadonly = mode === 'view'

  const keyCounter = useRef(1)
  const nextKey = () => `k-${keyCounter.current++}`

  const { data: establishments, isPending: establishmentsLoading } = useEstablishments(selectedRuc)
  const { data: guide, isPending: guideLoading } = useQuickRemissionGuide(selectedRuc, guideId)

  const [establishmentId, setEstablishmentId] = useState<number | ''>('')
  const [emissionPointId, setEmissionPointId] = useState<number | ''>('')
  const [transporterId, setTransporterId] = useState<number | ''>('')
  const [dirPartida, setDirPartida] = useState('')
  const [placa, setPlaca] = useState('')
  const [fechaIni, setFechaIni] = useState(() => dateString())
  const [fechaFin, setFechaFin] = useState(() => dateString())
  const [additionalInfo, setAdditionalInfo] = useState<InfoRow[]>([])
  const [destinatarios, setDestinatarios] = useState<FormDestinatario[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [showSendConfirm, setShowSendConfirm] = useState(false)

  const { data: emissionPoints, isPending: emissionPointsLoading } = useEmissionPoints(selectedRuc, establishmentId || undefined)

  const transportersQuery = useQuery({
    queryKey: ['transporters', 'all', selectedRuc],
    queryFn: () => getTransporters({ ruc: selectedRuc!, per_page: 500 }),
    enabled: !!selectedRuc,
  })

  const productsQuery = useQuery({
    queryKey: ['products', 'all', selectedRuc],
    queryFn: () => getProducts({ ruc: selectedRuc!, per_page: 500 }),
    enabled: !!selectedRuc,
  })

  const transporters = transportersQuery.data?.data ?? []
  const products = productsQuery.data?.data ?? []

  const createMutation = useCreateQuickRemissionGuide()
  const updateMutation = useUpdateQuickRemissionGuide()
  const sendMutation = useSendQuickRemissionGuide()

  const productsById = new Map<number, Product>()
  for (const p of products) productsById.set(p.id, p)

  const mapGuideItem = (i: {
    product_id: number
    cantidad: number
    descripcion: string
    codigo_interno: string | null
    codigo_adicional: string | null
    detalles_adicionales: unknown
  }): FormGuideItem => ({
    key: nextKey(),
    productId: i.product_id,
    cantidad: String(i.cantidad),
    descripcion: i.descripcion,
    codigoInterno: i.codigo_interno ?? '',
    codigoAdicional: i.codigo_adicional ?? '',
    detallesAdicionales:
      Array.isArray(i.detalles_adicionales) && i.detalles_adicionales.length > 0
        ? (i.detalles_adicionales as { nombre: string; valor: string }[])
        : [],
  })

  useEffect(() => {
    if (!guide) return
    setEstablishmentId(guide.establishment_id)
    setEmissionPointId(guide.emission_point_id)
    setTransporterId(guide.transportista?.id ?? '')
    setDirPartida(guide.dir_partida)
    setPlaca(guide.placa)
    setFechaIni(guide.fecha_ini_transporte)
    setFechaFin(guide.fecha_fin_transporte)
    setAdditionalInfo(
      Object.entries(guide.additional_info ?? {}).map(([clave, valor]) => ({ clave, valor })),
    )
    setDestinatarios(
      (guide.destinatarios ?? []).map((d) => ({
        key: nextKey(),
        tipoIdentificacion: d.tipo_identificacion_destinatario ?? '04',
        identificacion: d.identificacion_destinatario,
        razonSocial: d.razon_social_destinatario,
        dirDestinatario: d.dir_destinatario,
        motivoTraslado: d.motivo_traslado,
        docAduaneroUnico: d.doc_aduanero_unico ?? '',
        codEstabDestino: d.cod_estab_destino ?? '',
        ruta: d.ruta ?? '',
        codDocSustento: d.cod_doc_sustento ?? '',
        numDocSustento: d.num_doc_sustento ?? '',
        numAutDocSustento: d.num_aut_doc_sustento ?? '',
        fechaEmisionDocSustento: d.fecha_emision_doc_sustento ?? '',
        items: (d.items ?? []).map(mapGuideItem),
      })),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide])

  useEffect(() => {
    if (guideId) return
    if (establishmentId === '' && establishments && establishments.length > 0) {
      const active = establishments.find((e) => e.status === 'ACTIVE') ?? establishments[0]
      setEstablishmentId(active.id)
    }
  }, [establishments, establishmentId, guideId])

  useEffect(() => {
    if (guideId) return
    if (emissionPoints && emissionPoints.length > 0) {
      const current = emissionPoints.find((p) => p.id === emissionPointId)
      if (!current) {
        const active = emissionPoints.find((p) => p.status === 'ACTIVE') ?? emissionPoints[0]
        setEmissionPointId(active.id)
      }
    }
  }, [emissionPoints, emissionPointId, guideId])

  const selectedTransporter = transporters.find((t) => t.id === transporterId) ?? null

  const handleTransporterChange = (id: number | '') => {
    setTransporterId(id)
    if (id !== '') {
      const t = transporters.find((x) => x.id === id)
      if (t) setPlaca(t.placa)
    }
  }

  const addDestinatario = () => {
    setDestinatarios((prev) => [
      ...prev,
      {
        key: nextKey(),
        tipoIdentificacion: '04',
        identificacion: '',
        razonSocial: '',
        dirDestinatario: '',
        motivoTraslado: '',
        docAduaneroUnico: '',
        codEstabDestino: '',
        ruta: '',
        codDocSustento: '',
        numDocSustento: '',
        numAutDocSustento: '',
        fechaEmisionDocSustento: '',
        items: [{ key: nextKey(), productId: '', cantidad: '1', descripcion: '' }],
      },
    ])
  }

  const updateDestinatario = (key: string, patch: Partial<FormDestinatario>) => {
    setDestinatarios((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)))
  }

  const removeDestinatario = (key: string) => {
    setDestinatarios((prev) => prev.filter((d) => d.key !== key))
  }

  const addItem = (destKey: string) => {
    setDestinatarios((prev) =>
      prev.map((d) =>
        d.key === destKey
          ? {
              ...d,
              items: [...d.items, { key: nextKey(), productId: '', cantidad: '1', descripcion: '' }],
            }
          : d,
      ),
    )
  }

  const updateItem = (destKey: string, itemKey: string, patch: Record<string, unknown>) => {
    setDestinatarios((prev) =>
      prev.map((d) =>
        d.key === destKey
          ? {
              ...d,
              items: d.items.map((i) => (i.key === itemKey ? ({ ...i, ...patch } as FormGuideItem) : i)),
            }
          : d,
      ),
    )
  }

  const removeItem = (destKey: string, itemKey: string) => {
    setDestinatarios((prev) =>
      prev.map((d) => (d.key === destKey ? { ...d, items: d.items.filter((i) => i.key !== itemKey) } : d)),
    )
  }

  const addInfoRow = () => setAdditionalInfo((prev) => [...prev, { clave: '', valor: '' }])
  const updateInfoRow = (index: number, patch: Partial<InfoRow>) =>
    setAdditionalInfo((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  const removeInfoRow = (index: number) => setAdditionalInfo((prev) => prev.filter((_, i) => i !== index))

  const establishment = establishments?.find((e) => e.id === establishmentId) ?? null
  const emissionPoint = emissionPoints?.find((p) => p.id === emissionPointId) ?? null

  const buildPayload = (): QuickRemissionGuideInput | null => {
    if (!selectedRuc || establishmentId === '' || emissionPointId === '' || transporterId === '') {
      setApiError('Debe seleccionar establecimiento, punto de emisión y transportista.')
      return null
    }
    if (dirPartida.trim() === '') {
      setApiError('Debe indicar la dirección de partida.')
      return null
    }
    if (placa.trim() === '') {
      setApiError('Debe indicar la placa del vehículo.')
      return null
    }
    if (fechaIni === '' || fechaFin === '') {
      setApiError('Debe indicar las fechas de inicio y fin del transporte.')
      return null
    }
    const destinatariosPayload = destinatarios
      .map((d) => buildDestinatarioPayload(d, productsById))
      .filter((d): d is NonNullable<typeof d> => d !== null)

    if (destinatariosPayload.length === 0) {
      setApiError('Debe agregar al menos un destinatario con artículos.')
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
      transportista_id: Number(transporterId),
      dir_partida: dirPartida.trim(),
      placa: placa.trim().toUpperCase(),
      fecha_ini_transporte: fechaIni,
      fecha_fin_transporte: fechaFin,
      destinatarios: destinatariosPayload,
      additional_info: Object.keys(infoRecord).length > 0 ? infoRecord : undefined,
      emission_date: dateString(),
    }
  }

  const handleSave = () => {
    setApiError(null)
    const payload = buildPayload()
    if (!payload) return

    const onSuccess = () => navigate('/quick-remission-guides')
    const onError = (err: unknown) => setApiError(toErrorMessage(err))

    if (mode === 'edit' && guideId) {
      updateMutation.mutate({ id: guideId, data: payload }, { onSuccess, onError })
    } else {
      createMutation.mutate(payload, { onSuccess, onError })
    }
  }

  const handleSend = () => {
    if (!selectedRuc || !guideId) return
    setApiError(null)

    const doSend = () =>
      sendMutation.mutate(
        { id: guideId, ruc: selectedRuc },
        {
          onSuccess: () => navigate('/quick-remission-guides'),
          onError: (err) => setApiError(toErrorMessage(err)),
        },
      )

    if (mode === 'edit') {
      const payload = buildPayload()
      if (!payload) return
      updateMutation.mutate({ id: guideId, data: payload }, {
        onSuccess: doSend,
        onError: (err) => setApiError(toErrorMessage(err)),
      })
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
            onSuccess: () => navigate('/quick-remission-guides'),
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
    transportersQuery.isPending ||
    productsQuery.isPending ||
    (guideId !== null && guideLoading)

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" color="info" />
      </div>
    )
  }

  if (guideId && !guide) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-sm text-muted">No se encontró la guía de remisión</span>
        <button
          type="button"
          onClick={() => navigate('/quick-remission-guides')}
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
              onClick={() => navigate('/quick-remission-guides')}
              className="text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              ← Volver
            </button>
            {guide && (
              <Badge tone={remissionGuideStatusTone(guide.status, guide.document_status)}>
                {remissionGuideStatusLabel(guide.status, guide.document_status)}
              </Badge>
            )}
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            {mode === 'create'
              ? 'Nueva Guía de Remisión'
              : mode === 'edit'
                ? 'Editar Guía de Remisión'
                : 'Detalle de Guía de Remisión'}
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
            <Button type="button" color="blue" onClick={() => navigate('/quick-remission-guides')}>
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
              {guide
                ? `${guide.series}-${guide.sequential}`
                : establishment && emissionPoint
                  ? `${establishment.code}-${emissionPoint.code}-000000001`
                  : '—'}
            </div>
          </div>
        </div>

        <TransportDetails
          transporters={transporters}
          transporterId={transporterId}
          selectedTransporter={selectedTransporter}
          dirEstablecimiento={selectedCompany?.address ?? ''}
          dirPartida={dirPartida}
          placa={placa}
          fechaIni={fechaIni}
          fechaFin={fechaFin}
          readonly={isReadonly}
          onTransporterChange={handleTransporterChange}
          onDirPartidaChange={setDirPartida}
          onPlacaChange={setPlaca}
          onFechaIniChange={setFechaIni}
          onFechaFinChange={setFechaFin}
        />

        <div className="border-b border-border-warm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Destinatarios</h3>
            {!isReadonly && (
              <button
                type="button"
                onClick={addDestinatario}
                className="rounded-md border border-border-warm px-3 py-1 text-[12px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
              >
                + Agregar destinatario
              </button>
            )}
          </div>

          {destinatarios.length === 0 ? (
            <p className="mt-3 text-[12px] text-faint">
              {isReadonly ? 'Sin destinatarios' : 'Agregue al menos un destinatario para esta guía.'}
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {destinatarios.map((d, index) => (
                <DestinatarioEditor
                  key={d.key}
                  destinatario={d}
                  index={index}
                  products={products}
                  productsById={productsById}
                  ruc={selectedRuc!}
                  readonly={isReadonly}
                  canRemove={destinatarios.length > 1}
                  onUpdate={updateDestinatario}
                  onRemove={removeDestinatario}
                  onAddItem={addItem}
                  onUpdateItem={updateItem}
                  onRemoveItem={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        <GuideFooter
          additionalInfo={additionalInfo}
          readonly={isReadonly}
          onAddInfoRow={addInfoRow}
          onUpdateInfoRow={updateInfoRow}
          onRemoveInfoRow={removeInfoRow}
        />
      </div>

      <ConfirmModal
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        onConfirm={() => {
          setShowSendConfirm(false)
          handleSend()
        }}
        title="Enviar al SRI"
        message="¿Está seguro de que desea enviar esta guía de remisión al SRI?"
        confirmLabel="Enviar"
        confirmColor="blue"
        loading={sendMutation.isPending}
      />
    </div>
  )
}
