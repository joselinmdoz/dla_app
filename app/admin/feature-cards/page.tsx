"use client"

import { useState, useEffect } from 'react'
import { useAdminFeatureCards } from '@/hooks/use-feature-cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Trash2, Edit, GripVertical, Plus, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { ImageUploadZone } from '@/components/admin/import/image-upload-zone'

interface FeatureCard {
  id: string
  imageUrl: string
  altText: string
  title: string | null
  description: string | null
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function FeatureCardsAdmin() {
  const { cards, isLoading, createCard, updateCard, deleteCard, refetch } = useAdminFeatureCards()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<FeatureCard | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    imageUrl: '',
    altText: '',
    title: '',
    description: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true
  })

  const handleOpenDialog = (card?: FeatureCard) => {
    if (card) {
      setEditingCard(card)
      setFormData({
        imageUrl: card.imageUrl,
        altText: card.altText,
        title: card.title || '',
        description: card.description || '',
        linkUrl: card.linkUrl || '',
        sortOrder: card.sortOrder,
        isActive: card.isActive
      })
    } else {
      setEditingCard(null)
      setSelectedImage(null)
      setFormData({
        imageUrl: '',
        altText: '',
        title: '',
        description: '',
        linkUrl: '',
        sortOrder: cards.length,
        isActive: true
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCard(null)
    setSelectedImage(null)
    setFormData({
      imageUrl: '',
      altText: '',
      title: '',
      description: '',
      linkUrl: '',
      sortOrder: 0,
      isActive: true
    })
  }

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
  }

  const handleClearImage = () => {
    setSelectedImage(null)
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return formData.imageUrl || null

    try {
      setIsUploading(true)
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedImage)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (!response.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen. Por favor, intenta de nuevo.')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    const imageUrl = await uploadImage()
    if (!imageUrl && !editingCard) {
      alert('Por favor, selecciona una imagen')
      return
    }

    const cardData = {
      ...formData,
      imageUrl: imageUrl || formData.imageUrl
    }

    if (editingCard) {
      const success = await updateCard({
        ...editingCard,
        ...cardData
      })
      if (success) {
        handleCloseDialog()
        refetch()
      }
    } else {
      const newCard = await createCard(cardData)
      if (newCard) {
        handleCloseDialog()
        refetch()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) {
      const success = await deleteCard(id)
      if (success) {
        refetch()
      }
    }
  }

  const handleToggleActive = async (card: FeatureCard) => {
    const success = await updateCard({
      ...card,
      isActive: !card.isActive
    })
    if (success) {
      refetch()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tarjetas de Información</h2>
          <p className="text-muted-foreground">
            Gestiona las tarjetas que se muestran en la sección de ofertas
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarjeta
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No hay tarjetas todavía</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera tarjeta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card key={card.id} className={!card.isActive ? 'opacity-60' : ''}>
              <div className="relative aspect-video">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.altText}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-lg">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant={card.isActive ? "default" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleActive(card)}
                  >
                    {card.isActive ? 'Activo' : 'Inactivo'}
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{card.title || 'Sin título'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {card.description || 'Sin descripción'}
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(card)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(card.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Imagen</label>
              <ImageUploadZone
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                imageUrl={formData.imageUrl}
                onClear={handleClearImage}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Texto alternativo</label>
              <Input
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                placeholder="Descripción de la imagen"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título de la tarjeta"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la tarjeta"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL de destino (opcional)</label>
              <Input
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Orden</label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Activo
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? 'Guardando...' : editingCard ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
