"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Dummy data - will be replaced with API data
  const users = [
    {
      id: "user-001",
      name: "Administrador",
      email: "admin@foodiewagon.com",
      role: "ADMIN",
      createdAt: "2026-01-01",
    },
    {
      id: "user-002",
      name: "Juan Pérez",
      email: "juan@foodiewagon.com",
      role: "USER",
      createdAt: "2026-01-15",
    },
  ]

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los usuarios de la plataforma
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Users table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Nombre</th>
                <th className="text-left p-4 text-sm font-medium">Email</th>
                <th className="text-left p-4 text-sm font-medium">Rol</th>
                <th className="text-left p-4 text-sm font-medium">Fecha</th>
                <th className="text-right p-4 text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-border hover:bg-muted/30"
                >
                  <td className="p-4 text-sm font-medium">{user.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-500/20 text-purple-500"
                          : "bg-blue-500/20 text-blue-500"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {user.createdAt}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1 text-sm text-primary hover:underline">
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron usuarios
          </div>
        )}
      </div>
    </div>
  )
}
