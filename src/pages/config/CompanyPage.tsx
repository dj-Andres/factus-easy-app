import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert, Button, HelperText, Label, Select, Spinner, TextInput } from 'flowbite-react'
import { z } from 'zod'
import { useAuthStore } from '../../stores/authStore'
import { useCompanies, useUpdateCompany, useUploadCertificate, useUploadLogo } from '../../hooks/useCompanyConfig'
import { toErrorMessage } from '../../lib/errors'
import Badge from '../../components/ui/Badge'
import CompanySelector from '../../components/layout/CompanySelector'
import CreateCompanyModal from './CreateCompanyModal'
import type { CompanyUpdatePayload } from '../../api/company'

const companySchema = z
  .object({
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

type CompanyFormValues = z.infer<typeof companySchema>

export default function CompanyPage() {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)
  const { data: companies, isPending } = useCompanies()
  const company = companies?.find((c) => c.ruc === selectedRuc) ?? null

  const updateMutation = useUpdateCompany()
  const certMutation = useUploadCertificate()
  const logoMutation = useUploadLogo()

  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const [certFile, setCertFile] = useState<File | null>(null)
  const [certPassword, setCertPassword] = useState('')
  const [certError, setCertError] = useState<string | null>(null)
  const [certDone, setCertDone] = useState(false)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [logoDone, setLogoDone] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
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
    },
  })

  useEffect(() => {
    if (company) {
      reset({
        name: company.name ?? '',
        business_name: company.business_name ?? '',
        address: company.address ?? '',
        phone: company.phone ?? '',
        email: company.email ?? '',
        accounting_required: company.accounting_required === 'YES' ? 'YES' : 'NO',
        special_taxpayer: company.special_taxpayer === 'YES' ? 'YES' : 'NO',
        special_taxpayer_number: company.special_taxpayer_number ?? '',
        large_taxpayer: company.large_taxpayer === 'YES' ? 'YES' : company.large_taxpayer === 'NO' ? 'NO' : '',
        major_taxpayer: company.major_taxpayer === 'YES' ? 'YES' : 'NO',
        sri_resolution_code: company.sri_resolution_code ?? '',
      })
      setSaved(false)
    }
  }, [company, reset])

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" color="info" />
      </div>
    )
  }

  if (!company) {
    return <div className="py-24 text-center text-sm text-faint">No hay empresa seleccionada</div>
  }

  const onSubmit = (values: CompanyFormValues) => {
    if (!selectedRuc) return
    setSaveError(null)
    setSaved(false)
    const payload: CompanyUpdatePayload = {
      ruc: selectedRuc,
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
    updateMutation.mutate(
      { ruc: selectedRuc, data: payload },
      {
        onSuccess: () => setSaved(true),
        onError: (err) => setSaveError(toErrorMessage(err)),
      },
    )
  }

  const submitCertificate = () => {
    if (!selectedRuc || !certFile || !certPassword) return
    setCertError(null)
    setCertDone(false)
    certMutation.mutate(
      { ruc: selectedRuc, file: certFile, password: certPassword },
      {
        onSuccess: () => {
          setCertFile(null)
          setCertPassword('')
          setCertDone(true)
        },
        onError: (err) => setCertError(toErrorMessage(err)),
      },
    )
  }

  const submitLogo = () => {
    if (!selectedRuc || !logoFile) return
    setLogoError(null)
    setLogoDone(false)
    logoMutation.mutate(
      { ruc: selectedRuc, file: logoFile },
      {
        onSuccess: () => {
          setLogoFile(null)
          setLogoDone(true)
        },
        onError: (err) => setLogoError(toErrorMessage(err)),
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Configuración de Empresa</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <CompanySelector />
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-md border border-border-warm px-3 py-1.5 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
            >
              + Nueva empresa
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {company.environment && (
            <Badge tone={company.environment === 'production' ? 'green' : 'orange'}>
              {company.environment === 'production' ? 'Producción' : 'Pruebas'}
            </Badge>
          )}
          <Badge tone={company.status === 'ACTIVE' ? 'green' : 'gray'}>
            {company.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink">Datos de la empresa</h2>
        {saveError && (
          <Alert color="red" className="mt-4" onDismiss={() => setSaveError(null)}>
            {saveError}
          </Alert>
        )}
        {saved && (
          <Alert color="green" className="mt-4">
            Datos guardados correctamente
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div className="sm:col-span-2">
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

          <div className="mt-6">
            <Button type="submit" color="blue" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Spinner size="sm" className="mr-2" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink">Certificado digital (.p12)</h2>
        <p className="mt-1 text-[13px] text-muted">
          Firma electrónica para emitir comprobantes autorizados.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={company.has_certificate ? 'green' : 'gray'}>
            {company.has_certificate ? 'Certificado cargado' : 'Sin certificado'}
          </Badge>
          {company.signature_expiration_date && (
            <span className="text-[12px] text-muted">
              Vigente hasta {company.signature_expiration_date}
            </span>
          )}
        </div>

        {certError && (
          <Alert color="red" className="mt-4" onDismiss={() => setCertError(null)}>
            {certError}
          </Alert>
        )}
        {certDone && (
          <Alert color="green" className="mt-4">
            Certificado subido correctamente
          </Alert>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="certify">Archivo .p12</Label>
            </div>
            <input
              id="certify"
              type="file"
              accept=".p12,.pfx"
              onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
              className="block w-full text-[13px] text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-white hover:file:bg-accent-hover"
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password">Contraseña</Label>
            </div>
            <TextInput
              id="password"
              type="password"
              placeholder="Contraseña del .p12"
              value={certPassword}
              onChange={(e) => setCertPassword(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button color="blue" onClick={submitCertificate} disabled={certMutation.isPending || !certFile || !certPassword}>
              {certMutation.isPending && <Spinner size="sm" className="mr-2" />}
              Subir certificado
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink">Logo</h2>
        <p className="mt-1 text-[13px] text-muted">Imagen que aparece en el RIDE.</p>

        <div className="mt-3">
          <Badge tone={company.has_logo ? 'green' : 'gray'}>{company.has_logo ? 'Logo cargado' : 'Sin logo'}</Badge>
        </div>

        {logoError && (
          <Alert color="red" className="mt-4" onDismiss={() => setLogoError(null)}>
            {logoError}
          </Alert>
        )}
        {logoDone && (
          <Alert color="green" className="mt-4">
            Logo subido correctamente
          </Alert>
        )}

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <div className="mb-2 block">
              <Label htmlFor="logo">Imagen (máx. 2MB)</Label>
            </div>
            <input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="block w-full text-[13px] text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-white hover:file:bg-accent-hover"
            />
          </div>
          <Button color="blue" onClick={submitLogo} disabled={logoMutation.isPending || !logoFile}>
            {logoMutation.isPending && <Spinner size="sm" className="mr-2" />}
            Subir logo
          </Button>
        </div>
      </div>

      <CreateCompanyModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => setShowCreate(false)}
      />
    </div>
  )
}
