"use client"

import { useState, useEffect } from 'react'
import { useAdminHeroSlides } from '@/hooks/use-hero-slides'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Trash2, Edit, GripVertical, Plus, X, Image as ImageIcon, Upload } from 'lucide-react'
import Image from 'next/image'
import { HeroSlide } from '@prisma/client'
import { ImageUploadZone } from '@/components/admin/import/image-upload-zone'

export default function HeroSlidesAdmin() {
  const { slides, isLoading, createSlide, updateSlide, deleteSlide, refetch } = useAdminHeroSlides()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    imageUrl: '',
    altText: '',
    title: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true
  })

  const handleOpenDialog = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide)
      setFormData({
        imageUrl: slide.imageUrl,
        altText: slide.altText,
        title: slide.title || '',
        linkUrl: slide.linkUrl || '',
        sortOrder: slide.sortOrder,
        isActive: slide.isActive
      })
    } else {
      setEditingSlide(null)
      setSelectedImageFile(null)
      setFormData({
        imageUrl: '',
        altText: '',
        title: '',
        linkUrl: '',
        sortOrder: slides.length,
        isActive: true
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSlide(null)
    setSelectedImageFile(null)
    setFormData({
      imageUrl: '',
      altText: '',
      title: '',
      linkUrl: '',
      sortOrder: 0,
      isActive: true
    })
  }

  const handleImageSelect = (file: File) => {
    setSelectedImageFile(file)
  }

  const handleClearImage = () => {
    setSelectedImageFile(null)
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImageFile) return formData.imageUrl || null

    try {
      setIsUploading(true)
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedImageFile)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Subir imagen si hay una nueva seleccionada
    const imageUrl = await uploadImage()
    if (!imageUrl) return

    const data = {
      imageUrl,
      altText: formData.altText,
      title: formData.title || null,
      linkUrl: formData.linkUrl || null,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive
    }

    if (editingSlide) {
      await updateSlide(editingSlide.id, data)
    } else {
      await createSlide(data)
    }
    
    handleCloseDialog()
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta slide?')) {
      await deleteSlide(id)
    }
  }

  const handleToggleActive = async (slide: HeroSlide) => {
    await updateSlide(slide.id, { isActive: !slide.isActive })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestionar Slides del Carrusel</h1>
          <p className="text-muted-foreground mt-1">
            Configura las imágenes que se mostrarán en el carrusel de la página principal
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Slide
        </Button>
      </div>

      {/* Lista de slides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {slides.map((slide) => (
          <Card key={slide.id} className={`overflow-hidden ${!slide.isActive ? 'opacity-60' : ''}`}>
            <div className="relative aspect-video bg-muted">
              {slide.imageUrl ? (
                <Image
                  src={`/api/hero-slides/${slide.id}/serve?v=${encodeURIComponent(String(slide.updatedAt))}`}
                  alt={slide.altText}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge variant={slide.isActive ? 'default' : 'secondary'}>
                  {slide.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
                <Badge variant="outline" className="bg-background/80">
                  #{slide.sortOrder}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{slide.title || 'Sin título'}</h3>
              <p className="text-sm text-muted-foreground truncate">{slide.altText}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenDialog(slide)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleToggleActive(slide)}
                  >
                    {slide.isActive ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(slide.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <GripVertical className="w-4 h-4 cursor-grab" />
                  <span>Ordenar</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Card para añadir nueva */}
        <Card 
          className="overflow-hidden border-dashed cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleOpenDialog()}
        >
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm">Añadir nueva slide</span>
          </div>
        </Card>
      </div>

      {/* Diálogo para crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSlide ? 'Editar Slide' : 'Nueva Slide'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Campo de imagen con drag & drop */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Imagen *
                </label>
                <ImageUploadZone
                  onImageSelect={handleImageSelect}
                  selectedImage={selectedImageFile}
                  imageUrl={formData.imageUrl}
                  onClear={handleClearImage}
                  maxSize={5 * 1024 * 1024} // 5MB para imágenes
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="altText" className="text-sm font-medium">
                  Texto Alternativo (alt) *
                </label>
                <Input
                  id="altText"
                  value={formData.altText}
                  onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                  placeholder="Descripción de la imagen"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Título (opcional)
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título de la slide"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="linkUrl" className="text-sm font-medium">
                  URL de Enlace (opcional)
                </label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="sortOrder" className="text-sm font-medium">
                    Orden
                  </label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Estado
                  </label>
                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="isActive" className="text-sm">
                      Activo
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading || (!formData.imageUrl && !selectedImageFile)}>
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-upload" />
                    Subiendo...
                  </>
                ) : editingSlide ? (
                  'Guardar cambios'
                ) : (
                  'Crear slide'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
