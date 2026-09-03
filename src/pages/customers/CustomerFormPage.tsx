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
import { useCreateCustomer, useUpdateCustomer } from '../../hooks/useCustomers'
import { toErrorMessage } from '../../lib/errors'
import type { Customer, CustomerInput, IdentificationType } from '../../types/api'

const ID_TYPE_OPTIONS: { value: IdentificationType; label: string }[] = [
  { value: '04', label: 'RUC' },
  { value: '05', label: 'Cédula' },
  { value: '06', label: 'Pasaporte' },
  { value: '07', label: 'Consumidor Final' },
  { value: '08', label: 'Placa' },
]

const customerSchema = z
  .object({
    identification_type: z.enum(['04', '05', '06', '07', '08']),
    identification_number: z
      .string()
      .min(1, 'La identificación es obligatoria')
      .max(20, 'Máximo 20 caracteres'),
    name: z.string().min(1, 'El nombre es obligatorio').max(150, 'Máximo 150 caracteres'),
    email: z
      .string()
      .email('Email inválido')
      .max(255, 'Máximo 255 caracteres')
      .optional()
      .or(z.literal('')),
    phone: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
    address: z.string().min(1, 'La dirección es obligatoria').max(300, 'Máximo 300 caracteres'),
  })
  .superRefine((values, ctx) => {
    if (values.identification_number === '9999999999999' && values.identification_type !== '07') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identification_type'],
        message: 'Consumidor final debe usar el tipo "Consumidor Final" (07)',
      })
    }
  })

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerFormPageProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onSaved: () => void
}

export default function CustomerFormPage({ isOpen, onClose, customer, onSaved }: CustomerFormPageProps) {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
  const submitting = createMutation.isPending || updateMutation.isPending
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      identification_type: '05',
      identification_number: '',
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        identification_type: customer?.identification_type ?? '05',
        identification_number: customer?.identification_number ?? '',
        name: customer?.name ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? '',
        address: customer?.address ?? '',
      })
      setApiError(null)
    }
  }, [isOpen, customer, reset])

  const identificationType = watch('identification_type')
  const isConsumidorFinal = identificationType === '07'

  useEffect(() => {
    if (identificationType === '07') {
      setValue('identification_number', '9999999999999', { shouldValidate: true })
      setValue('name', 'CONSUMIDOR FINAL', { shouldValidate: true })
      setValue('address', 'N/A', { shouldValidate: true })
    } else {
      if (getValues('identification_number') === '9999999999999') {
        setValue('identification_number', '')
      }
      if (getValues('name') === 'CONSUMIDOR FINAL') {
        setValue('name', '')
      }
      if (getValues('address') === 'N/A') {
        setValue('address', '')
      }
    }
  }, [identificationType, setValue, getValues])

  const onSubmit = async (values: CustomerFormValues) => {
    if (!selectedRuc) {
      setApiError('No hay una empresa seleccionada')
      return
    }

    const payload: CustomerInput = {
      ruc: selectedRuc,
      identification_type: values.identification_type,
      identification_number: values.identification_number,
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address,
    }

    setApiError(null)
    if (customer) {
      updateMutation.mutate(
        { id: customer.id, data: payload },
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
        {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
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
              {isConsumidorFinal && (
                <HelperText>Los datos se completan automáticamente</HelperText>
              )}
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="identification_number">Número de identificación</Label>
              </div>
              <TextInput
                id="identification_number"
                placeholder="1234567890"
                readOnly={isConsumidorFinal}
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
              placeholder="Nombre del cliente"
              readOnly={isConsumidorFinal}
              color={errors.name ? 'failure' : 'gray'}
              {...register('name')}
            />
            {errors.name?.message && <HelperText color="failure">{errors.name.message}</HelperText>}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email">Email</Label>
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="cliente@email.com"
                color={errors.email ? 'failure' : 'gray'}
                {...register('email')}
              />
              {errors.email?.message && <HelperText color="failure">{errors.email.message}</HelperText>}
            </div>

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
          </div>

          <div className="mt-4">
            <div className="mb-2 block">
              <Label htmlFor="address">Dirección</Label>
            </div>
            <TextInput
              id="address"
              placeholder="Dirección del cliente"
              readOnly={isConsumidorFinal}
              color={errors.address ? 'failure' : 'gray'}
              {...register('address')}
            />
            {errors.address?.message && <HelperText color="failure">{errors.address.message}</HelperText>}
          </div>
        </ModalBody>

        <ModalFooter className="flex-col-reverse gap-2 border-border-warm sm:flex-row sm:justify-end">
          <Button type="button" color="gray" className="w-full sm:w-auto" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" color="blue" className="w-full sm:w-auto" disabled={submitting}>
            {submitting && <Spinner size="sm" className="mr-2" />}
            {customer ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
