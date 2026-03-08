import { useCallback, useEffect, useState } from "react"

export interface OfficeImage {
  id: string
  imageUrl: string
  altText: string
  title: string | null
  description: string | null
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface UseOfficeImagesReturn {
  images: OfficeImage[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createImage: (data: Partial<OfficeImage>) => Promise<OfficeImage | null>
  updateImage: (data: OfficeImage) => Promise<boolean>
  deleteImage: (id: string) => Promise<boolean>
  updateImages: (images: OfficeImage[]) => Promise<boolean>
}

export function useAdminOfficeImages(): UseOfficeImagesReturn {
  const [images, setImages] = useState<OfficeImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/office-images?includeInactive=true")
      if (!response.ok) throw new Error("Error al cargar las imágenes de oficinas")
      const data = (await response.json()) as OfficeImage[]
      setImages(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error fetching office images:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createImage = useCallback(async (data: Partial<OfficeImage>): Promise<OfficeImage | null> => {
    try {
      const response = await fetch("/api/office-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Error al crear la imagen")
      const newImage = (await response.json()) as OfficeImage
      setImages((prev) => [...prev, newImage])
      return newImage
    } catch (err) {
      console.error("Error creating office image:", err)
      return null
    }
  }, [])

  const updateImage = useCallback(async (data: OfficeImage): Promise<boolean> => {
    try {
      const imagesToUpdate = images.map((image) => (image.id === data.id ? data : image))
      const response = await fetch("/api/office-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagesToUpdate),
      })
      if (!response.ok) throw new Error("Error al actualizar la imagen")
      setImages(imagesToUpdate)
      return true
    } catch (err) {
      console.error("Error updating office image:", err)
      return false
    }
  }, [images])

  const deleteImage = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/office-images?id=${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error al eliminar la imagen")
      setImages((prev) => prev.filter((image) => image.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting office image:", err)
      return false
    }
  }, [])

  const updateImages = useCallback(async (imagesData: OfficeImage[]): Promise<boolean> => {
    try {
      const response = await fetch("/api/office-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagesData),
      })
      if (!response.ok) throw new Error("Error al actualizar las imágenes")
      setImages(imagesData)
      return true
    } catch (err) {
      console.error("Error updating office images:", err)
      return false
    }
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  return {
    images,
    isLoading,
    error,
    refetch: fetchImages,
    createImage,
    updateImage,
    deleteImage,
    updateImages,
  }
}

export function useOfficeImages() {
  const [images, setImages] = useState<OfficeImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/office-images")
      if (!response.ok) throw new Error("Error al cargar las imágenes de oficinas")
      const data = (await response.json()) as OfficeImage[]
      setImages(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error fetching office images:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  return { images, isLoading, error, refetch: fetchImages }
}
