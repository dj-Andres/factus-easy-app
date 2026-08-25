import { useEffect, useMemo, useState } from 'react'
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
import { useCreateProduct, useProductOptions, useSriTaxes, useUpdateProduct } from '../../hooks/useProducts'
import { toErrorMessage } from '../../lib/errors'
import type { Product, ProductInput, ProductKind, SriTax } from '../../types/api'

const productSchema = z
  .object({
    product_kind: z.enum(['BIEN', 'SERVICIO'], { message: 'Tipo de producto inválido' }),
    auxiliary_code: z.string().max(25, 'Máximo 25 caracteres').optional().or(z.literal('')),
    sri_product_type: z.enum(['GENERAL', 'MATERIAL_CONSTRUCCION', 'TRANSPORTE_COMERCIAL']),
    sri_product_classification: z.string().optional().or(z.literal('')),
    description: z
      .string()
      .min(1, 'La descripción es obligatoria')
      .max(300, 'Máximo 300 caracteres'),
    unit_price: z
      .string()
      .min(1, 'El precio unitario es obligatorio')
      .refine((v) => !Number.isNaN(Number(v)), 'El precio debe ser un número')
      .refine((v) => Number(v) >= 0, 'El precio no puede ser negativo'),
    taxes: z.array(z.number()).min(1, 'Debe seleccionar al menos un impuesto'),
  })
  .superRefine((values, ctx) => {
    if (values.sri_product_type !== 'GENERAL' && !values.sri_product_classification) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sri_product_classification'],
        message: 'Debe seleccionar una clasificación SRI',
      })
    }
  })

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormPageProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSaved: () => void
}

export default function ProductFormPage({ isOpen, onClose, product, onSaved }: ProductFormPageProps) {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)
  const { data: options } = useProductOptions()
  const { data: taxes, isLoading: taxesLoading } = useSriTaxes()

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
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
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_kind: 'BIEN',
      auxiliary_code: '',
      sri_product_type: 'GENERAL',
      sri_product_classification: '',
      description: '',
      unit_price: '',
      taxes: [],
    },
  })

  const sriType = watch('sri_product_type')
  const selectedTaxes = watch('taxes')
  const requiresClassification = sriType !== 'GENERAL'
  const isKindLocked = requiresClassification

  useEffect(() => {
    if (isOpen) {
      reset({
        product_kind: product?.product_kind ?? 'BIEN',
        auxiliary_code: product?.auxiliary_code ?? '',
        sri_product_type: (product?.sri_product_type as ProductFormValues['sri_product_type']) ?? 'GENERAL',
        sri_product_classification: product?.sri_product_classification ?? '',
        description: product?.description ?? '',
        unit_price: product ? String(product.unit_price) : '',
        taxes: product?.taxes?.map((t) => t.id) ?? [],
      })
      setApiError(null)
    }
  }, [isOpen, product, reset])

  useEffect(() => {
    if (sriType === 'MATERIAL_CONSTRUCCION') {
      setValue('product_kind', 'BIEN', { shouldValidate: true })
    } else if (sriType === 'TRANSPORTE_COMERCIAL') {
      setValue('product_kind', 'SERVICIO', { shouldValidate: true })
    }
    if (sriType === 'GENERAL') {
      setValue('sri_product_classification', '', { shouldValidate: true })
    }
  }, [sriType, setValue])

  const classificationOptions = useMemo(() => {
    if (!options?.sri_product_classifications) return []
    return options.sri_product_classifications[sriType] ?? []
  }, [options, sriType])

  const groupedTaxes = useMemo(() => {
    if (!taxes) return []
    const map = new Map<string, SriTax[]>()
    for (const tax of taxes) {
      const list = map.get(tax.sri_code) ?? []
      list.push(tax)
      map.set(tax.sri_code, list)
    }
    return Array.from(map.entries()).map(([code, list]) => ({ code, list }))
  }, [taxes])

  const toggleTax = (tax: SriTax) => {
    const current = getValues('taxes') ?? []
    if (current.includes(tax.id)) {
      setValue(
        'taxes',
        current.filter((id) => id !== tax.id),
        { shouldValidate: true },
      )
    } else {
      const filtered = current.filter((id) => {
        const existing = taxes?.find((t) => t.id === id)
        return existing?.sri_code !== tax.sri_code
      })
      setValue('taxes', [...filtered, tax.id], { shouldValidate: true })
    }
  }

  const onSubmit = (values: ProductFormValues) => {
    if (!selectedRuc) {
      setApiError('No hay una empresa seleccionada')
      return
    }

    const payload: ProductInput = {
      ruc: selectedRuc,
      product_kind: values.product_kind as ProductKind,
      auxiliary_code: values.auxiliary_code || undefined,
      sri_product_type: values.sri_product_type,
      sri_product_classification: values.sri_product_classification || undefined,
      description: values.description,
      unit_price: Number(values.unit_price),
      taxes: values.taxes,
    }

    setApiError(null)
    if (product) {
      updateMutation.mutate(
        { id: product.id, data: payload },
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
    <Modal
      show={isOpen}
      onClose={onClose}
      size="3xl"
      className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
    >
      <ModalHeader className="border-border-warm">
        {product ? 'Editar Producto' : 'Nuevo Producto'}
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
                <Label htmlFor="sri_product_type">Tipo SRI</Label>
              </div>
              <Select
                id="sri_product_type"
                color={errors.sri_product_type ? 'failure' : 'gray'}
                {...register('sri_product_type')}
              >
                {(options?.sri_product_types ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="product_kind">Tipo de producto</Label>
              </div>
              <Select
                id="product_kind"
                disabled={isKindLocked}
                color={errors.product_kind ? 'failure' : 'gray'}
                {...register('product_kind')}
              >
                {(options?.product_kinds ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {isKindLocked && <HelperText>Se asigna automáticamente según el tipo SRI</HelperText>}
            </div>
          </div>

          {requiresClassification && (
            <div className="mt-4">
              <div className="mb-2 block">
                <Label htmlFor="sri_product_classification">Clasificación SRI</Label>
              </div>
              <Select
                id="sri_product_classification"
                color={errors.sri_product_classification ? 'failure' : 'gray'}
                {...register('sri_product_classification')}
              >
                <option value="">Seleccionar...</option>
                {classificationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {errors.sri_product_classification?.message && (
                <HelperText color="failure">{errors.sri_product_classification.message}</HelperText>
              )}
            </div>
          )}

          <div className="mt-4">
            <div className="mb-2 block">
              <Label htmlFor="description">Descripción</Label>
            </div>
            <TextInput
              id="description"
              placeholder="Descripción del producto o servicio"
              color={errors.description ? 'failure' : 'gray'}
              {...register('description')}
            />
            {errors.description?.message && (
              <HelperText color="failure">{errors.description.message}</HelperText>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="unit_price">Precio unitario</Label>
              </div>
              <TextInput
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                color={errors.unit_price ? 'failure' : 'gray'}
                {...register('unit_price')}
              />
              {errors.unit_price?.message && (
                <HelperText color="failure">{errors.unit_price.message}</HelperText>
              )}
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="auxiliary_code">Código auxiliar</Label>
              </div>
              <TextInput
                id="auxiliary_code"
                placeholder="Opcional"
                color={errors.auxiliary_code ? 'failure' : 'gray'}
                {...register('auxiliary_code')}
              />
              {errors.auxiliary_code?.message && (
                <HelperText color="failure">{errors.auxiliary_code.message}</HelperText>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 block">
              <Label>Impuestos SRI</Label>
            </div>
            {taxesLoading ? (
              <div className="flex items-center gap-2 py-2 text-sm text-muted">
                <Spinner size="sm" /> Cargando impuestos...
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border border-border-warm bg-canvas p-3">
                {groupedTaxes.map((group) => (
                  <fieldset key={group.code}>
                    <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-faint">
                      {group.list[0]?.tax_type ?? group.code} · Código {group.code}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {group.list.map((tax) => {
                        const checked = selectedTaxes.includes(tax.id)
                        return (
                          <label
                            key={tax.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[13px] transition-colors duration-150 ${
                              checked
                                ? 'border-accent bg-accent-soft text-accent'
                                : 'border-border-warm bg-surface text-ink hover:bg-surface-2'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTax(tax)}
                              className="h-3.5 w-3.5 accent-[#6d28d9]"
                            />
                            <span>{tax.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
            {errors.taxes?.message && <HelperText color="failure">{errors.taxes.message}</HelperText>}
          </div>
        </ModalBody>

        <ModalFooter className="flex-col-reverse gap-2 border-border-warm sm:flex-row sm:justify-end">
          <Button type="button" color="gray" className="w-full sm:w-auto" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" color="blue" className="w-full sm:w-auto" disabled={submitting}>
            {submitting && <Spinner size="sm" className="mr-2" />}
            {product ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
