'use client'

import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

interface ColumnMapping {
  source: string
  target: string
}

interface ColumnMapperProps {
  columns: string[]
  targetFields: { key: string; label: string; required?: boolean }[]
  onMappingChange: (mapping: Record<string, string>) => void
  initialMapping?: Record<string, string>
}

export function ColumnMapper({
  columns,
  targetFields,
  onMappingChange,
  initialMapping = {}
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping)
  const [unmappedSource, setUnmappedSource] = useState<string[]>([])
  const [unmappedTarget, setUnmappedTarget] = useState<string[]>([])

  useEffect(() => {
    // Inicializar mapeo automático basado en nombres similares
    const autoMapping: Record<string, string> = { ...initialMapping }
    const usedSources = new Set(Object.values(initialMapping))
    const usedTargets = new Set(Object.keys(initialMapping))

    targetFields.forEach((field) => {
      if (!autoMapping[field.key]) {
        // Buscar coincidencia por nombre
        const match = columns.find(
          (col) =>
            col.toLowerCase().replace(/[_\s]/g, '') ===
              field.key.toLowerCase().replace(/[_\s]/g, '') &&
            !usedSources.has(col)
        )
        if (match) {
          autoMapping[field.key] = match
          usedSources.add(match)
        }
      }
    })

    setMapping(autoMapping)
    updateUnmapped(columns, autoMapping)
  }, [columns, targetFields, initialMapping])

  const updateUnmapped = (
    sources: string[],
    currentMapping: Record<string, string>
  ) => {
    const usedSources = new Set(Object.values(currentMapping))
    const usedTargets = new Set(Object.keys(currentMapping))

    setUnmappedSource(sources.filter((s) => !usedSources.has(s)))
    setUnmappedTarget(targetFields.filter((f) => !usedTargets.has(f.key)).map((f) => f.key))
  }

  const handleSourceChange = (target: string, source: string) => {
    const newMapping = { ...mapping }
    newMapping[target] = source
    setMapping(newMapping)
    updateUnmapped(columns, newMapping)
    onMappingChange(newMapping)
  }

  const handleRemoveMapping = (target: string) => {
    const newMapping = { ...mapping }
    delete newMapping[target]
    setMapping(newMapping)
    updateUnmapped(columns, newMapping)
    onMappingChange(newMapping)
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Mapeo de columnas</h3>
        <p className="text-sm text-blue-600">
          Asocia las columnas de tu archivo con los campos del sistema.
          Los campos marcados con * son obligatorios.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 items-start">
        {/* Fuentes disponibles */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-700 mb-3">Columnas del archivo</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {unmappedSource.length > 0 ? (
              unmappedSource.map((col) => (
                <div
                  key={col}
                  className="px-3 py-2 bg-white border rounded text-sm text-gray-700"
                >
                  {col}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Todas las columnas están mapeadas
              </p>
            )}
          </div>
        </div>

        {/* Mapeos activos */}
        <div className="space-y-3">
          {targetFields
            .filter((f) => mapping[f.key])
            .map((field) => (
              <div
                key={field.key}
                className="flex items-center gap-2 bg-white border rounded-lg p-2"
              >
                <select
                  value={mapping[field.key] || ''}
                  onChange={(e) => handleSourceChange(field.key, e.target.value)}
                  className="flex-1 text-sm border rounded px-2 py-1"
                >
                  <option value="">Seleccionar...</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    {field.label}
                  </span>
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveMapping(field.key)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
        </div>

        {/* Objetivos sin mapear */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-700 mb-3">Campos sin asignar</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {unmappedTarget.length > 0 ? (
              unmappedTarget.map((key) => {
                const field = targetFields.find((f) => f.key === key)
                return (
                  <div
                    key={key}
                    className="px-3 py-2 bg-white border rounded text-sm flex items-center gap-2"
                  >
                    <span className="text-gray-700">{field?.label || key}</span>
                    {field?.required && (
                      <span className="text-red-500 text-xs">*requerido</span>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Todos los campos están asignados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
