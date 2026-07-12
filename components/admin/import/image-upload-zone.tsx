'use client'

import { useState, useCallback, useId, useMemo, useEffect } from 'react'
import { Upload, X, AlertCircle, Image as ImageIcon } from 'lucide-react'

interface ImageUploadZoneProps {
  onImageSelect: (file: File) => void
  selectedImage: File | null
  imageUrl: string
  onClear: () => void
  accept?: string
  maxSize?: number // en bytes
}

export function ImageUploadZone({
  onImageSelect,
  selectedImage,
  imageUrl,
  onClear,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024 // 10MB
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()

  const previewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : imageUrl),
    [selectedImage, imageUrl]
  )

  useEffect(() => {
    return () => {
      if (selectedImage && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl, selectedImage])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFile = useCallback((file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen')
      return false
    }

    if (file.size > maxSize) {
      setError(`La imagen excede el tamaño máximo de ${Math.round(maxSize / 1024 / 1024)}MB`)
      return false
    }

    setError(null)
    return true
  }, [maxSize])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && validateFile(file)) {
      onImageSelect(file)
    }
  }, [onImageSelect, validateFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      onImageSelect(file)
    }
  }, [onImageSelect, validateFile])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  // Mostrar imagen seleccionada o desde URL
  if (selectedImage || imageUrl) {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-primary/40 bg-card shadow-lg shadow-primary/10">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className="absolute top-3 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-bold tracking-wide text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:bg-primary/90 cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" />
          Cambiar imagen
        </label>
        <button
          onClick={() => {
            onClear()
            setError(null)
          }}
          className="absolute top-3 right-3 z-10 rounded-full border border-destructive/30 bg-background/90 p-2 text-destructive shadow-md backdrop-blur-sm transition-all hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Eliminar imagen"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="relative aspect-video">
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-full h-full object-contain"
          />
        </div>
        {selectedImage && (
          <div className="border-t border-border bg-background/95 p-3 backdrop-blur-sm">
            <p className="truncate font-medium text-foreground">{selectedImage.name}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(selectedImage.size)}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id={inputId}
      />
      <label htmlFor={inputId} className="cursor-pointer flex flex-col items-center">
        <Upload className={`w-12 h-12 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-lg font-medium text-gray-700 mb-1">
          {isDragging ? 'Suelta la imagen aquí' : 'Arrastra y suelta una imagen'}
        </p>
        <p className="text-sm text-gray-500 mb-3">o haz clic para seleccionar</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ImageIcon className="w-4 h-4" />
          <span>Máximo {Math.round(maxSize / 1024 / 1024)}MB • PNG, JPG, SVG, GIF</span>
        </div>
      </label>

      {error && (
        <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  )
}
