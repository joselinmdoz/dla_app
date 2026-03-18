import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

export interface ParseOptions {
  delimiter?: string
  skipEmptyLines?: boolean
  columns?: boolean
  trim?: boolean
}

export interface ParseResult<T = Record<string, string>> {
  headers: string[]
  rows: T[]
  meta: {
    delimiter: string
    rowCount: number
    columnCount: number
  }
}

/**
 * Parsea un archivo CSV y retorna los datos estructurados
 */
export function parseCSV(content: string, options: ParseOptions = {}): ParseResult {
  const {
    delimiter = ',',
    skipEmptyLines = true,
    columns = true,
    trim = true
  } = options

  const records = parse(content, {
    delimiter,
    skip_empty_lines: skipEmptyLines,
    columns,
    trim,
    relax_column_count: true
  })

  const headers = columns
    ? (records[0] ? Object.keys(records[0] as object) : [])
    : []

  return {
    headers,
    rows: records as ParseResult['rows'],
    meta: {
      delimiter,
      rowCount: records.length,
      columnCount: headers.length
    }
  }
}

/**
 * Convierte un array de objetos a CSV
 */
export function toCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: string[]
): string {
  if (!data.length) return ''

  const keys = headers || Object.keys(data[0])

  return stringify(data, {
    header: true,
    columns: keys
  })
}

/**
 * Detecta el delimitador de un archivo CSV
 */
export function detectDelimiter(content: string): string {
  const delimiters = [',', ';', '\t', '|']
  const firstLine = content.split('\n')[0]

  let maxCount = 0
  let detected = ','

  for (const delimiter of delimiters) {
    const count = (firstLine.match(new RegExp(delimiter === '|' ? '\\|' : delimiter, 'g')) || []).length
    if (count > maxCount) {
      maxCount = count
      detected = delimiter
    }
  }

  return detected
}

/**
 * Lee un archivo y retorna su contenido
 */
export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}

/**
 * Genera un template CSV para un tipo de entidad
 */
export function generateTemplate(
  headers: string[],
  sampleData?: Record<string, string>
): string {
  const rows: string[][] = [headers]

  if (sampleData) {
    rows.push(headers.map(h => sampleData[h] || ''))
  }

  return stringify(rows)
}
