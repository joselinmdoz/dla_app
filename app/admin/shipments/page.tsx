"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react"
import { useAdminShipments } from "@/hooks/use-admin-shipments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

export default function ShipmentsPage() {
  const router = useRouter()
  const {
    shipments,
    loading,
    error,
    pagination,
    fetchShipments,
    createShipment,
    updateShipment,
    deleteShipment,
  } = useAdminShipments()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchShipments(1, 10, statusFilter, searchTerm)
  }, [fetchShipments, statusFilter])

  const handleOpenModal = (shipment?: any) => {
    if (shipment) {
      router.push(`/admin/shipments/${shipment.id}`)
    } else {
      router.push('/admin/shipments/create')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este envío?")) {
      try {
        await deleteShipment(id)
        toast.success("Envío eliminado correctamente")
      } catch (err: any) {
        toast.error(err.message || "Error al eliminar envío")
      }
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-500",
    IN_TRANSIT: "bg-blue-500/20 text-blue-500",
    DELIVERED: "bg-green-500/20 text-green-500",
    CANCELLED: "bg-red-500/20 text-red-500",
  }

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    IN_TRANSIT: "En proceso",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  }

  return (
    <div className="space-y-6">
      <Toaster />
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Envíos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todos los envíos y pedidos
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Envío
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por HBL o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="in_transit">En proceso</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shipments table */}
      {!loading && !error && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>HBL</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.hbl}</TableCell>
                  <TableCell>{shipment.client?.name || 'Sin cliente'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {shipment.client?.phone || '-'}
                  </TableCell>
                  <TableCell>{shipment.type}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusColors[shipment.status]
                      }`}
                    >
                      {statusLabels[shipment.status] || shipment.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${parseFloat(shipment.price.toString()).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(shipment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(shipment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(shipment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {shipments.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron envíos
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                  {pagination.total} envíos
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => pagination.page > 1 && fetchShipments(pagination.page - 1, pagination.limit, statusFilter, searchTerm)}
                        className={pagination.page === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm text-muted-foreground px-2">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => pagination.page < pagination.totalPages && fetchShipments(pagination.page + 1, pagination.limit, statusFilter, searchTerm)}
                        className={pagination.page === pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
