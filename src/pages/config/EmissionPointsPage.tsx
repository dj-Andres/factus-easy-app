import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Alert,
  Button,
  HelperText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from 'flowbite-react'
import { z } from 'zod'
import { useAuthStore } from '../../stores/authStore'
import {
  useCreateEmissionPoint,
  useEmissionPoints,
  useToggleEmissionPoint,
  useUpdateEmissionPoint,
  useUpdateEmissionPointSequential,
} from '../../hooks/useEmissionPoints'
import { useEstablishments } from '../../hooks/useEstablishments'
import { toErrorMessage } from '../../lib/errors'
import Badge from '../../components/ui/Badge'
import type { CompanyEmissionPoint } from '../../types/api'

const emissionPointSchema = z.object({
  establishment_id: z.string().min(1, 'El establecimiento es obligatorio'),
  code: z.string().regex(/^\d{3}$/, 'Debe tener exactamente 3 dígitos'),
  description: z.string().min(1, 'La descripción es obligatoria').max(255, 'Máximo 255 caracteres'),
})

type EmissionPointFormValues = z.infer<typeof emissionPointSchema>

export default function EmissionPointsPage() {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CompanyEmissionPoint | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const [sequentialTarget, setSequentialTarget] = useState<CompanyEmissionPoint | null>(null)
  const [sequentialValue, setSequentialValue] = useState('')

  const { data: emissionPoints, isPending, error } = useEmissionPoints(selectedRuc)
  const { data: establishments } = useEstablishments(selectedRuc)
  const createMutation = useCreateEmissionPoint()
  const updateMutation = useUpdateEmissionPoint()
  const toggleMutation = useToggleEmissionPoint()
  const sequentialMutation = useUpdateEmissionPointSequential()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmissionPointFormValues>({
    resolver: zodResolver(emissionPointSchema),
    defaultValues: { establishment_id: '', code: '', description: '' },
  })

  useEffect(() => {
    if (showForm) {
      reset({
        establishment_id: editing ? String(editing.establishment_id) : '',
        code: editing?.code ?? '',
        description: editing?.description ?? '',
      })
      setApiError(null)
    }
  }, [showForm, editing, reset])

  const establishmentName = (id: number) =>
    establishments?.find((e) => e.id === id)?.name ?? `Est. ${id}`

  const openCreate = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (point: CompanyEmissionPoint) => {
    setEditing(point)
    setShowForm(true)
  }

  const onSubmit = (values: EmissionPointFormValues) => {
    if (!selectedRuc) return
    setApiError(null)
    const payload = {
      establishment_id: Number(values.establishment_id),
      code: values.code,
      description: values.description,
    }
    const onSuccess = () => setShowForm(false)
    const onError = (err: unknown) => setApiError(toErrorMessage(err))
    if (editing) {
      updateMutation.mutate({ ruc: selectedRuc, id: editing.id, data: payload }, { onSuccess, onError })
    } else {
      createMutation.mutate({ ruc: selectedRuc, data: payload }, { onSuccess, onError })
    }
  }

  const openSequential = (point: CompanyEmissionPoint) => {
    setSequentialTarget(point)
    setSequentialValue(String(point.sequential))
  }

  const submitSequential = () => {
    if (!selectedRuc || !sequentialTarget) return
    const value = Number(sequentialValue)
    if (Number.isNaN(value) || value < 0) return
    sequentialMutation.mutate(
      { ruc: selectedRuc, id: sequentialTarget.id, sequential: value },
      { onSuccess: () => setSequentialTarget(null) },
    )
  }

  const handleToggle = (point: CompanyEmissionPoint) => {
    if (!selectedRuc) return
    toggleMutation.mutate({ ruc: selectedRuc, id: point.id })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Puntos de Emisión</h1>
          <p className="mt-1 text-sm text-muted">Secuenciales por establecimiento</p>
        </div>
        <Button color="blue" onClick={openCreate}>
          Nuevo Punto de Emisión
        </Button>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface shadow-card">
        {error && (
          <div className="px-4 pt-4">
            <Alert color="red">No se pudieron cargar los puntos de emisión</Alert>
          </div>
        )}

        {isPending ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" color="info" />
          </div>
        ) : !emissionPoints || emissionPoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-sm text-faint">No hay puntos de emisión registrados</span>
            <button
              type="button"
              onClick={openCreate}
              className="mt-2 text-sm font-medium text-accent hover:text-accent-hover"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Establecimiento</TableHeadCell>
                <TableHeadCell>Código</TableHeadCell>
                <TableHeadCell>Descripción</TableHeadCell>
                <TableHeadCell>Secuencial</TableHeadCell>
                <TableHeadCell>Estado</TableHeadCell>
                <TableHeadCell className="w-56 text-right">Acciones</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emissionPoints.map((point) => (
                <TableRow key={point.id} className="bg-surface">
                  <TableCell className="text-muted">{establishmentName(point.establishment_id)}</TableCell>
                  <TableCell className="font-mono text-[13px] text-ink">{point.code}</TableCell>
                  <TableCell className="font-medium text-ink">{point.description}</TableCell>
                  <TableCell className="font-mono text-[13px] text-ink">{point.sequential}</TableCell>
                  <TableCell>
                    <Badge tone={point.status === 'ACTIVE' ? 'green' : 'gray'}>
                      {point.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openSequential(point)}
                        className="rounded-md px-2 py-1 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2"
                      >
                        Secuencial
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(point)}
                        className="rounded-md px-2 py-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(point)}
                        className="rounded-md px-2 py-1 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2"
                      >
                        {point.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal
        show={showForm}
        onClose={() => setShowForm(false)}
        size="md"
        className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
      >
        <ModalHeader className="border-border-warm">
          {editing ? 'Editar Punto de Emisión' : 'Nuevo Punto de Emisión'}
        </ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ModalBody className="p-4 sm:p-6">
            {apiError && (
              <Alert color="red" className="mb-4" onDismiss={() => setApiError(null)}>
                {apiError}
              </Alert>
            )}

            <div>
              <div className="mb-2 block">
                <Label htmlFor="establishment_id">Establecimiento</Label>
              </div>
              <Select
                id="establishment_id"
                color={errors.establishment_id ? 'failure' : 'gray'}
                {...register('establishment_id')}
              >
                <option value="">Seleccionar...</option>
                {(establishments ?? []).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code} — {e.name}
                  </option>
                ))}
              </Select>
              {errors.establishment_id?.message && (
                <HelperText color="failure">{errors.establishment_id.message}</HelperText>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="code">Código</Label>
                </div>
                <TextInput
                  id="code"
                  placeholder="001"
                  maxLength={3}
                  color={errors.code ? 'failure' : 'gray'}
                  {...register('code')}
                />
                {errors.code?.message && <HelperText color="failure">{errors.code.message}</HelperText>}
              </div>
              <div className="sm:col-span-2">
                <div className="mb-2 block">
                  <Label htmlFor="description">Descripción</Label>
                </div>
                <TextInput
                  id="description"
                  placeholder="Punto de emisión"
                  color={errors.description ? 'failure' : 'gray'}
                  {...register('description')}
                />
                {errors.description?.message && (
                  <HelperText color="failure">{errors.description.message}</HelperText>
                )}
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="flex-col-reverse gap-2 border-border-warm sm:flex-row sm:justify-end">
            <Button type="button" color="gray" className="w-full sm:w-auto" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              color="blue"
              className="w-full sm:w-auto"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && <Spinner size="sm" className="mr-2" />}
              {editing ? 'Guardar cambios' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal
        show={sequentialTarget !== null}
        onClose={() => setSequentialTarget(null)}
        size="sm"
        className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
      >
        <ModalHeader className="border-border-warm">Actualizar Secuencial</ModalHeader>
        <ModalBody className="p-4 sm:p-6">
          <div className="mb-2 block">
            <Label htmlFor="sequential">Nuevo secuencial</Label>
          </div>
          <TextInput
            id="sequential"
            type="number"
            min="0"
            value={sequentialValue}
            onChange={(e) => setSequentialValue(e.target.value)}
          />
        </ModalBody>
        <ModalFooter className="flex-col-reverse gap-2 border-border-warm sm:flex-row sm:justify-end">
          <Button type="button" color="gray" className="w-full sm:w-auto" onClick={() => setSequentialTarget(null)}>
            Cancelar
          </Button>
          <Button
            color="blue"
            className="w-full sm:w-auto"
            disabled={sequentialMutation.isPending}
            onClick={submitSequential}
          >
            {sequentialMutation.isPending && <Spinner size="sm" className="mr-2" />}
            Guardar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
