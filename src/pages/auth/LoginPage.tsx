import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, HelperText, Label, Spinner, TextInput } from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuthStore } from '../../stores/authStore'

const loginSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password)
      navigate('/')
    } catch {
      // el error ya quedó guardado en el store y se muestra debajo
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-ink">Factus Easy</h1>
          <p className="text-sm text-muted">Facturación electrónica SRI</p>
        </div>

        <div className="rounded border border-border-warm bg-surface p-8">
          <h2 className="mb-6 text-base font-bold text-ink">Iniciar sesión</h2>

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

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <TextInput
                id="password"
                type="password"
                placeholder="••••••••"
                color={errors.password ? 'failure' : 'gray'}
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password?.message && (
                <HelperText color="failure">{errors.password.message}</HelperText>
              )}
            </div>

            <Button type="submit" color="blue" className="w-full" disabled={isLoading}>
              {isLoading && <Spinner size="sm" className="mr-2" />}
              Entrar
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
