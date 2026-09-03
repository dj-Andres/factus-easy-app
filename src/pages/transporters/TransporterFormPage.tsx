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
  TextInput,
} from 'flowbite-react'
import { z } from 'zod'
import { useAuthStore } from '../../stores/authStore'
import { useCreateTransporter, useUpdateTransporter } from '../../hooks/useTransporters'
import { toErrorMessage } from '../../lib/errors'
import type { IdentificationType, Transporter, TransporterInput } from '../../types/api'

const ID_TYPE_OPTIONS: { value: IdentificationType; label: string }[] = [
  { value: '04', label: 'Cédula' },
  { value: '05', label: 'RUC' },
  { value: '06', label: 'Pasaporte' },
  { value: '07', label: 'Consumidor Final' },
  { value: '08', label: 'Placa' },
]

const transporterSchema = z.object({
  identification_type: z.enum(['04', '05', '06', '07', '08']),
  identification_number: z
    .string()
    .min(1, 'La identificación es obligatoria')
    .max(20, 'Máximo 20 caracteres'),
  name: z.string().min(1, 'El nombre es obligatorio').max(150, 'Máximo 150 caracteres'),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  address: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
  placa: z
    .string()
    .min(1, 'La placa es obligatoria')
    .regex(/^[A-Za-z]{3}[0-9]{1,7}$/, 'La placa no es valida')
    .max(10, 'Máximo 10 caracteres'),
  rise: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
})

type TransporterFormValues = z.infer<typeof transporterSchema>

interface TransporterFormPageProps {
  isOpen: boolean
  onClose: () => void
  transporter: Transporter | null
  onSaved: () => void
}

export default function TransporterFormPage({ isOpen, onClose, transporter, onSaved }: TransporterFormPageProps) {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)
  const createMutation = useCreateTransporter()
  const updateMutation = useUpdateTransporter()
  const submitting = createMutation.isPending || updateMutation.isPending
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransporterFormValues>({
    resolver: zodResolver(transporterSchema),
    defaultValues: {
      identification_type: '05',
      identification_number: '',
      name: '',
      phone: '',
      address: '',
      placa: '',
      rise: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        identification_type: transporter?.identification_type ?? '05',
        identification_number: transporter?.identification_number ?? '',
        name: transporter?.name ?? '',
        phone: transporter?.phone ?? '',
        address: transporter?.address ?? '',
        placa: transporter?.placa ?? '',
        rise: transporter?.rise ?? '',
      })
      setApiError(null)
    }
  }, [isOpen, transporter, reset])

  const onSubmit = async (values: TransporterFormValues) => {
    if (!selectedRuc) {
      setApiError('No hay una empresa seleccionada')
      return
    }

    const payload: TransporterInput = {
      ruc: selectedRuc,
      identification_type: values.identification_type,
      identification_number: values.identification_number,
      name: values.name,
      phone: values.phone || undefined,
      address: values.address || undefined,
      placa: values.placa,
      rise: values.rise || undefined,
    }

    setApiError(null)
    if (transporter) {
      updateMutation.mutate(
        { id: transporter.id, data: payload },
        { onSuccess: onSaved, onError: (err) => setApiError(toErrorMessage(err)) },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: onSaved,
        onError: (err) => setApiError(toErrorMessage(err)),
      })
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="lg" className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none">
      <ModalHeader className="border-border-warm">
        {transporter ? 'Editar Transportista' : 'Nuevo Transportista'}
      </ModalHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ModalBody className="p-4 sm:p-6">
          {apiError && (
            <Alert color="red" className="mb-4" onDismiss={() => setApiError(null)}>
              {apiError}
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="identification_type">Tipo de identificación</Label>
              </div>
              <Select
                id="identification_type"
                color={errors.identification_type ? 'failure' : 'gray'}
                {...register('identification_type')}
              >
                {ID_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {errors.identification_type?.message && (
                <HelperText color="failure">{errors.identification_type.message}</HelperText>
              )}
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="identification_number">Número de identificación</Label>
              </div>
              <TextInput
                id="identification_number"
                placeholder="1234567890"
                color={errors.identification_number ? 'failure' : 'gray'}
                {...register('identification_number')}
              />
              {errors.identification_number?.message && (
                <HelperText color="failure">{errors.identification_number.message}</HelperText>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 block">
              <Label htmlFor="name">Nombre / Razón social</Label>
            </div>
            <TextInput
              id="name"
              placeholder="Nombre del transportista"
              color={errors.name ? 'failure' : 'gray'}
              {...register('name')}
            />
            {errors.name?.message && <HelperText color="failure">{errors.name.message}</HelperText>}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="phone">Teléfono</Label>
              </div>
              <TextInput
                id="phone"
                placeholder="+593 ..."
                color={errors.phone ? 'failure' : 'gray'}
                {...register('phone')}
              />
              {errors.phone?.message && <HelperText color="failure">{errors.phone.message}</HelperText>}
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="placa">Placa</Label>
              </div>
              <TextInput
                id="placa"
                placeholder="ABC1234"
                color={errors.placa ? 'failure' : 'gray'}
                {...register('placa')}
              />
              {errors.placa?.message && <HelperText color="failure">{errors.placa.message}</HelperText>}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 block">
              <Label htmlFor="address">Dirección</Label>
            </div>
            <TextInput
              id="address"
              placeholder="Dirección del transportista"
              color={errors.address ? 'failure' : 'gray'}
              {...register('address')}
            />
            {errors.address?.message && <HelperText color="failure">{errors.address.message}</HelperText>}
          </div>

          <div className="mt-4">
            <div className="mb-2 block">
              <Label htmlFor="rise">RISE</Label>
            </div>
            <TextInput
              id="rise"
              placeholder="Registro único de contribuyentes (opcional)"
              color={errors.rise ? 'failure' : 'gray'}
              {...register('rise')}
            />
            {errors.rise?.message && <HelperText color="failure">{errors.rise.message}</HelperText>}
          </div>
        </ModalBody>

        <ModalFooter className="flex-col-reverse gap-2 border-border-warm sm:flex-row sm:justify-end">
          <Button type="button" color="gray" className="w-full sm:w-auto" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" color="blue" className="w-full sm:w-auto" disabled={submitting}>
            {submitting && <Spinner size="sm" className="mr-2" />}
            {transporter ? 'Guardar cambios' : 'Crear transportista'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
