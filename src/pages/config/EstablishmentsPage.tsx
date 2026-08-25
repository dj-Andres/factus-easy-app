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
  useCreateEstablishment,
  useEstablishments,
  useToggleEstablishment,
  useUpdateEstablishment,
} from '../../hooks/useEstablishments'
import { toErrorMessage } from '../../lib/errors'
import Badge from '../../components/ui/Badge'
import type { CompanyEstablishment } from '../../types/api'

const establishmentSchema = z.object({
  code: z.string().regex(/^\d{3}$/, 'Debe tener exactamente 3 dígitos'),
  name: z.string().min(1, 'El nombre es obligatorio').max(150, 'Máximo 150 caracteres'),
  address: z.string().min(1, 'La dirección es obligatoria').max(300, 'Máximo 300 caracteres'),
})

type EstablishmentFormValues = z.infer<typeof establishmentSchema>

export default function EstablishmentsPage() {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CompanyEstablishment | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: establishments, isPending, error } = useEstablishments(selectedRuc)
  const createMutation = useCreateEstablishment()
  const updateMutation = useUpdateEstablishment()
  const toggleMutation = useToggleEstablishment()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EstablishmentFormValues>({
    resolver: zodResolver(establishmentSchema),
    defaultValues: { code: '', name: '', address: '' },
  })

  useEffect(() => {
    if (showForm) {
      reset({
        code: editing?.code ?? '',
        name: editing?.name ?? '',
        address: editing?.address ?? '',
      })
      setApiError(null)
    }
  }, [showForm, editing, reset])

  const openCreate = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (establishment: CompanyEstablishment) => {
    setEditing(establishment)
    setShowForm(true)
  }

  const onSubmit = (values: EstablishmentFormValues) => {
    if (!selectedRuc) return
    setApiError(null)
    const payload = { code: values.code, name: values.name, address: values.address }
    const onSuccess = () => setShowForm(false)
    const onError = (err: unknown) => setApiError(toErrorMessage(err))
    if (editing) {
      updateMutation.mutate({ ruc: selectedRuc, id: editing.id, data: payload }, { onSuccess, onError })
    } else {
      createMutation.mutate({ ruc: selectedRuc, data: payload }, { onSuccess, onError })
    }
  }

  const handleToggle = (establishment: CompanyEstablishment) => {
    if (!selectedRuc) return
    toggleMutation.mutate({ ruc: selectedRuc, id: establishment.id })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Establecimientos</h1>
          <p className="mt-1 text-sm text-muted">Sucursales de la empresa</p>
        </div>
        <Button color="blue" onClick={openCreate}>
          Nuevo Establecimiento
        </Button>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface shadow-card">
        {error && (
          <div className="px-4 pt-4">
            <Alert color="red">No se pudieron cargar los establecimientos</Alert>
          </div>
        )}

        {isPending ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" color="info" />
          </div>
        ) : !establishments || establishments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-sm text-faint">No hay establecimientos registrados</span>
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
                <TableHeadCell>Código</TableHeadCell>
                <TableHeadCell>Nombre</TableHeadCell>
                <TableHeadCell>Dirección</TableHeadCell>
                <TableHeadCell>Estado</TableHeadCell>
                <TableHeadCell className="w-40 text-right">Acciones</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {establishments.map((establishment) => (
                <TableRow key={establishment.id} className="bg-surface">
                  <TableCell className="font-mono text-[13px] text-ink">{establishment.code}</TableCell>
                  <TableCell className="font-medium text-ink">{establishment.name}</TableCell>
                  <TableCell className="text-muted">{establishment.address}</TableCell>
                  <TableCell>
                    <Badge tone={establishment.status === 'ACTIVE' ? 'green' : 'gray'}>
                      {establishment.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(establishment)}
                        className="rounded-md px-2 py-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(establishment)}
                        className="rounded-md px-2 py-1 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2"
                      >
                        {establishment.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
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
          {editing ? 'Editar Establecimiento' : 'Nuevo Establecimiento'}
        </ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ModalBody className="p-4 sm:p-6">
            {apiError && (
              <Alert color="red" className="mb-4" onDismiss={() => setApiError(null)}>
                {apiError}
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  <Label htmlFor="name">Nombre</Label>
                </div>
                <TextInput
                  id="name"
                  placeholder="Matriz"
                  color={errors.name ? 'failure' : 'gray'}
                  {...register('name')}
                />
                {errors.name?.message && <HelperText color="failure">{errors.name.message}</HelperText>}
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 block">
                <Label htmlFor="address">Dirección</Label>
              </div>
              <TextInput
                id="address"
                placeholder="Dirección del establecimiento"
                color={errors.address ? 'failure' : 'gray'}
                {...register('address')}
              />
              {errors.address?.message && <HelperText color="failure">{errors.address.message}</HelperText>}
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
    </div>
  )
}
