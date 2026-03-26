'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CheckIcon, AlertCircleIcon, Loader2Icon } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [referrerInfo, setReferrerInfo] = useState<{ name: string; email: string } | null>(null)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Verificar código de referido de la URL
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
      verifyReferralCode(refCode)
    }
  }, [searchParams])

  const verifyReferralCode = async (code: string) => {
    if (!code) {
      setReferrerInfo(null)
      setCodeError(null)
      return
    }

    setVerifyingCode(true)
    setCodeError(null)

    try {
      const response = await fetch(`/api/clients/verify-referral-code?code=${encodeURIComponent(code)}`)
      const data = await response.json()

      if (!response.ok) {
        setReferrerInfo(null)
        setCodeError(data.error || 'Código inválido')
        return
      }

      setReferrerInfo(data.client)
      setCodeError(null)
    } catch (err) {
      setCodeError('Error al verificar código')
    } finally {
      setVerifyingCode(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase()
    setReferralCode(code)
    
    // Debounce verification
    if (code.length >= 4) {
      const timer = setTimeout(() => verifyReferralCode(code), 500)
      return () => clearTimeout(timer)
    } else {
      setReferrerInfo(null)
      setCodeError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setFormError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string

    try {
      const body: Record<string, string> = {
        email,
        password,
        name,
        phone,
      }

      // Agregar código de referido si está verificado
      if (referralCode && referrerInfo) {
        body.referralCode = referralCode
      }

      const res = await fetch('/api/clients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMessage = data.error || 'Error al crear cuenta'
        setFormError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
        return
      }

      setFormError(null)

      toast({
        title: '¡Cuenta creada!',
        description: referrerInfo 
          ? `Te has registrado correctamente. Fuiste referido por ${referrerInfo.name}`
          : 'Tu cuenta ha sido creada exitosamente',
      })

      // Redirigir según el rol
      if (data.user?.canAccessAdmin) {
        window.location.href = data.user.adminEntryPath || '/admin'
      } else {
        window.location.href = '/account'
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Algo salió mal',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Crear Cuenta
          </h1>
          <p className="mt-2 text-muted-foreground">
            Regístrate en DLA Viajes y envíos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Cliente</CardTitle>
            <CardDescription>
              Completa el formulario para crear tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">{formError}</p>
                </div>
              )}
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="mt-1"
                  placeholder="+53 5..."
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minLength={6}
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <Label htmlFor="referralCode">Código de referido (opcional)</Label>
                <div className="relative">
                  <Input
                    type="text"
                    id="referralCode"
                    name="referralCode"
                    value={referralCode}
                    onChange={handleCodeChange}
                    className="mt-1"
                    placeholder="XXXX-XXXX"
                  />
                  {verifyingCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2Icon className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Estado del código */}
                {codeError && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                    <AlertCircleIcon className="h-4 w-4" />
                    {codeError}
                  </div>
                )}
                
                {referrerInfo && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                    <CheckIcon className="h-4 w-4" />
                    Referido por: {referrerInfo.name} ({referrerInfo.email})
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">
                  Si tienes un código de referido, ingrésalo aquí
                </p>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => router.push('/login')}
                >
                  ¿Ya tienes cuenta? Inicia Sesión
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
