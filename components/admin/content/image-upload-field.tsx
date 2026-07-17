"use client"

import { ImageUploadZone } from "@/components/admin/import/image-upload-zone"
import { Label } from "@/components/ui/label"

interface ImageUploadFieldProps {
  label: string
  value: string
  pendingFile?: File | null
  onFileSelect: (file: File) => void
  onClear: () => void
  accept?: string
  helperText?: string
}

export function ImageUploadField({
  label,
  value,
  pendingFile = null,
  onFileSelect,
  onClear,
  accept = "image/*",
  helperText,
}: ImageUploadFieldProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
      </div>

      <ImageUploadZone
        selectedImage={pendingFile}
        imageUrl={value}
        accept={accept}
        onImageSelect={onFileSelect}
        onClear={onClear}
      />

      <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">Archivo actual</p>
        <p className="mt-1 break-all text-sm">{value || "Aun no se ha seleccionado ninguna imagen"}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          La imagen se subira cuando pulses Guardar cambios, igual que en productos y slides.
        </p>
        {pendingFile ? <p className="mt-2 text-xs text-primary">Pendiente por guardar: {pendingFile.name}</p> : null}
      </div>
    </div>
  )
}
