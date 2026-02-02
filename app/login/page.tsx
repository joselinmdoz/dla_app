import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Foodie Wagon
          </h1>
          <p className="mt-2 text-muted-foreground">
            Inicia sesión o crea una cuenta
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
