import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, HelperText, Label, Spinner, TextInput } from 'flowbite-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FaFileInvoiceDollar } from 'react-icons/fa6'
import { z } from 'zod'
import { resetPassword } from '../../api/auth'
import { toErrorMessage } from '../../lib/errors'

const resetSchema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  })

type ResetFormValues = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (values: ResetFormValues) => {
    setError(null)
    setIsLoading(true)
    try {
      await resetPassword({
        token,
        email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      })
      navigate('/login')
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
            <FaFileInvoiceDollar className="h-7 w-7 text-white" />
          </span>
          <h1 className="text-2xl font-bold text-ink">Factus Easy</h1>
          <p className="text-sm text-muted">Facturación electrónica SRI</p>
        </div>

        <div className="rounded border border-border-warm bg-surface p-8">
          {!token || !email ? (
            <>
              <h2 className="mb-2 text-base font-bold text-ink">Enlace no válido</h2>
              <Alert color="red" className="mb-4">
                El enlace de restablecimiento no es válido o ha expirado.
              </Alert>
              <Link
                to="/forgot-password"
                className="font-medium text-accent hover:text-accent-hover"
              >
                Solicitar un nuevo enlace
              </Link>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-base font-bold text-ink">Nueva contraseña</h2>
              <p className="mb-6 text-sm text-muted">
                Estás restableciendo la contraseña de{' '}
                <span className="font-medium text-ink">{email}</span>.
              </p>

              {error && (
                <Alert color="red" className="mb-4">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="password">Nueva contraseña</Label>
                  </div>
                  <TextInput
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    color={errors.password ? 'failure' : 'gray'}
                    autoComplete="new-password"
                    {...register('password')}
                  />
                  {errors.password?.message && (
                    <HelperText color="failure">{errors.password.message}</HelperText>
                  )}
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                  </div>
                  <TextInput
                    id="password_confirmation"
                    type="password"
                    placeholder="Repite tu contraseña"
                    color={errors.password_confirmation ? 'failure' : 'gray'}
                    autoComplete="new-password"
                    {...register('password_confirmation')}
                  />
                  {errors.password_confirmation?.message && (
                    <HelperText color="failure">
                      {errors.password_confirmation.message}
                    </HelperText>
                  )}
                </div>

                <Button type="submit" color="blue" className="w-full" disabled={isLoading}>
                  {isLoading && <Spinner size="sm" className="mr-2" />}
                  Guardar nueva contraseña
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya la recordaste?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}