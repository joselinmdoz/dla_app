"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

interface Product {
  id: string
  name: string
  price: number
  available: boolean
}

interface ShipmentProduct {
  productId: string
  product: Product
  quantity: number
  unitPrice: number
}

interface Client {
  id: string
  name: string
  phone: string
  email: string
  address: string
  province: string
  city: string
}

interface ShippingType {
  id: string
  name: string
  code: string
}

interface CargoCatalog {
  id: string
  name: string
  code: string
}

interface Province {
  id: string
  name: string
}

interface PaymentCatalog {
  id: string
  name: string
  code: string
}

export default function ShipmentFormPage() {
  const router = useRouter()
  const params = useParams()
  const isEditing = params.id && params.id !== "new"

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [shippingTypes, setShippingTypes] = useState<ShippingType[]>([])
  const [cargoTypes, setCargoTypes] = useState<CargoCatalog[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentCatalog[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")

  const [formData, setFormData] = useState({
    hbl: "",
    clientId: "",
    address: "",
    city: "",
    type: "MARITIMO",
    status: "PENDING",
    notes: "",
    trackingUrl: "",
    // Nuevos campos para catálogos
    shippingTypeId: "",
    cargoTypeId: "",
    provinceId: "",
    paymentMethodId: "",
    // Campos adicionales del CSV
    customsTax: "",
    weight: "",
    freeWeight: "",
    discountAmount: "",
    collectedAmount: "",
    offerCode: "",
    memo: "",
  })

  const [shipmentProducts, setShipmentProducts] = useState<ShipmentProduct[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true)
      try {
        // Cargar clientes
        const clientsRes = await fetch("/api/clients")
        const clientsData = await clientsRes.json()
        setClients(clientsData.data || [])

        // Cargar productos
        const productsRes = await fetch("/api/products?showAll=true")
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])

        // Cargar catálogos
        const [stRes, ctRes, provRes, pmRes] = await Promise.all([
          fetch("/api/shipping-types"),
          fetch("/api/cargo-types"),
          fetch("/api/provinces"),
          fetch("/api/payment-methods")
        ])

        const [stData, ctData, provData, pmData] = await Promise.all([
          stRes.json(),
          ctRes.json(),
          provRes.json(),
          pmRes.json()
        ])

        setShippingTypes(stData.data || [])
        setCargoTypes(ctData.data || [])
        setProvinces(provData.data || [])
        setPaymentMethods(pmData.data || [])

        // Si está editando, cargar envío
        if (isEditing) {
          const shipmentRes = await fetch(`/api/shipments/${params.id}`)
          const shipmentData = await shipmentRes.json()
          
          setFormData({
            hbl: shipmentData.hbl,
            clientId: shipmentData.clientId || "",
            address: shipmentData.address,
            city: shipmentData.city || "",
            type: shipmentData.type || "MARITIMO",
            status: shipmentData.status,
            notes: shipmentData.notes || "",
            trackingUrl: shipmentData.trackingUrl || "",
            shippingTypeId: shipmentData.shippingTypeId || "",
            cargoTypeId: shipmentData.cargoTypeId || "",
            provinceId: shipmentData.provinceId || "",
            paymentMethodId: shipmentData.paymentMethodId || "",
            customsTax: shipmentData.customsTax?.toString() || "",
            weight: shipmentData.weight?.toString() || "",
            freeWeight: shipmentData.freeWeight?.toString() || "",
            discountAmount: shipmentData.discountAmount?.toString() || "",
            collectedAmount: shipmentData.collectedAmount?.toString() || "",
            offerCode: shipmentData.offerCode || "",
            memo: shipmentData.memo || "",
          })

          // Cargar productos del envío
          if (shipmentData.products && shipmentData.products.length > 0) {
            setShipmentProducts(
              shipmentData.products.map((sp: any) => ({
                productId: sp.productId,
                product: sp.product,
                quantity: sp.quantity,
                unitPrice: parseFloat(sp.unitPrice.toString()),
              }))
            )
          }
        } else {
          // Generar HBL para nuevo envío
          setFormData((prev) => ({
            ...prev,
            hbl: `CM${Date.now().toString().slice(-10)}`,
          }))
        }
      } catch (err) {
        console.error("Error loading data:", err)
        toast.error("Error al cargar datos")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [isEditing, params.id])

  // Obtener cliente seleccionado para autocompletar dirección
  const selectedClient = clients.find((c) => c.id === formData.clientId)

  // Productos disponibles para agregar (no agregados aún y disponibles)
  const availableProducts = products.filter(
    (p) => p.available && !shipmentProducts.some((sp) => sp.productId === p.id)
  )

  const addProduct = () => {
    if (!selectedProductId) return
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    setShipmentProducts([
      ...shipmentProducts,
      {
        productId: product.id,
        product,
        quantity: 1,
        unitPrice: parseFloat(product.price.toString()),
      },
    ])
    setSelectedProductId("")
  }

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setShipmentProducts(
      shipmentProducts.map((sp) =>
        sp.productId === productId ? { ...sp, quantity } : sp
      )
    )
  }

  const removeProduct = (productId: string) => {
    setShipmentProducts(shipmentProducts.filter((sp) => sp.productId !== productId))
  }

  const calculateTotal = () => {
    return shipmentProducts.reduce((sum, sp) => sum + sp.unitPrice * sp.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        clientId: formData.clientId || null,
        price: calculateTotal(),
        products: shipmentProducts.map((sp) => ({
          productId: sp.productId,
          quantity: sp.quantity,
          unitPrice: sp.unitPrice,
        })),
        // Convertir campos numéricos
        customsTax: formData.customsTax ? parseFloat(formData.customsTax) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        freeWeight: formData.freeWeight ? parseFloat(formData.freeWeight) : null,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : null,
        collectedAmount: formData.collectedAmount ? parseFloat(formData.collectedAmount) : null,
      }

      const url = isEditing
        ? `/api/shipments/${params.id}`
        : "/api/shipments"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al guardar envío")
      }

      toast.success(isEditing ? "Envío actualizado" : "Envío creado")
      router.push("/admin/shipments")
    } catch (err: any) {
      toast.error(err.message || "Error al guardar envío")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/shipments")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Editar Envío" : "Nuevo Envío"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete los datos del envío y agregue productos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos del envío */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hbl">HBL *</Label>
                  <Input
                    id="hbl"
                    value={formData.hbl}
                    onChange={(e) => setFormData({ ...formData, hbl: e.target.value })}
                    required
                    disabled={!!isEditing}
                    placeholder="CM914567966AP"
                  />
                </div>
                <div>
                  <Label htmlFor="clientId">Cliente *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => {
                      const client = clients.find((c) => c.id === value)
                      setFormData({
                        ...formData,
                        clientId: value,
                        address: client?.address || "",
                        provinceId: "",
                        city: client?.city || "",
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shippingTypeId">Tipo de Envío</Label>
                  <Select
                    value={formData.shippingTypeId}
                    onValueChange={(value) => setFormData({ ...formData, shippingTypeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingTypes.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cargoTypeId">Tipo de Mercancía</Label>
                  <Select
                    value={formData.cargoTypeId}
                    onValueChange={(value) => setFormData({ ...formData, cargoTypeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cargoTypes.map((ct) => (
                        <SelectItem key={ct.id} value={ct.id}>
                          {ct.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección de entrega *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provinceId">Provincia *</Label>
                  <Select
                    value={formData.provinceId}
                    onValueChange={(value) => setFormData({ ...formData, provinceId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov.id} value={prov.id}>
                          {prov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="IN_TRANSIT">En proceso</SelectItem>
                      <SelectItem value="DELIVERED">Entregado</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentMethodId">Método de Pago</Label>
                  <Select
                    value={formData.paymentMethodId}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethodId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((pm) => (
                        <SelectItem key={pm.id} value={pm.id}>
                          {pm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="trackingUrl">URL Tracking</Label>
                <Input
                  id="trackingUrl"
                  value={formData.trackingUrl}
                  onChange={(e) => setFormData({ ...formData, trackingUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="memo">Notas / Memo</Label>
                <Textarea
                  id="memo"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  placeholder="Notas adicionales..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Datos financieros y productos */}
          <div className="space-y-6">
            {/* Datos financieros */}
            <Card>
              <CardHeader>
                <CardTitle>Datos Financieros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Libras</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="freeWeight">Libras Gratis</Label>
                    <Input
                      id="freeWeight"
                      type="number"
                      step="0.01"
                      value={formData.freeWeight}
                      onChange={(e) => setFormData({ ...formData, freeWeight: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customsTax">Impuesto Aduana</Label>
                    <Input
                      id="customsTax"
                      type="number"
                      step="0.01"
                      value={formData.customsTax}
                      onChange={(e) => setFormData({ ...formData, customsTax: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="offerCode">Código Oferta</Label>
                    <Input
                      id="offerCode"
                      value={formData.offerCode}
                      onChange={(e) => setFormData({ ...formData, offerCode: e.target.value })}
                      placeholder="CAJA COMPLETA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountAmount">Descuento</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      step="0.01"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="collectedAmount">Cobrado</Label>
                    <Input
                      id="collectedAmount"
                      type="number"
                      step="0.01"
                      value={formData.collectedAmount}
                      onChange={(e) => setFormData({ ...formData, collectedAmount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Productos */}
            <Card>
              <CardHeader>
                <CardTitle>Productos del Envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selector de productos con botón */}
                <div className="space-y-2">
                  <Label>Agregar Producto</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedProductId}
                      onValueChange={setSelectedProductId}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Seleccionar producto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.length > 0 ? (
                          availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${parseFloat(product.price.toString()).toLocaleString()}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            {products.length === 0 ? "No hay productos" : "Todos los productos agregados"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addProduct} disabled={!selectedProductId}>
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>

                {/* Lista de productos agregados */}
                {shipmentProducts.length > 0 ? (
                  <div className="space-y-2">
                    {shipmentProducts.map((sp) => (
                      <div
                        key={sp.productId}
                        className="flex items-center gap-2 p-2 bg-accent rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{sp.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${sp.unitPrice.toLocaleString()} c/u
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={sp.quantity}
                            onChange={(e) =>
                              updateProductQuantity(sp.productId, parseInt(e.target.value))
                            }
                            className="w-20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => removeProduct(sp.productId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">Total:</span>
                      <span className="text-lg font-bold">
                        ${calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay productos agregados
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/shipments")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Guardar cambios" : "Crear envío"}
          </Button>
        </div>
      </form>
    </div>
  )
}
