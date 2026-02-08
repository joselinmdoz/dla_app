'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PreviewTableProps {
  headers: string[]
  rows: Record<string, string>[]
  title?: string
  maxRows?: number
}

export function PreviewTable({
  headers,
  rows,
  title = 'Vista previa',
  maxRows = 10
}: PreviewTableProps) {
  const [page, setPage] = useState(0)
  const itemsPerPage = 5
  const totalPages = Math.ceil(rows.length / itemsPerPage)

  const displayedRows = rows.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  )

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos para mostrar
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b">
        <h3 className="font-medium text-gray-700">{title}</h3>
        <p className="text-xs text-gray-500">
          Mostrando {displayedRows.length} de {rows.length} registros
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 text-left font-medium text-gray-600 border-b"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {headers.map((header) => (
                  <td
                    key={`${index}-${header}`}
                    className="px-4 py-2 border-b text-gray-700"
                  >
                    {row[header] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm text-gray-600">
            Página {page + 1} de {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
