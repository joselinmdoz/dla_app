"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { ImageUploadZone } from "@/components/admin/import/image-upload-zone"
import { Label } from "@/components/ui/label"
import { resolvePublicAssetUrl } from "@/lib/public-asset-url"

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  accept?: string
  helperText?: string
}

export function ImageUploadField({
  label,
  value,
  onChange,
  accept = "image/*",
  helperText,
}: ImageUploadFieldProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = async (file: File) => {
    setSelectedImage(file)
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo subir la imagen")
      }

      const data = await response.json()
      onChange(data.url)
      setSelectedImage(null)
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen"
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
      </div>

      <ImageUploadZone
        selectedImage={selectedImage}
        imageUrl={resolvePublicAssetUrl(value)}
        accept={accept}
        onImageSelect={uploadImage}
        onClear={() => {
          setSelectedImage(null)
          setError(null)
          onChange("")
        }}
      />

      <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">Archivo actual</p>
        <p className="mt-1 break-all text-sm">{value || "Aun no se ha seleccionado ninguna imagen"}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          La imagen se sube al servidor al seleccionarla, pero el landing solo se actualiza al pulsar Guardar cambios.
        </p>
      </div>

      {isUploading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Subiendo imagen...</span>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
