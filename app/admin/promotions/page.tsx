"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import QRCode from "qrcode"
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import {
  ADMIN_PERMISSIONS,
  hasAnyPermission,
  type AdminPermission,
} from "@/lib/admin-permissions"

type PromotionCode = {
  id: string
  promotionName: string
  publicCode: string
  status: "ACTIVE" | "REDEEMED" | "CANCELLED" | "EXPIRED"
  issuedByEmail: string | null
  issuedTo: string | null
  notes: string | null
  expiresAt: string | null
  redeemedByEmail: string | null
  redeemedAt: string | null
  cancelledByEmail: string | null
  cancelledAt: string | null
  createdAt: string
}

type AuditRow = {
  id: string
  promotionCodeId: string | null
  action: string
  performedByEmail: string | null
  ip: string | null
  message: string | null
  createdAt: string
}

type AuthMe = {
  user: {
    id: string
    role: string
    permissions: AdminPermission[]
  }
}

type LastGeneratedCode = {
  id: string
  promotionName: string
  publicCode: string
  redeemToken: string
  qrPayload: string
  qrImage: string
  expiresAt: string | null
}

type PreviewCode = {
  id: string
  promotionName: string
  publicCode: string
  qrPayload: string
  qrImage: string
  expiresAt: string | null
}

type ShareableQrCode = {
  publicCode: string
  qrImage: string
}

type BarcodeDetectorResult = {
  rawValue?: string
}

type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource) => Promise<BarcodeDetectorResult[]>
}

type BarcodeDetectorConstructor = {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance
  getSupportedFormats?: () => Promise<string[]>
}

type ZxingControls = {
  stop: () => void
}

function getBarcodeDetectorConstructor():
  | BarcodeDetectorConstructor
  | undefined {
  return (
    globalThis as typeof globalThis & {
      BarcodeDetector?: BarcodeDetectorConstructor
    }
  ).BarcodeDetector
}

function formatDate(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("es-ES")
}

function statusBadge(status: PromotionCode["status"]) {
  if (status === "ACTIVE") return "bg-emerald-500/20 text-emerald-400"
  if (status === "REDEEMED") return "bg-blue-500/20 text-blue-400"
  if (status === "CANCELLED") return "bg-red-500/20 text-red-400"
  return "bg-amber-500/20 text-amber-400"
}

function statusLabel(status: PromotionCode["status"]) {
  if (status === "ACTIVE") return "Activo"
  if (status === "REDEEMED") return "Canjeado"
  if (status === "CANCELLED") return "Cancelado"
  return "Expirado"
}

export default function PromotionsPage() {
  const [codes, setCodes] = useState<PromotionCode[]>([])
  const [audit, setAudit] = useState<AuditRow[]>([])
  const [search, setSearch] = useState("")
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)
  const [isLoadingAudit, setIsLoadingAudit] = useState(false)
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState("USER")
  const [currentUserPermissions, setCurrentUserPermissions] = useState<AdminPermission[]>([])
  const [lastGenerated, setLastGenerated] = useState<LastGeneratedCode | null>(null)
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean
    reason: string
    code: PromotionCode | null
  } | null>(null)

  const [issueForm, setIssueForm] = useState({
    promotionName: "",
    issuedTo: "",
    expiresAt: "",
    notes: "",
  })
  const [verifyValue, setVerifyValue] = useState("")
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isStartingScanner, setIsStartingScanner] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const [previewCode, setPreviewCode] = useState<PreviewCode | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const zxingControlsRef = useRef<ZxingControls | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const scanFrameRef = useRef<number | null>(null)

  const canIssue = hasAnyPermission(currentUserRole, currentUserPermissions, [
    ADMIN_PERMISSIONS.PROMOTIONS_ISSUE,
    ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
  ])
  const canRedeem = hasAnyPermission(currentUserRole, currentUserPermissions, [
    ADMIN_PERMISSIONS.PROMOTIONS_REDEEM,
    ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
  ])
  const canAudit = hasAnyPermission(currentUserRole, currentUserPermissions, [
    ADMIN_PERMISSIONS.PROMOTIONS_AUDIT,
    ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
  ])
  const canManage = hasAnyPermission(currentUserRole, currentUserPermissions, [
    ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
  ])

  const filteredCodes = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return codes
    return codes.filter((code) =>
      code.publicCode.toLowerCase().includes(term) ||
      code.promotionName.toLowerCase().includes(term) ||
      (code.issuedTo || "").toLowerCase().includes(term)
    )
  }, [codes, search])

  async function fetchCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" })
      if (!response.ok) return
      const data = (await response.json()) as AuthMe
      setCurrentUserRole(data.user.role)
      setCurrentUserPermissions(data.user.permissions)
    } catch (error) {
      console.error("Error loading current user:", error)
    }
  }

  async function fetchCodes() {
    try {
      setIsLoadingCodes(true)
      const response = await fetch("/api/promotions", { cache: "no-store" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al cargar códigos")
      }
      const data = (await response.json()) as { data: PromotionCode[] }
      setCodes(data.data || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar códigos")
    } finally {
      setIsLoadingCodes(false)
    }
  }

  async function fetchAudit() {
    if (!canAudit) return
    try {
      setIsLoadingAudit(true)
      const response = await fetch("/api/promotions/audit?limit=100", {
        cache: "no-store",
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al cargar auditoría")
      }
      const data = (await response.json()) as { data: AuditRow[] }
      setAudit(data.data || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar auditoría")
    } finally {
      setIsLoadingAudit(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    fetchCodes()
  }, [])

  useEffect(() => {
    fetchAudit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAudit])

  async function handleIssueCode() {
    try {
      if (!canIssue) {
        toast.error("No tienes permisos para emitir promociones")
        return
      }
      if (!issueForm.promotionName.trim()) {
        toast.error("Debes indicar el nombre de la promoción")
        return
      }

      setIsSubmittingIssue(true)
      const response = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotionName: issueForm.promotionName.trim(),
          issuedTo: issueForm.issuedTo.trim() || null,
          expiresAt: issueForm.expiresAt || null,
          notes: issueForm.notes.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "No se pudo emitir el código")
      }

      const data = (await response.json()) as {
        data: PromotionCode
        redeemToken: string
        qrPayload: string
      }

      const qrImage = await QRCode.toDataURL(data.qrPayload, {
        width: 320,
        margin: 1,
        errorCorrectionLevel: "M",
      })

      setLastGenerated({
        id: data.data.id,
        promotionName: data.data.promotionName,
        publicCode: data.data.publicCode,
        redeemToken: data.redeemToken,
        qrPayload: data.qrPayload,
        qrImage,
        expiresAt: data.data.expiresAt,
      })

      setIssueForm({
        promotionName: "",
        issuedTo: "",
        expiresAt: "",
        notes: "",
      })

      toast.success("Código promocional generado")
      fetchCodes()
      fetchAudit()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al emitir código")
    } finally {
      setIsSubmittingIssue(false)
    }
  }

  async function handleVerify() {
    try {
      if (!verifyValue.trim()) {
        toast.error("Ingresa o pega el código a validar")
        return
      }
      setIsVerifying(true)
      setVerifyResult(null)
      const response = await fetch("/api/promotions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: verifyValue.trim() }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al verificar código")
      }
      const data = (await response.json()) as {
        valid: boolean
        reason: string
        code: PromotionCode | null
      }
      setVerifyResult(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al verificar código")
    } finally {
      setIsVerifying(false)
    }
  }

  async function handleRedeem() {
    try {
      if (!canRedeem) {
        toast.error("No tienes permisos para canjear códigos")
        return
      }
      if (!verifyValue.trim()) {
        toast.error("Ingresa o pega el código a canjear")
        return
      }
      setIsRedeeming(true)
      const response = await fetch("/api/promotions/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: verifyValue.trim() }),
      })
      const data = (await response.json()) as {
        success?: boolean
        reason?: string
        error?: string
        code?: PromotionCode | null
      }

      if (!response.ok) {
        throw new Error(data.error || data.reason || "No se pudo canjear")
      }

      if (!data.success) {
        setVerifyResult({
          valid: false,
          reason: data.reason || "No se pudo canjear",
          code: (data.code as PromotionCode | null) ?? null,
        })
        toast.error(data.reason || "No se pudo canjear")
        return
      }

      const redeemedCode = data.code as PromotionCode
      toast.success(`Código ${redeemedCode.publicCode} canjeado`)
      setVerifyResult({
        valid: false,
        reason: "Código canjeado correctamente",
        code: redeemedCode,
      })
      fetchCodes()
      fetchAudit()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al canjear")
    } finally {
      setIsRedeeming(false)
    }
  }

  async function stopScanner() {
    if (zxingControlsRef.current) {
      try {
        zxingControlsRef.current.stop()
      } catch {
        // ignore
      }
      zxingControlsRef.current = null
    }

    if (scanFrameRef.current !== null) {
      cancelAnimationFrame(scanFrameRef.current)
      scanFrameRef.current = null
    }

    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        track.stop()
      }
      mediaStreamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
  }

  async function startScanner() {
    if (isStartingScanner || mediaStreamRef.current || zxingControlsRef.current) return
    if (!videoRef.current) return

    setScannerError(null)
    setIsStartingScanner(true)

    try {
      try {
        const zxing = (await import("@zxing/browser")) as unknown as {
          BrowserQRCodeReader: {
            new (): {
              decodeFromVideoDevice: (
                deviceId: string | undefined,
                video: HTMLVideoElement,
                callbackFn: (result?: { getText: () => string } | null) => void
              ) => Promise<ZxingControls>
            }
            listVideoInputDevices: () => Promise<
              { deviceId: string; label: string }[]
            >
          }
        }

        const devices = await zxing.BrowserQRCodeReader.listVideoInputDevices()
        if (devices.length > 0) {
          const preferred = devices.find((device) =>
            /back|rear|environment/i.test(device.label)
          )
          const deviceId = preferred?.deviceId ?? devices[0].deviceId
          const reader = new zxing.BrowserQRCodeReader()

          zxingControlsRef.current = await reader.decodeFromVideoDevice(
            deviceId,
            videoRef.current,
            async (result) => {
              if (!result) return
              setVerifyValue(result.getText())
              toast.success("QR detectado")
              await stopScanner()
              setIsScannerOpen(false)
            }
          )
          return
        }
      } catch (error) {
        console.warn("ZXing scanner unavailable, falling back to BarcodeDetector:", error)
      }

      const BarcodeDetectorCtor = getBarcodeDetectorConstructor()

      if (!BarcodeDetectorCtor) {
        setScannerError(
          "No se pudo iniciar ZXing y este navegador no soporta escaneo QR integrado."
        )
        return
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerError("Tu navegador no soporta cámara.")
        return
      }

      const supportedFormats = BarcodeDetectorCtor.getSupportedFormats
        ? await BarcodeDetectorCtor.getSupportedFormats()
        : ["qr_code"]

      if (!supportedFormats.includes("qr_code")) {
        setScannerError(
          "La camara esta disponible, pero el navegador no soporta lectura QR."
        )
        return
      }

      const detector = new BarcodeDetectorCtor({
        formats: ["qr_code"],
      })
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      })

      mediaStreamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d", {
        willReadFrequently: true,
      })

      if (!context) {
        setScannerError("No se pudo inicializar el lector de imagen.")
        await stopScanner()
        return
      }

      const scan = async () => {
        if (!videoRef.current || !mediaStreamRef.current) return

        if (
          videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          videoRef.current.videoWidth > 0 &&
          videoRef.current.videoHeight > 0
        ) {
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

          try {
            const results = await detector.detect(canvas)
            const value = results.find((result) => result.rawValue)?.rawValue

            if (value) {
              setVerifyValue(value)
              toast.success("QR detectado")
              await stopScanner()
              setIsScannerOpen(false)
              return
            }
          } catch {
            // Some browsers throw while the video stream is warming up.
          }
        }

        scanFrameRef.current = requestAnimationFrame(() => {
          void scan()
        })
      }

      scanFrameRef.current = requestAnimationFrame(() => {
        void scan()
      })
    } catch (error) {
      console.error("Error starting QR scanner:", error)
      setScannerError("No se pudo iniciar la cámara.")
      await stopScanner()
    } finally {
      setIsStartingScanner(false)
    }
  }

  useEffect(() => {
    if (!isScannerOpen) {
      stopScanner()
      return
    }
    startScanner()
    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScannerOpen])

  async function handleCancelById(codeId: string) {
    if (!canManage) {
      toast.error("No tienes permisos para cancelar códigos")
      return
    }
    if (!confirm("¿Cancelar este código promocional?")) return

    try {
      const response = await fetch(`/api/promotions/${codeId}/cancel`, {
        method: "POST",
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo cancelar el código")
      }
      toast.success("Código cancelado")
      fetchCodes()
      fetchAudit()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cancelar")
    }
  }

  async function copyToClipboard(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copiado`)
    } catch {
      toast.error(`No se pudo copiar ${label.toLowerCase()}`)
    }
  }

  function buildCodeQrPayload(publicCode: string) {
    if (typeof window === "undefined") return publicCode
    const url = new URL("/promo/claim", window.location.origin)
    url.searchParams.set("code", publicCode)
    return url.toString()
  }

  async function openCodePreview(code: PromotionCode) {
    try {
      const qrPayload = buildCodeQrPayload(code.publicCode)
      const qrImage = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 1,
        errorCorrectionLevel: "M",
      })

      setPreviewCode({
        id: code.id,
        promotionName: code.promotionName,
        publicCode: code.publicCode,
        qrPayload,
        qrImage,
        expiresAt: code.expiresAt,
      })
    } catch {
      toast.error("No se pudo reconstruir el QR")
    }
  }

  function downloadQrImage(code: ShareableQrCode) {
    try {
      const link = document.createElement("a")
      link.href = code.qrImage
      link.download = `promo-${code.publicCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("QR descargado")
    } catch {
      toast.error("No se pudo descargar el QR")
    }
  }

  async function sharePromotion(code: ShareableQrCode) {
    try {
      const qrResponse = await fetch(code.qrImage)
      const qrBlob = await qrResponse.blob()
      const qrFile = new File([qrBlob], `promo-${code.publicCode}.png`, {
        type: qrBlob.type || "image/png",
      })

      const shareData: ShareData = { files: [qrFile] }
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean
      }

      if (!navigator.share || (nav.canShare && !nav.canShare(shareData))) {
        downloadQrImage(code)
        toast.info("Tu navegador no permite compartir archivos. Se descargó el QR.")
        return
      }

      await navigator.share(shareData)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      toast.error("No se pudo compartir la imagen QR")
    }
  }

  async function copyQrImage(code: ShareableQrCode) {
    try {
      const qrResponse = await fetch(code.qrImage)
      const qrBlob = await qrResponse.blob()

      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [qrBlob.type || "image/png"]: qrBlob,
          }),
        ])
        toast.success("Imagen QR copiada")
        return
      }

      await copyToClipboard(code.qrImage, "Imagen QR (URL)")
    } catch {
      toast.error("No se pudo copiar la imagen QR")
    }
  }

  function openQrImage(code: ShareableQrCode) {
    try {
      const newTab = window.open("", "_blank", "noopener,noreferrer")
      if (!newTab) {
        toast.error("No se pudo abrir la imagen QR")
        return
      }

      newTab.document.title = `QR ${code.publicCode}`
      newTab.document.body.style.margin = "0"
      newTab.document.body.style.display = "grid"
      newTab.document.body.style.placeItems = "center"
      newTab.document.body.style.background = "#111827"
      newTab.document.body.innerHTML = `<img src="${code.qrImage}" alt="QR ${code.publicCode}" style="max-width:95vw;max-height:95vh;object-fit:contain;" />`
    } catch {
      toast.error("No se pudo abrir la imagen QR")
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div>
        <h1 className="text-3xl font-bold">Promociones QR</h1>
        <p className="text-muted-foreground mt-1">
          Emite códigos únicos, valídalos manualmente o por QR y márcalos como
          canjeados para evitar reutilización.
        </p>
      </div>

      <Tabs defaultValue="issue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issue" disabled={!canIssue}>
            Emitir
          </TabsTrigger>
          <TabsTrigger value="redeem" disabled={!canRedeem && !canAudit}>
            Validar / Canjear
          </TabsTrigger>
          <TabsTrigger value="codes">Códigos</TabsTrigger>
          <TabsTrigger value="audit" disabled={!canAudit}>
            Auditoría
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-xl font-semibold">Generar nuevo código</h2>
              <div className="space-y-3">
                <div>
                  <Label>Nombre de la promoción</Label>
                  <Input
                    value={issueForm.promotionName}
                    onChange={(e) =>
                      setIssueForm((prev) => ({
                        ...prev,
                        promotionName: e.target.value,
                      }))
                    }
                    placeholder="Ej: 10% descuento bienvenida"
                  />
                </div>
                <div>
                  <Label>Destinatario (opcional)</Label>
                  <Input
                    value={issueForm.issuedTo}
                    onChange={(e) =>
                      setIssueForm((prev) => ({ ...prev, issuedTo: e.target.value }))
                    }
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <Label>Fecha de expiración (opcional)</Label>
                  <Input
                    type="datetime-local"
                    value={issueForm.expiresAt}
                    onChange={(e) =>
                      setIssueForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Notas (opcional)</Label>
                  <textarea
                    className="w-full min-h-[90px] p-2 border border-border rounded-md bg-background"
                    value={issueForm.notes}
                    onChange={(e) =>
                      setIssueForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Condiciones o detalles internos"
                  />
                </div>
              </div>
              <Button onClick={handleIssueCode} disabled={isSubmittingIssue || !canIssue}>
                <QrCode className="w-4 h-4 mr-2" />
                {isSubmittingIssue ? "Generando..." : "Generar QR"}
              </Button>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-xl font-semibold">Último código generado</h2>
              {!lastGenerated ? (
                <p className="text-muted-foreground text-sm">
                  Aún no has generado códigos en esta sesión.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <img
                      src={lastGenerated.qrImage}
                      alt={`QR de ${lastGenerated.publicCode}`}
                      className="w-56 h-56 rounded-lg border border-border bg-white p-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Promoción:</span>{" "}
                      <span className="font-medium">{lastGenerated.promotionName}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Código manual:</span>{" "}
                      <span className="font-semibold">{lastGenerated.publicCode}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Expira:</span>{" "}
                      {formatDate(lastGenerated.expiresAt)}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(lastGenerated.publicCode, "Código manual")
                      }
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar código
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(lastGenerated.qrPayload, "Enlace QR")
                      }
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar enlace
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => downloadQrImage(lastGenerated)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar QR
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openQrImage(lastGenerated)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir imagen
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => sharePromotion(lastGenerated)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartir
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyQrImage(lastGenerated)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar imagen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="redeem" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-xl font-semibold">Validar por QR o manual</h2>
            <p className="text-sm text-muted-foreground">
              Pega el contenido escaneado del QR o escribe el código manual
              (ej: <code>PRM-ABCD-1234</code>).
            </p>
            <div className="flex flex-col md:flex-row gap-2">
              <Input
                value={verifyValue}
                onChange={(e) => setVerifyValue(e.target.value)}
                placeholder="Token QR, URL o código manual"
              />
              <Button
                variant="outline"
                onClick={() => setIsScannerOpen(true)}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Escanear
              </Button>
              <Button
                variant="outline"
                onClick={handleVerify}
                disabled={isVerifying}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {isVerifying ? "Verificando..." : "Verificar"}
              </Button>
              <Button onClick={handleRedeem} disabled={isRedeeming || !canRedeem}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isRedeeming ? "Canjeando..." : "Canjear"}
              </Button>
            </div>

            {verifyResult && (
              <div
                className={`rounded-lg border p-4 ${
                  verifyResult.valid
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-amber-500/40 bg-amber-500/10"
                }`}
              >
                <p className="font-medium">{verifyResult.reason}</p>
                {verifyResult.code && (
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    <p>
                      Código:{" "}
                      <span className="font-medium text-foreground">
                        {verifyResult.code.publicCode}
                      </span>
                    </p>
                    <p>
                      Promoción:{" "}
                      <span className="font-medium text-foreground">
                        {verifyResult.code.promotionName}
                      </span>
                    </p>
                    <p>
                      Estado:{" "}
                      <span className="font-medium text-foreground">
                        {statusLabel(verifyResult.code.status)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {isScannerOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
              <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Escanear QR</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setIsScannerOpen(false)}
                  >
                    Cerrar
                  </Button>
                </div>

                <div className="rounded-xl overflow-hidden border border-border bg-black">
                  <video
                    ref={videoRef}
                    className="w-full aspect-video object-contain"
                    muted
                    playsInline
                  />
                </div>

                {isStartingScanner && (
                  <p className="text-sm text-muted-foreground">
                    Iniciando cámara...
                  </p>
                )}
                {scannerError && (
                  <p className="text-sm text-red-500">{scannerError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Si no detecta QR, asegúrate de estar en https o localhost y
                  dar permisos a la cámara.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, promoción o destinatario"
            />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Código</th>
                    <th className="text-left p-3 text-sm font-medium">Promoción</th>
                    <th className="text-left p-3 text-sm font-medium">Estado</th>
                    <th className="text-left p-3 text-sm font-medium">Expira</th>
                    <th className="text-left p-3 text-sm font-medium">Emitido</th>
                    <th className="text-right p-3 text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((code) => (
                    <tr key={code.id} className="border-t border-border">
                      <td className="p-3 text-sm font-semibold">{code.publicCode}</td>
                      <td className="p-3 text-sm">{code.promotionName}</td>
                      <td className="p-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(code.status)}`}
                        >
                          {statusLabel(code.status)}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(code.expiresAt)}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(code.createdAt)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setVerifyValue(code.publicCode)
                              toast.info("Código cargado en el validador")
                            }}
                          >
                            <Search className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCodePreview(code)}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          {canManage && code.status === "ACTIVE" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelById(code.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!isLoadingCodes && filteredCodes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No hay códigos para mostrar.
                      </td>
                    </tr>
                  )}
                  {isLoadingCodes && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Cargando códigos...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Fecha</th>
                    <th className="text-left p-3 text-sm font-medium">Acción</th>
                    <th className="text-left p-3 text-sm font-medium">Usuario</th>
                    <th className="text-left p-3 text-sm font-medium">IP</th>
                    <th className="text-left p-3 text-sm font-medium">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="p-3 text-sm font-medium">{row.action}</td>
                      <td className="p-3 text-sm">{row.performedByEmail || "-"}</td>
                      <td className="p-3 text-sm text-muted-foreground">{row.ip || "-"}</td>
                      <td className="p-3 text-sm">{row.message || "-"}</td>
                    </tr>
                  ))}
                  {!isLoadingAudit && audit.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No hay eventos en la auditoría.
                      </td>
                    </tr>
                  )}
                  {isLoadingAudit && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        Cargando auditoría...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </TabsContent>
      </Tabs>

      {previewCode && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">QR del codigo emitido</h3>
                <p className="text-sm text-muted-foreground">
                  {previewCode.promotionName}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setPreviewCode(null)}
              >
                Cerrar
              </Button>
            </div>

            <div className="flex justify-center">
              <img
                src={previewCode.qrImage}
                alt={`QR de ${previewCode.publicCode}`}
                className="w-64 h-64 rounded-lg border border-border bg-white p-2"
              />
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Codigo manual:</span>{" "}
                <span className="font-semibold">{previewCode.publicCode}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Expira:</span>{" "}
                {formatDate(previewCode.expiresAt)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  copyToClipboard(previewCode.publicCode, "Código manual")
                }
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar codigo
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadQrImage(previewCode)}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar QR
              </Button>
              <Button
                variant="outline"
                onClick={() => sharePromotion(previewCode)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir QR
              </Button>
              <Button
                variant="outline"
                onClick={() => copyQrImage(previewCode)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar imagen
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Uso manual desde PC</p>
        <p>
          Si no puedes escanear el QR, el cliente te muestra su{" "}
          <strong className="text-foreground">código manual</strong> (ej:
          PRM-XXXX-XXXX). Lo pegas en <strong className="text-foreground">Validar / Canjear</strong>{" "}
          y haces el canje.
        </p>
      </div>
    </div>
  )
}
