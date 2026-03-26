'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyIcon, CheckIcon, UsersIcon, UserIcon, LinkIcon, UserCircleIcon, SettingsIcon } from 'lucide-react'

interface ClientData {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
}

interface ReferralData {
  client: {
    id: string
    name: string
    email: string
    referralCode: string | null
  }
  referrer: {
    id: string
    name: string
    email: string
  } | null
  referrals: Array<{
    id: string
    name: string
    email: string
    createdAt: string
  }>
  stats: {
    totalReferrals: number
  }
}

export default function AccountPage() {
  const router = useRouter()
  const [client, setClient] = useState<ClientData | null>(null)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // Obtener datos del cliente actual
        const meResponse = await fetch('/api/auth/me')
        
        if (!meResponse.ok) {
          router.push('/login')
          return
        }

        const meData = await meResponse.json()
        
        if (!meData.client || meData.client.role !== 'CLIENT') {
          router.push('/login')
          return
        }

        setClient(meData.client)

        // Obtener datos de referidos
        const referralsResponse = await fetch(`/api/clients/${meData.client.id}/referrals`)
        
        if (referralsResponse.ok) {
          const referralsData = await referralsResponse.json()
          setReferralData(referralsData)
        }
      } catch (err) {
        console.error('Error fetching client data:', err)
        setError('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [router])

  const generateReferralLink = () => {
    if (!referralData?.client.referralCode) return ''
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referralData.client.referralCode}`
  }

  const copyToClipboard = async () => {
    const link = generateReferralLink()
    if (!link) return

    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">{error || 'Error al cargar datos'}</p>
            <Button onClick={() => router.push('/login')} className="w-full mt-4">
              Ir a inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="mt-2 text-gray-600">Bienvenido, {client.name}</p>
        </div>

        {/* Información del cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Información Personal
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/account/profile')}>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Nombre</Label>
                <p className="font-medium">{client.name}</p>
              </div>
              <div>
                <Label className="text-gray-500">Correo electrónico</Label>
                <p className="font-medium">{client.email}</p>
              </div>
              {client.phone && (
                <div>
                  <Label className="text-gray-500">Teléfono</Label>
                  <p className="font-medium">{client.phone}</p>
                </div>
              )}
              {client.address && (
                <div>
                  <Label className="text-gray-500">Dirección</Label>
                  <p className="font-medium">{client.address}{client.city ? `, ${client.city}` : ''}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Programa de referidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Programa de Referidos
            </CardTitle>
            <CardDescription>
              Comparte tu código con tus amigos y gana beneficios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tu código de referido */}
            <div className="bg-blue-50 rounded-lg p-6">
              <Label className="text-blue-800 text-sm font-medium">Tu código de referido</Label>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {referralData?.client.referralCode || 'Generando...'}
              </p>
            </div>

            {/* Enlace de referido */}
            <div className="space-y-2">
              <Label>Enlace de referido</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={generateReferralLink()}
                  placeholder="Tu enlace de referido"
                  className="bg-gray-50"
                />
                <Button onClick={copyToClipboard} variant="outline" size="icon">
                  {copied ? <CheckIcon className="h-4 w-4 text-green-600" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Copia este enlace y compártelo con tus amigos. Cuando se registren usando este enlace, quedarán vinculados como tus referidos.
              </p>
            </div>

            {/* ¿A quién referiste? */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Personas que has referidos ({referralData?.stats.totalReferrals || 0})</h3>
              
              {referralData?.referrals && referralData.referrals.length > 0 ? (
                <div className="space-y-3">
                  {referralData.referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{referral.name}</p>
                        <p className="text-sm text-gray-500">{referral.email}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(referral.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aún no has referidos a nadie. ¡Comparte tu código para empezar!
                </p>
              )}
            </div>

            {/* ¿Quién te refiere? */}
            {referralData?.referrer && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Te ha referido</h3>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-full">
                    <UserIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">{referralData.referrer.name}</p>
                    <p className="text-sm text-green-700">{referralData.referrer.email}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cómo funciona */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              ¿Cómo funciona?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Comparte tu código o enlace de referido con tus amigos</li>
              <li>Tu amigo se registra usando tu código o enlace</li>
              <li>Cuando complete su registro, quedará vinculado como tu referido</li>
              <li>Puedes ver todos tus referidos en esta página</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
