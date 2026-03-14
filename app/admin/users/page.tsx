"use client"

import { useEffect, useMemo, useState } from "react"
import { Edit, Plus, Search, Trash2 } from "lucide-react"
import { ADMIN_PERMISSION_DEFINITIONS, type AdminPermission } from "@/lib/admin-permissions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

type UserRecord = {
  id: string
  name: string | null
  email: string
  role: "ADMIN" | "USER"
  isActive: boolean
  permissions: AdminPermission[]
  createdAt: string
}

type CurrentUser = {
  id: string
}

type UserFormState = {
  name: string
  email: string
  password: string
  role: "ADMIN" | "USER"
  isActive: boolean
  permissions: AdminPermission[]
}

const EMPTY_FORM: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "USER",
  isActive: true,
  permissions: [],
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM)

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users
    const value = searchTerm.toLowerCase()
    return users.filter(
      (user) =>
        (user.name || "").toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value)
    )
  }, [users, searchTerm])

  async function fetchCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" })
      if (!response.ok) return
      const data = (await response.json()) as { user: CurrentUser }
      setCurrentUser(data.user)
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  async function fetchUsers() {
    try {
      setIsLoading(true)
      const query = searchTerm.trim()
        ? `?search=${encodeURIComponent(searchTerm.trim())}`
        : ""
      const response = await fetch(`/api/users${query}`, { cache: "no-store" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al cargar usuarios")
      }
      const data = (await response.json()) as { data: UserRecord[] }
      setUsers(data.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar usuarios")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers()
    }, 250)

    return () => clearTimeout(timeout)
  }, [searchTerm])

  function openCreateDialog() {
    setEditingUser(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEditDialog(user: UserRecord) {
    setEditingUser(user)
    setForm({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions,
    })
    setDialogOpen(true)
  }

  function closeDialog() {
    if (isSaving) return
    setDialogOpen(false)
    setEditingUser(null)
    setForm(EMPTY_FORM)
  }

  function togglePermission(permission: AdminPermission) {
    setForm((prev) => {
      if (prev.permissions.includes(permission)) {
        return {
          ...prev,
          permissions: prev.permissions.filter((item) => item !== permission),
        }
      }
      return { ...prev, permissions: [...prev.permissions, permission] }
    })
  }

  async function handleSubmit() {
    try {
      setIsSaving(true)

      const payload = {
        name: form.name.trim() || null,
        email: form.email.trim().toLowerCase(),
        role: form.role,
        isActive: form.isActive,
        permissions: form.role === "ADMIN" ? [] : form.permissions,
        ...(form.password ? { password: form.password } : {}),
      }

      if (!payload.email) {
        throw new Error("El email es requerido")
      }

      if (!editingUser && !form.password) {
        throw new Error("La contraseña es requerida para crear usuarios")
      }

      const endpoint = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al guardar usuario")
      }

      toast.success(editingUser ? "Usuario actualizado" : "Usuario creado")
      closeDialog()
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar usuario")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(user: UserRecord) {
    if (!confirm(`¿Eliminar usuario ${user.email}?`)) return

    try {
      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar usuario")
      }

      toast.success("Usuario eliminado")
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar usuario")
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona usuarios y permisos de acceso al panel
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o email..."
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Permisos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name || "Sin nombre"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-primary/20 text-primary"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell className="max-w-[260px]">
                  {user.role === "ADMIN"
                    ? "Acceso total"
                    : user.permissions.length > 0
                      ? user.permissions.length
                      : "Sin permisos"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user)}
                      disabled={currentUser?.id === user.id}
                      title={
                        currentUser?.id === user.id
                          ? "No puedes eliminar tu propio usuario"
                          : "Eliminar usuario"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar usuario" : "Crear usuario"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nombre del usuario"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="usuario@dominio.com"
                />
              </div>

              <div>
                <Label>
                  {editingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
                </Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder={editingUser ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"}
                />
              </div>

              <div>
                <Label>Rol</Label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role: e.target.value === "ADMIN" ? "ADMIN" : "USER",
                    }))
                  }
                  className="w-full h-10 px-3 rounded-md border border-border bg-background"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium">Usuario activo</p>
                <p className="text-xs text-muted-foreground">
                  Si está inactivo no podrá iniciar sesión
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label>Permisos de menú y vistas</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecciona las secciones a las que el usuario podrá acceder.
                </p>
              </div>

              {form.role === "ADMIN" ? (
                <div className="text-sm text-muted-foreground border border-border rounded-lg p-3">
                  Los usuarios ADMIN tienen acceso total al panel.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ADMIN_PERMISSION_DEFINITIONS.map((permission) => (
                    <label
                      key={permission.key}
                      className="flex items-start gap-3 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/40"
                    >
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(permission.key)}
                        onChange={() => togglePermission(permission.key)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-medium">
                          {permission.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {permission.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Guardando..." : editingUser ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
