'use client'

import { useState, useCallback } from 'react'
import { UploadZone } from '@/components/admin/import/upload-zone'
import { PreviewTable } from '@/components/admin/import/preview-table'
import { ColumnMapper } from '@/components/admin/import/column-mapper'
import { ImportReport } from '@/components/admin/import/import-report'
import { Button } from '@/components/ui/button'
import { Download, Loader2, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

type EntityType = 'PRODUCT' | 'CATEGORY' | 'CLIENT' | 'SHIPMENT'

interface ImportState {
  step: 1 | 2 | 3 | 4
  file: File | null
  entity: EntityType
  previewData: { headers: string[]; rows: Record<string, string>[] } | null
  mapping: Record<string, string>
  isProcessing: boolean
  result: {
    success: boolean
    entity: string
    summary: { total: number; success: number; errors: number; warnings: number }
    details?: unknown[]
  } | null
}

const ENTITY_CONFIG: Record<EntityType, { label: string; fields: { key: string; label: string; required?: boolean }[] }> = {
  PRODUCT: {
    label: 'Productos',
    fields: [
      { key: 'name', label: 'Nombre', required: true },
      { key: 'slug', label: 'Slug', required: true },
      { key: 'description', label: 'Descripción' },
      { key: 'price', label: 'Precio', required: true },
      { key: 'costPrice', label: 'Precio de coste' },
      { key: 'image', label: 'Imagen' },
      { key: 'categoryName', label: 'Categoría', required: true },
      { key: 'spiceLevel', label: 'Nivel de picante' },
      { key: 'available', label: 'Disponible' },
      { key: 'sortOrder', label: 'Orden' }
    ]
  },
  CATEGORY: {
    label: 'Categorías',
    fields: [
      { key: 'name', label: 'Nombre', required: true },
      { key: 'slug', label: 'Slug', required: true },
      { key: 'description', label: 'Descripción' },
      { key: 'icon', label: 'Icono' },
      { key: 'sortOrder', label: 'Orden' }
    ]
  },
  CLIENT: {
    label: 'Clientes',
    fields: [
      { key: 'name', label: 'Nombre', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'phone', label: 'Teléfono', required: true },
      { key: 'address', label: 'Dirección' },
      { key: 'province', label: 'Provincia' },
      { key: 'city', label: 'Ciudad' },
      { key: 'notes', label: 'Notas' }
    ]
  },
  SHIPMENT: {
    label: 'Envíos',
    fields: [
      { key: 'hbl', label: 'HBL', required: true },
      { key: 'clientEmail', label: 'Email del cliente', required: true },
      { key: 'address', label: 'Dirección', required: true },
      { key: 'province', label: 'Provincia', required: true },
      { key: 'city', label: 'Ciudad' },
      { key: 'type', label: 'Tipo' },
      { key: 'status', label: 'Estado' },
      { key: 'price', label: 'Precio' },
      { key: 'notes', label: 'Notas' }
    ]
  }
}

export default function ImportPage() {
  const { toast } = useToast()
  const [state, setState] = useState<ImportState>({
    step: 1,
    file: null,
    entity: 'PRODUCT',
    previewData: null,
    mapping: {},
    isProcessing: false,
    result: null
  })

  const handleFileSelect = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, file }))

    // Parsear archivo para preview
    const text = await file.text()
    const lines = text.split('\n').filter((line) => line.trim())
    
    if (lines.length > 0) {
      const delimiter = lines[0].includes(';') ? ';' : ','
      const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''))
      
      const rows = lines.slice(1, 6).map((line) => {
        const values = line.split(delimiter)
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim().replace(/^"|"$/g, '') || ''
        })
        return row
      })

      setState((prev) => ({
        ...prev,
        previewData: { headers, rows }
      }))
    }
  }, [])

  const handleEntityChange = (entity: EntityType) => {
    setState((prev) => ({ ...prev, entity, mapping: {} }))
  }

  const handleMappingChange = (mapping: Record<string, string>) => {
    setState((prev) => ({ ...prev, mapping }))
  }

  const handleImport = async () => {
    if (!state.file || !state.entity) return

    setState((prev) => ({ ...prev, isProcessing: true }))

    try {
      const formData = new FormData()
      formData.append('file', state.file)
      formData.append('entity', state.entity)
      if (Object.keys(state.mapping).length > 0) {
        formData.append('mapping', JSON.stringify(state.mapping))
      }

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const result = await response.json()

      setState((prev) => ({
        ...prev,
        step: 4,
        isProcessing: false,
        result: {
          success: result.success,
          entity: result.entity,
          summary: result.summary,
          details: result.import?.details
        }
      }))

      toast({
        title: 'Importación completada',
        description: `Se procesaron ${result.summary.total} registros`,
        variant: result.summary.errors === 0 ? 'default' : 'destructive'
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isProcessing: false }))
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      })
    }
  }

  const handleExport = async (entity: EntityType) => {
    try {
      const response = await fetch(`/api/export/${entity.toLowerCase()}s`)
      if (!response.ok) throw new Error('Error al exportar')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${entity.toLowerCase()}s_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar el archivo',
        variant: 'destructive'
      })
    }
  }

  const handleReset = () => {
    setState({
      step: 1,
      file: null,
      entity: state.entity,
      previewData: null,
      mapping: {},
      isProcessing: false,
      result: null
    })
  }

  const goToStep = (step: 1 | 2 | 3 | 4) => {
    setState((prev) => ({ ...prev, step }))
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Importar / Exportar Datos</h1>
        <p className="text-gray-500">
          Importa datos desde archivos CSV o exporta los existentes
        </p>
      </div>

      {/* Selector de entidad */}
      {state.step === 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tipo de datos</label>
          <div className="flex gap-2">
            {(Object.keys(ENTITY_CONFIG) as EntityType[]).map((entity) => (
              <button
                key={entity}
                onClick={() => handleEntityChange(entity)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  state.entity === entity
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {ENTITY_CONFIG[entity].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pasos */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((step) => (
          <button
            key={step}
            onClick={() => state.file && goToStep(step as 1 | 2 | 3 | 4)}
            disabled={!state.file || step < (state.file ? 2 : 4)}
            className={`flex items-center gap-2 ${
              state.step === step
                ? 'text-blue-600 font-medium'
                : state.file
                ? 'text-gray-600'
                : 'text-gray-300'
            }`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.step === step
                  ? 'bg-blue-600 text-white'
                  : state.file
                  ? 'bg-gray-200 text-gray-600'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              {step}
            </span>
            <span className="hidden sm:inline">
              {step === 1
                ? 'Seleccionar archivo'
                : step === 2
                ? 'Previsualizar'
                : step === 3
                ? 'Importar'
                : 'Resultado'}
            </span>
          </button>
        ))}
      </div>

      {/* Contenido por paso */}
      {state.step === 1 && (
        <div className="space-y-6">
          <UploadZone
            onFileSelect={handleFileSelect}
            selectedFile={state.file}
            onClear={() => setState((prev) => ({ ...prev, file: null, previewData: null }))}
          />

          {state.file && (
            <div className="flex justify-end">
              <Button onClick={() => goToStep(2)}>
                Continuar
              </Button>
            </div>
          )}

          {/* Botones de exportación */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Exportar datos existentes</h3>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(ENTITY_CONFIG) as EntityType[]).map((entity) => (
                <Button
                  key={entity}
                  variant="outline"
                  onClick={() => handleExport(entity)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar {ENTITY_CONFIG[entity].label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {state.step === 2 && state.previewData && (
        <div className="space-y-6">
          <PreviewTable
            headers={state.previewData.headers}
            rows={state.previewData.rows}
            title={`Vista previa - ${ENTITY_CONFIG[state.entity].label}`}
          />

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => goToStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button onClick={() => goToStep(3)}>
              Continuar al mapeo
            </Button>
          </div>
        </div>
      )}

      {state.step === 3 && state.previewData && (
        <div className="space-y-6">
          <ColumnMapper
            columns={state.previewData.headers}
            targetFields={ENTITY_CONFIG[state.entity].fields}
            onMappingChange={handleMappingChange}
          />

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => goToStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button
              onClick={handleImport}
              disabled={state.isProcessing}
            >
              {state.isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Importar datos
            </Button>
          </div>
        </div>
      )}

      {state.step === 4 && (
        <div className="space-y-6">
          <ImportReport
            result={state.result}
            onReset={handleReset}
            onRetry={() => goToStep(3)}
          />
        </div>
      )}
    </div>
  )
}
