'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClear: () => void
  accept?: string
  maxSize?: number // en bytes
}

export function UploadZone({
  onFileSelect,
  selectedFile,
  onClear,
  accept = '.csv,.txt',
  maxSize = 10 * 1024 * 1024 // 10MB
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFile = useCallback((file: File): boolean => {
    if (!file.name.match(/\.(csv|txt)$/i)) {
      setError('Solo se permiten archivos CSV')
      return false
    }

    if (file.size > maxSize) {
      setError(`El archivo excede el tamaño máximo de ${Math.round(maxSize / 1024 / 1024)}MB`)
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
      onFileSelect(file)
    }
  }, [onFileSelect, validateFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      onFileSelect(file)
    }
  }, [onFileSelect, validateFile])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  if (selectedFile) {
    return (
      <div className="relative border-2 border-green-500 rounded-lg p-4 bg-green-50">
        <button
          onClick={onClear}
          className="absolute top-2 right-2 p-1 hover:bg-green-200 rounded-full transition-colors"
          aria-label="Eliminar archivo"
        >
          <X className="w-5 h-5 text-green-700" />
        </button>
        <div className="flex items-center gap-3">
          <FileText className="w-10 h-10 text-green-600" />
          <div>
            <p className="font-medium text-green-800">{selectedFile.name}</p>
            <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
          </div>
        </div>
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
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
        <Upload className={`w-12 h-12 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-lg font-medium text-gray-700 mb-1">
          {isDragging ? 'Suelta el archivo aquí' : 'Arrastra y suelta un archivo CSV'}
        </p>
        <p className="text-sm text-gray-500 mb-3">o haz clic para seleccionar</p>
        <p className="text-xs text-gray-400">
          Máximo {Math.round(maxSize / 1024 / 1024)}MB • Formatos: CSV
        </p>
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
