import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, HelperText, Label, Spinner, TextInput } from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuthStore } from '../../stores/authStore'

const registerSchema = z
  .object({
    name: z.string().min(1, 'El nombre es obligatorio').max(255, 'Máximo 255 caracteres'),
    email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const registerAction = useAuthStore((state) => state.register)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerAction({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      })
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
          <h2 className="mb-6 text-base font-bold text-ink">Crear cuenta</h2>

          {error && (
            <Alert color="red" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="name">Nombre</Label>
              </div>
              <TextInput
                id="name"
                type="text"
                placeholder="Tu nombre"
                color={errors.name ? 'failure' : 'gray'}
                autoComplete="name"
                {...register('name')}
              />
              {errors.name?.message && (
                <HelperText color="failure">{errors.name.message}</HelperText>
              )}
            </div>

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
              Crear cuenta
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
