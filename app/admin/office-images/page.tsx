"use client"

import { useState } from "react"
import { useAdminOfficeImages, OfficeImage } from "@/hooks/use-office-images"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Trash2, Edit, Plus, Image as ImageIcon } from "lucide-react"
import { ImageUploadZone } from "@/components/admin/import/image-upload-zone"

export default function OfficeImagesAdmin() {
  const { images, isLoading, createImage, updateImage, deleteImage, refetch } = useAdminOfficeImages()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<OfficeImage | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    imageUrl: "",
    altText: "",
    title: "",
    description: "",
    linkUrl: "",
    sortOrder: 0,
    isActive: true,
  })

  const handleOpenDialog = (image?: OfficeImage) => {
    if (image) {
      setEditingImage(image)
      setFormData({
        imageUrl: image.imageUrl,
        altText: image.altText,
        title: image.title || "",
        description: image.description || "",
        linkUrl: image.linkUrl || "",
        sortOrder: image.sortOrder,
        isActive: image.isActive,
      })
    } else {
      setEditingImage(null)
      setSelectedImage(null)
      setFormData({
        imageUrl: "",
        altText: "",
        title: "",
        description: "",
        linkUrl: "",
        sortOrder: images.length,
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingImage(null)
    setSelectedImage(null)
    setFormData({
      imageUrl: "",
      altText: "",
      title: "",
      description: "",
      linkUrl: "",
      sortOrder: 0,
      isActive: true,
    })
  }

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
  }

  const handleClearImage = () => {
    setSelectedImage(null)
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return formData.imageUrl || null

    try {
      setIsUploading(true)
      const uploadData = new FormData()
      uploadData.append("file", selectedImage)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const data = (await response.json()) as { url: string }
      return data.url
    } catch (error) {
      console.error("Error uploading office image:", error)
      alert("Error al subir la imagen. Intenta nuevamente.")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    const imageUrl = await uploadImage()
    if (!imageUrl && !editingImage) {
      alert("Selecciona una imagen para continuar")
      return
    }

    const payload = {
      ...formData,
      imageUrl: imageUrl || formData.imageUrl,
    }

    if (editingImage) {
      const success = await updateImage({
        ...editingImage,
        ...payload,
      })
      if (success) {
        handleCloseDialog()
        refetch()
      }
      return
    }

    const created = await createImage(payload)
    if (created) {
      handleCloseDialog()
      refetch()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta imagen de oficina?")) {
      const success = await deleteImage(id)
      if (success) refetch()
    }
  }

  const handleToggleActive = async (image: OfficeImage) => {
    const success = await updateImage({
      ...image,
      isActive: !image.isActive,
    })
    if (success) refetch()
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
          <h2 className="text-2xl font-bold">Imágenes de Oficinas</h2>
          <p className="text-muted-foreground">
            Gestiona las imágenes que se mostrarán en la sección de oficinas.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Imagen
        </Button>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No hay imágenes registradas</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Subir primera imagen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className={!image.isActive ? "opacity-60" : ""}>
              <div className="relative aspect-video">
                {image.imageUrl ? (
                  <img
                    src={`/api/office-images/${image.id}/serve?v=${encodeURIComponent(String(image.updatedAt))}`}
                    alt={image.altText}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-lg">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Button
                    variant={image.isActive ? "default" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleActive(image)}
                  >
                    {image.isActive ? "Activa" : "Inactiva"}
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{image.title || "Sin título"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {image.description || "Sin descripción"}
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(image)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(image.id)}>
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
            <DialogTitle>{editingImage ? "Editar Imagen" : "Nueva Imagen de Oficina"}</DialogTitle>
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
                placeholder="Nombre de oficina o sucursal"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción breve"
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
                onChange={(e) => setFormData({ ...formData, sortOrder: Number.parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="officeImageIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="officeImageIsActive" className="text-sm font-medium">
                Activa
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? "Guardando..." : editingImage ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
