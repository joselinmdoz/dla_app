"use client"

import { ChangeEvent, useState } from "react"
import { ArchiveRestore, Download, FileUp, Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

export default function SystemBackupPage() {
  const [file, setFile] = useState<File | null>(null)
  const [confirmation, setConfirmation] = useState("")
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  async function exportBackup() {
    setExporting(true)
    try {
      const response = await fetch("/api/system-backup")
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo generar la salva")
      }
      const blob = await response.blob()
      const disposition = response.headers.get("Content-Disposition") || ""
      const filename = disposition.match(/filename="?([^";]+)"?/)?.[1] || "dla-salva.json"
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      toast.success("Salva exportada", { description: "Guarda el paquete en una ubicación segura." })
    } catch (error) {
      toast.error("Error al exportar", { description: error instanceof Error ? error.message : "Inténtalo de nuevo" })
    } finally {
      setExporting(false)
    }
  }

  async function importBackup() {
    if (!file || confirmation !== "RESTAURAR") return
    setImporting(true)
    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("confirmation", confirmation)
      const response = await fetch("/api/system-backup", { method: "POST", body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "No se pudo restaurar la salva")
      toast.success("Salva restaurada", { description: `${result.records} registros y ${result.images} imágenes restaurados.` })
      setFile(null)
      setConfirmation("")
    } catch (error) {
      toast.error("Error al restaurar", { description: error instanceof Error ? error.message : "Inténtalo de nuevo" })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Toaster />
      <div>
        <h1 className="text-3xl font-bold">Salvas del sistema</h1>
        <p className="mt-1 text-muted-foreground">Exporta o restaura los datos, configuraciones e imágenes almacenadas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Exportar paquete</CardTitle>
          <CardDescription>Descarga una salva JSON con los registros de la aplicación, configuraciones, usuarios y las imágenes de <code>public/graphics</code>.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportBackup} disabled={exporting}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Descargar salva completa
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ArchiveRestore className="h-5 w-5" /> Restaurar en una base nueva</CardTitle>
          <CardDescription>Primero ejecuta las migraciones de Prisma en el servidor destino. La restauración reemplaza los datos actuales de la aplicación y escribe las imágenes incluidas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-md border border-amber-500/50 bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
            <div className="flex gap-2"><ShieldAlert className="h-5 w-5 shrink-0" /><p>Esta acción elimina y reemplaza los datos existentes. El paquete incluye hashes de contraseña; trátalo como información confidencial. Las variables de entorno y secretos no se importan.</p></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="backup-file">Paquete de salva (.json)</Label>
            <Input id="backup-file" type="file" accept="application/json,.json" onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] || null)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restore-confirmation">Escribe RESTAURAR para confirmar</Label>
            <Input id="restore-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="RESTAURAR" autoComplete="off" />
          </div>
          <Button variant="destructive" onClick={importBackup} disabled={!file || confirmation !== "RESTAURAR" || importing}>
            {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
            Restaurar salva
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
