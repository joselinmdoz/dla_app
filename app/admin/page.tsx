"use client"

import { StatsCard } from "@/components/admin/stats-card"
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  // Dummy data - will be replaced with API data
  const stats = {
    totalShipments: 156,
    pendingShipments: 23,
    inTransitShipments: 45,
    deliveredShipments: 88,
    totalRevenue: 45680,
  }

  const recentShipments = [
    { id: "HBL-001", client: "Juan Pérez", status: "pending", type: "MARITIMO", price: 1250 },
    { id: "HBL-002", client: "María García", status: "in_transit", type: "AEREO", price: 890 },
    { id: "HBL-003", client: "Carlos López", status: "delivered", type: "MARITIMO", price: 2100 },
    { id: "HBL-004", client: "Ana Martínez", status: "pending", type: "MARITIMO", price: 750 },
    { id: "HBL-005", client: "Roberto Sánchez", status: "in_transit", type: "AEREO", price: 1500 },
  ]

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-500",
    in_transit: "bg-blue-500/20 text-blue-500",
    delivered: "bg-green-500/20 text-green-500",
    cancelled: "bg-red-500/20 text-red-500",
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido al panel de administración de Foodie Wagon
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Productos"
          value={stats.totalShipments}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Categorías"
          value={stats.pendingShipments}
          icon={Clock}
          description="Activas"
        />
        <StatsCard
          title="Pedidos Hoy"
          value={stats.inTransitShipments}
          icon={Truck}
        />
        <StatsCard
          title="Entregados"
          value={stats.deliveredShipments}
          icon={CheckCircle}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Revenue card */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title="Ingresos Totales"
          value={`${stats.totalRevenue.toLocaleString('en-US')}`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Pedidos Este Mes"
          value={45}
          icon={TrendingUp}
          description="Completados: 40"
        />
      </div>

      {/* Recent shipments */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pedidos Recientes</h2>
          <Link
            href="/admin/products"
            className="text-sm text-primary hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium">ID</th>
                <th className="text-left p-4 text-sm font-medium">Cliente</th>
                <th className="text-left p-4 text-sm font-medium">Tipo</th>
                <th className="text-left p-4 text-sm font-medium">Estado</th>
                <th className="text-right p-4 text-sm font-medium">Precio</th>
                <th className="text-right p-4 text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recentShipments.map((shipment) => (
                <tr key={shipment.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-4 text-sm font-medium">{shipment.id}</td>
                  <td className="p-4 text-sm">{shipment.client}</td>
                  <td className="p-4 text-sm">
                    <span className="px-2 py-1 bg-accent rounded text-xs">
                      {shipment.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusColors[shipment.status as keyof typeof statusColors]
                      }`}
                    >
                      {shipment.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    ${shipment.price.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/products`}
                      className="text-primary hover:underline text-sm"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
