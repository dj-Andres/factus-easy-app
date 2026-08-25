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
import { useCreateCompany } from '../../hooks/useCompanyConfig'
import { toErrorMessage } from '../../lib/errors'
import type { CompanyUpdatePayload } from '../../api/company'

const createCompanySchema = z
  .object({
    ruc: z.string().regex(/^\d{13}$/, 'El RUC debe tener exactamente 13 dígitos'),
    name: z.string().min(3, 'Mínimo 3 caracteres').max(150, 'Máximo 150 caracteres'),
    business_name: z.string().min(3, 'Mínimo 3 caracteres').max(250, 'Máximo 250 caracteres'),
    address: z.string().min(1, 'La dirección es obligatoria').max(150, 'Máximo 150 caracteres'),
    phone: z.string().min(1, 'El teléfono es obligatorio').max(15, 'Máximo 15 caracteres'),
    email: z.string().min(1, 'El email es obligatorio').email('Email inválido').max(100, 'Máximo 100 caracteres'),
    accounting_required: z.enum(['YES', 'NO']),
    special_taxpayer: z.enum(['YES', 'NO']),
    special_taxpayer_number: z.string().optional().or(z.literal('')),
    large_taxpayer: z.enum(['YES', 'NO']).or(z.literal('')),
    major_taxpayer: z.enum(['YES', 'NO']),
    sri_resolution_code: z.string().optional().or(z.literal('')),
  })
  .superRefine((values, ctx) => {
    if (values.special_taxpayer === 'YES' && !values.special_taxpayer_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['special_taxpayer_number'],
        message: 'Requerido si es contribuyente especial',
      })
    }
    if (values.major_taxpayer === 'YES' && !values.sri_resolution_code) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sri_resolution_code'],
        message: 'Requerido si es agente de retención',
      })
    }
  })

type CreateCompanyFormValues = z.infer<typeof createCompanySchema>

interface CreateCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (ruc: string) => void
}

const emptyValues: CreateCompanyFormValues = {
  ruc: '',
  name: '',
  business_name: '',
  address: '',
  phone: '',
  email: '',
  accounting_required: 'NO',
  special_taxpayer: 'NO',
  special_taxpayer_number: '',
  large_taxpayer: '',
  major_taxpayer: 'NO',
  sri_resolution_code: '',
}

export default function CreateCompanyModal({ isOpen, onClose, onCreated }: CreateCompanyModalProps) {
  const setSelectedRuc = useAuthStore((state) => state.setSelectedRuc)
  const createMutation = useCreateCompany()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (isOpen) {
      reset(emptyValues)
      setApiError(null)
    }
  }, [isOpen, reset])

  const onSubmit = (values: CreateCompanyFormValues) => {
    setApiError(null)
    const payload: CompanyUpdatePayload = {
      ruc: values.ruc,
      name: values.name,
      business_name: values.business_name,
      address: values.address,
      phone: values.phone,
      email: values.email,
      accounting_required: values.accounting_required,
      special_taxpayer: values.special_taxpayer,
      special_taxpayer_number: values.special_taxpayer_number || undefined,
      large_taxpayer: values.large_taxpayer || undefined,
      major_taxpayer: values.major_taxpayer,
      sri_resolution_code: values.sri_resolution_code || undefined,
    }
    createMutation.mutate(payload, {
      onSuccess: () => {
        setSelectedRuc(payload.ruc)
        onCreated(payload.ruc)
      },
      onError: (err) => setApiError(toErrorMessage(err)),
    })
  }

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      size="3xl"
      className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
    >
      <ModalHeader className="border-border-warm">Nueva Empresa</ModalHeader>
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
                <Label htmlFor="ruc">RUC</Label>
              </div>
              <TextInput
                id="ruc"
                placeholder="13 dígitos"
                maxLength={13}
                color={errors.ruc ? 'failure' : 'gray'}
                {...register('ruc')}
              />
              {errors.ruc?.message && <HelperText color="failure">{errors.ruc.message}</HelperText>}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="name">Nombre comercial</Label>
              </div>
              <TextInput id="name" color={errors.name ? 'failure' : 'gray'} {...register('name')} />
              {errors.name?.message && <HelperText color="failure">{errors.name.message}</HelperText>}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="business_name">Razón social</Label>
              </div>
              <TextInput
                id="business_name"
                color={errors.business_name ? 'failure' : 'gray'}
                {...register('business_name')}
              />
              {errors.business_name?.message && (
                <HelperText color="failure">{errors.business_name.message}</HelperText>
              )}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email">Email</Label>
              </div>
              <TextInput id="email" type="email" color={errors.email ? 'failure' : 'gray'} {...register('email')} />
              {errors.email?.message && <HelperText color="failure">{errors.email.message}</HelperText>}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="phone">Teléfono</Label>
              </div>
              <TextInput id="phone" color={errors.phone ? 'failure' : 'gray'} {...register('phone')} />
              {errors.phone?.message && <HelperText color="failure">{errors.phone.message}</HelperText>}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="address">Dirección</Label>
              </div>
              <TextInput id="address" color={errors.address ? 'failure' : 'gray'} {...register('address')} />
              {errors.address?.message && <HelperText color="failure">{errors.address.message}</HelperText>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="accounting_required">Obligado a llevar contabilidad</Label>
              </div>
              <Select id="accounting_required" {...register('accounting_required')}>
                <option value="NO">No</option>
                <option value="YES">Sí</option>
              </Select>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="special_taxpayer">Contribuyente especial</Label>
              </div>
              <Select id="special_taxpayer" {...register('special_taxpayer')}>
                <option value="NO">No</option>
                <option value="YES">Sí</option>
              </Select>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="major_taxpayer">Agente de retención</Label>
              </div>
              <Select id="major_taxpayer" {...register('major_taxpayer')}>
                <option value="NO">No</option>
                <option value="YES">Sí</option>
              </Select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="special_taxpayer_number">Número de contribuyente especial</Label>
              </div>
              <TextInput
                id="special_taxpayer_number"
                color={errors.special_taxpayer_number ? 'failure' : 'gray'}
                {...register('special_taxpayer_number')}
              />
              {errors.special_taxpayer_number?.message && (
                <HelperText color="failure">{errors.special_taxpayer_number.message}</HelperText>
              )}
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="sri_resolution_code">Resolución SRI</Label>
              </div>
              <TextInput
                id="sri_resolution_code"
                color={errors.sri_resolution_code ? 'failure' : 'gray'}
                {...register('sri_resolution_code')}
              />
              {errors.sri_resolution_code?.message && (
                <HelperText color="failure">{errors.sri_resolution_code.message}</HelperText>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex-col-reverse gap-2 border-border-warm sm:flex-row sm:justify-end">
          <Button type="button" color="gray" className="w-full sm:w-auto" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" color="blue" className="w-full sm:w-auto" disabled={createMutation.isPending}>
            {createMutation.isPending && <Spinner size="sm" className="mr-2" />}
            Crear empresa
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
