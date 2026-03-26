'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2Icon, SaveIcon, UserIcon } from 'lucide-react'

interface ClientData {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  province?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [client, setClient] = useState<ClientData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
  })

  useEffect(() => {
    const fetchClientData = async () => {
      try {
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

        // Fetch client data from clients API
        const clientsResponse = await fetch('/api/clients')
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          const currentClient = clientsData.data?.find(
            (c: any) => c.email === meData.user.email
          )
          
          if (currentClient) {
            setClient(currentClient)
            setFormData({
              name: currentClient.name || '',
              phone: currentClient.phone || '',
              address: currentClient.address || '',
              city: currentClient.city || '',
              province: currentClient.province || '',
            })
          }
        }
      } catch (err) {
        console.error('Error fetching client data:', err)
        toast({
          title: 'Error',
          description: 'Error al cargar datos',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return

    setSaving(true)

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar')
      }

      const updatedClient = await response.json()
      setClient(updatedClient)
      
      toast({
        title: '¡Datos actualizados!',
        description: 'Tu información ha sido guardada correctamente',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Mi Perfil
            </CardTitle>
            <CardDescription>
              Actualiza tu información personal. El correo electrónico no se puede cambiar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email - read only */}
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={client?.email || ''}
                  disabled
                  className="bg-gray-100 mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El correo electrónico no se puede cambiar
                </p>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                  placeholder="+53 5..."
                />
              </div>

              {/* Province */}
              <div>
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="mt-1"
                  placeholder="La Habana"
                />
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city">Ciudad/Municipio</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1"
                  placeholder="Plaza de la Revolución"
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Dirección detallada</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
                  placeholder="Calle 23 #123 entre 4ta y 5ta"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/account')}
                >
                  Volver
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
