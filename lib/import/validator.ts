import { z } from 'zod'

// Zod Schemas para validación de entidades

export const ProductImportSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  costPrice: z.number().nonnegative().optional(),
  image: z.string().optional(),
  categoryName: z.string().min(1, 'La categoría es requerida'),
  spiceLevel: z.number().min(0).max(5).optional(),
  available: z.boolean().optional(),
  sortOrder: z.number().int().optional()
})

export const CategoryImportSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional()
})

export const ClientImportSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  address: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional()
})

export const ShipmentImportSchema = z.object({
  hbl: z.string().min(1, 'El HBL es requerido'),
  clientEmail: z.string().email('Email del cliente inválido'),
  address: z.string().min(1, 'La dirección es requerida'),
  province: z.string().min(1, 'La provincia es requerida'),
  city: z.string().optional(),
  type: z.enum(['MARITIMO', 'AEREO', 'TERRESTRE']).optional(),
  status: z.enum(['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']).optional(),
  price: z.number().nonnegative().optional(),
  notes: z.string().optional()
})

export type ProductImport = z.infer<typeof ProductImportSchema>
export type CategoryImport = z.infer<typeof CategoryImportSchema>
export type ClientImport = z.infer<typeof ClientImportSchema>
export type ShipmentImport = z.infer<typeof ShipmentImportSchema>

// Tipo unión para cualquier entidad
export type ImportEntity = 
  | { type: 'PRODUCT'; data: ProductImport }
  | { type: 'CATEGORY'; data: CategoryImport }
  | { type: 'CLIENT'; data: ClientImport }
  | { type: 'SHIPMENT'; data: ShipmentImport }

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors: ValidationError[]
}

export interface ValidationError {
  row: number
  field: string
  message: string
  value: unknown
}

export interface ImportSummary {
  total: number
  success: number
  errors: number
  warnings: number
}

/**
 * Valida un array de productos
 */
export function validateProducts(data: Record<string, unknown>[]): {
  valid: ProductImport[]
  errors: ValidationError[]
} {
  const valid: ProductImport[] = []
  const errors: ValidationError[] = []

  data.forEach((row, index) => {
    const result = ProductImportSchema.safeParse(row)
    if (result.success) {
      valid.push(result.data)
    } else {
      result.error.errors.forEach(err => {
        errors.push({
          row: index + 1,
          field: err.path.join('.'),
          message: err.message,
          value: row[err.path[0] as string]
        })
      })
    }
  })

  return { valid, errors }
}

/**
 * Valida un array de categorías
 */
export function validateCategories(data: Record<string, unknown>[]): {
  valid: CategoryImport[]
  errors: ValidationError[]
} {
  const valid: CategoryImport[] = []
  const errors: ValidationError[] = []

  data.forEach((row, index) => {
    const result = CategoryImportSchema.safeParse(row)
    if (result.success) {
      valid.push(result.data)
    } else {
      result.error.errors.forEach(err => {
        errors.push({
          row: index + 1,
          field: err.path.join('.'),
          message: err.message,
          value: row[err.path[0] as string]
        })
      })
    }
  })

  return { valid, errors }
}

/**
 * Valida un array de clientes
 */
export function validateClients(data: Record<string, unknown>[]): {
  valid: ClientImport[]
  errors: ValidationError[]
} {
  const valid: ClientImport[] = []
  const errors: ValidationError[] = []

  data.forEach((row, index) => {
    const result = ClientImportSchema.safeParse(row)
    if (result.success) {
      valid.push(result.data)
    } else {
      result.error.errors.forEach(err => {
        errors.push({
          row: index + 1,
          field: err.path.join('.'),
          message: err.message,
          value: row[err.path[0] as string]
        })
      })
    }
  })

  return { valid, errors }
}

/**
 * Valida un array de envíos
 */
export function validateShipments(data: Record<string, unknown>[]): {
  valid: ShipmentImport[]
  errors: ValidationError[]
} {
  const valid: ShipmentImport[] = []
  const errors: ValidationError[] = []

  data.forEach((row, index) => {
    const result = ShipmentImportSchema.safeParse(row)
    if (result.success) {
      valid.push(result.data)
    } else {
      result.error.errors.forEach(err => {
        errors.push({
          row: index + 1,
          field: err.path.join('.'),
          message: err.message,
          value: row[err.path[0] as string]
        })
      })
    }
  })

  return { valid, errors }
}

/**
 * Genera un resumen de validación
 */
export function generateSummary(
  total: number,
  errors: ValidationError[]
): ImportSummary {
  const uniqueRows = new Set(errors.map(e => e.row))
  return {
    total,
    success: total - uniqueRows.size,
    errors: errors.length,
    warnings: 0
  }
}
