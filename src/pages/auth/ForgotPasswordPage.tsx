import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, HelperText, Label, Spinner, TextInput } from 'flowbite-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { FaFileInvoiceDollar } from 'react-icons/fa6'
import { z } from 'zod'
import { forgotPassword } from '../../api/auth'
import { toErrorMessage } from '../../lib/errors'

const forgotSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (values: ForgotFormValues) => {
    setError(null)
    setSent(false)
    setIsLoading(true)
    try {
      await forgotPassword(values.email)
      setSent(true)
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
          {sent ? (
            <>
              <h2 className="mb-4 text-base font-bold text-ink">Revisa tu correo</h2>
              <Alert color="green" className="mb-4">
                Si el correo está registrado, recibirás un enlace para restablecer tu
                contraseña.
              </Alert>
              <p className="text-sm text-muted">
                El enlace expira en 60 minutos. Si no lo ves, revisa la carpeta de spam.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  Volver a iniciar sesión
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-base font-bold text-ink">Recuperar contraseña</h2>
              <p className="mb-6 text-sm text-muted">
                Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
              </p>

              {error && (
                <Alert color="red" className="mb-4">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="email">Email</Label>
                  </div>
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="nombre@empresa.com"
                    color={errors.email ? 'failure' : 'gray'}
                    autoComplete="email"
                    {...register('email')}
                  />
                  {errors.email?.message && (
                    <HelperText color="failure">{errors.email.message}</HelperText>
                  )}
                </div>

                <Button type="submit" color="blue" className="w-full" disabled={isLoading}>
                  {isLoading && <Spinner size="sm" className="mr-2" />}
                  Enviar enlace
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          ¿Recordaste tu contraseña?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}