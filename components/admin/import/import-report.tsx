'use client'

import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

interface ImportResult {
  success: boolean
  entity: string
  summary: {
    total: number
    success: number
    errors: number
    warnings: number
  }
  details?: unknown[]
}

interface ImportReportProps {
  result: ImportResult | null
  onReset: () => void
  onRetry?: () => void
}

export function ImportReport({ result, onReset, onRetry }: ImportReportProps) {
  if (!result) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay resultados para mostrar
      </div>
    )
  }

  const successRate = result.summary.total > 0
    ? Math.round((result.summary.success / result.summary.total) * 100)
    : 0

  const getStatusColor = () => {
    if (result.summary.errors === 0) return 'green'
    if (result.summary.success > result.summary.errors) return 'yellow'
    return 'red'
  }

  const color = getStatusColor()
  const StatusIcon = result.summary.errors === 0 ? CheckCircle : XCircle
  const statusColorClass =
    color === 'green'
      ? 'text-green-600 bg-green-100 border-green-200'
      : color === 'yellow'
      ? 'text-yellow-600 bg-yellow-100 border-yellow-200'
      : 'text-red-600 bg-red-100 border-red-200'

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className={`border rounded-lg p-6 ${statusColorClass}`}>
        <div className="flex items-center gap-3 mb-4">
          <StatusIcon className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-semibold">
              Importación {result.summary.errors === 0 ? 'completada' : 'completada con errores'}
            </h3>
            <p className="text-sm opacity-80">
              Entidad: {result.entity}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-2xl font-bold">{result.summary.total}</p>
            <p className="text-sm">Total registros</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-2xl font-bold text-green-600">{result.summary.success}</p>
            <p className="text-sm">Éxito</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-2xl font-bold text-red-600">{result.summary.errors}</p>
            <p className="text-sm">Errores</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-2xl font-bold">{successRate}%</p>
            <p className="text-sm">Éxito</p>
          </div>
        </div>
      </div>

      {/* Barra de progreso visual */}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
        <div
          className="bg-green-500 h-full transition-all duration-300"
          style={{ width: `${successRate}%` }}
        />
        <div
          className="bg-red-500 h-full transition-all duration-300"
          style={{
            width: `${
              result.summary.total > 0
                ? (result.summary.errors / result.summary.total) * 100
                : 0
            }%`
          }}
        />
      </div>

      {/* Detalles de errores */}
      {result.summary.errors > 0 && result.details && (
        <div className="border border-red-200 rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-2 border-b border-red-200">
            <h4 className="font-medium text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Errores encontrados ({result.summary.errors})
            </h4>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-red-700">Fila</th>
                  <th className="px-4 py-2 text-left text-red-700">Acción</th>
                  <th className="px-4 py-2 text-left text-red-700">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {result.details
                  .filter((d: unknown) => (d as { error?: string }).error)
                  .slice(0, 20)
                  .map((detail: unknown, index: number) => {
                    const d = detail as { row?: number; action?: string; error?: string; slug?: string; hbl?: string }
                    return (
                      <tr key={index} className="border-b border-red-100">
                        <td className="px-4 py-2">#{d.row || index + 1}</td>
                        <td className="px-4 py-2">{d.action}</td>
                        <td className="px-4 py-2 text-red-600">
                          {d.error || d.slug || d.hbl || 'Error desconocido'}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          {result.summary.errors > 20 && (
            <div className="text-center py-2 text-sm text-red-500 bg-red-50">
              Mostrando 20 de {result.summary.errors} errores
            </div>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-4 justify-center pt-4">
        {onRetry && result.summary.errors > 0 && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar importación
          </button>
        )}
        <button
          onClick={onReset}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Nueva importación
        </button>
      </div>
    </div>
  )
}
