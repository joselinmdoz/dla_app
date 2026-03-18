"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Plus, Search, Trash2, Image as ImageIcon, Eye } from "lucide-react"
import { useAdminProducts } from "@/hooks/use-admin-products"
import { useAdminCategories } from "@/hooks/use-admin-categories"
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
import { Switch } from "@/components/ui/switch"
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

interface ContentItem {
  item: string
  quantity: string
}

interface ProductDetailContent {
  boxItems: ContentItem[]
  features: string[]
  includes: ContentItem[]
  deliveryTime: string
  rating: string
  reviews: string
}

function isContentItem(value: unknown): value is ContentItem {
  if (!value || typeof value !== "object") return false
  const item = (value as Record<string, unknown>).item
  const quantity = (value as Record<string, unknown>).quantity
  return typeof item === "string" && typeof quantity === "string"
}

function parseProductDetailContent(raw: unknown): ProductDetailContent {
  const empty: ProductDetailContent = {
    boxItems: [],
    features: [],
    includes: [],
    deliveryTime: "",
    rating: "",
    reviews: "",
  }

  if (!raw) return empty

  if (Array.isArray(raw)) {
    return {
      ...empty,
      boxItems: raw.filter(isContentItem),
    }
  }

  if (typeof raw !== "object") return empty

  const data = raw as Record<string, unknown>
  const boxItems = Array.isArray(data.boxItems) ? data.boxItems.filter(isContentItem) : []
  const features = Array.isArray(data.features)
    ? data.features.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : []
  const includes = Array.isArray(data.includes) ? data.includes.filter(isContentItem) : []
  const deliveryTime = typeof data.deliveryTime === "string" ? data.deliveryTime : ""
  const rating =
    typeof data.rating === "number" || typeof data.rating === "string" ? String(data.rating) : ""
  const reviews =
    typeof data.reviews === "number" || typeof data.reviews === "string" ? String(data.reviews) : ""

  return {
    boxItems,
    features,
    includes,
    deliveryTime,
    rating,
    reviews,
  }
}

function buildProductDetailContent(data: ProductDetailContent): Record<string, unknown> | ContentItem[] | null {
  const boxItems = data.boxItems.filter((item) => item.item.trim() && item.quantity.trim())
  const features = data.features.map((item) => item.trim()).filter(Boolean)
  const includes = data.includes.filter((item) => item.item.trim() && item.quantity.trim())
  const deliveryTime = data.deliveryTime.trim()
  const ratingValue = data.rating.trim()
  const reviewsValue = data.reviews.trim()

  const hasExtendedData =
    features.length > 0 ||
    includes.length > 0 ||
    Boolean(deliveryTime) ||
    Boolean(ratingValue) ||
    Boolean(reviewsValue)

  if (!hasExtendedData) {
    return boxItems.length > 0 ? boxItems : null
  }

  return {
    boxItems,
    features,
    includes,
    deliveryTime: deliveryTime || undefined,
    rating: ratingValue ? Number(ratingValue) : undefined,
    reviews: reviewsValue ? Number(reviewsValue) : undefined,
  }
}

export default function ProductsPage() {
  const { 
    products, 
    loading: loadingProducts, 
    error: errorProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    toggleAvailability,
    fetchProducts,
    pagination,
  } = useAdminProducts()
  
  const {
    categories,
    loading: loadingCategories,
    fetchCategories,
  } = useAdminCategories()
   
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "",
    image: "",
    categoryId: "",
    spiceLevel: 0,
    available: true,
    sortOrder: 0,
    content: [] as ContentItem[],
    features: [] as string[],
    includes: [] as ContentItem[],
    deliveryTime: "",
    rating: "",
    reviews: "",
  })
  const [newContentItem, setNewContentItem] = useState({ item: "", quantity: "" })
  const [newFeature, setNewFeature] = useState("")
  const [newIncludeItem, setNewIncludeItem] = useState({ item: "", quantity: "" })
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleOpenModal = async (product?: any) => {
    // Ensure categories are loaded
    if (categories.length === 0) {
      await fetchCategories()
    }
    
    if (product) {
      setEditingProduct(product)
      setSelectedImageFile(null)
      const detailContent = parseProductDetailContent(product.content)
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        costPrice: product.costPrice?.toString() || "",
        image: product.image || "",
        categoryId: product.categoryId,
        spiceLevel: Number(product.spiceLevel) || 0,
        available: product.available,
        sortOrder: product.sortOrder || 0,
        content: detailContent.boxItems,
        features: detailContent.features,
        includes: detailContent.includes,
        deliveryTime: detailContent.deliveryTime,
        rating: detailContent.rating,
        reviews: detailContent.reviews,
      })
    } else {
      setEditingProduct(null)
      setSelectedImageFile(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        costPrice: "",
        image: "",
        categoryId: categories[0]?.id || "",
        spiceLevel: 0,
        available: true,
        sortOrder: 0,
        content: [],
        features: [],
        includes: [],
        deliveryTime: "",
        rating: "",
        reviews: "",
      })
    }
    setNewFeature("")
    setNewIncludeItem({ item: "", quantity: "" })
    setIsModalOpen(true)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, image: event.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImageFile) return formData.image || null

    const formDataUpload = new FormData()
    formDataUpload.append("file", selectedImageFile)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formDataUpload,
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw new Error(payload?.error || "Error al subir la imagen")
    }

    const data = await response.json()
    return data.url
  }

  const handleAddContentItem = () => {
    if (newContentItem.item && newContentItem.quantity) {
      setFormData({
        ...formData,
        content: [...formData.content, { ...newContentItem }],
      })
      setNewContentItem({ item: "", quantity: "" })
    }
  }

  const handleRemoveContentItem = (index: number) => {
    setFormData({
      ...formData,
      content: formData.content.filter((_, i) => i !== index),
    })
  }

  const handleAddFeature = () => {
    const feature = newFeature.trim()
    if (!feature) return
    setFormData({
      ...formData,
      features: [...formData.features, feature],
    })
    setNewFeature("")
  }

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  const handleAddIncludeItem = () => {
    if (!newIncludeItem.item.trim() || !newIncludeItem.quantity.trim()) return
    setFormData({
      ...formData,
      includes: [...formData.includes, { ...newIncludeItem }],
    })
    setNewIncludeItem({ item: "", quantity: "" })
  }

  const handleRemoveIncludeItem = (index: number) => {
    setFormData({
      ...formData,
      includes: formData.includes.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const uploadedImageUrl = await uploadImage()
      const contentPayload = buildProductDetailContent({
        boxItems: formData.content,
        features: formData.features,
        includes: formData.includes,
        deliveryTime: formData.deliveryTime,
        rating: formData.rating,
        reviews: formData.reviews,
      })

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        image: uploadedImageUrl,
        categoryId: formData.categoryId,
        spiceLevel: formData.spiceLevel,
        available: formData.available,
        sortOrder: formData.sortOrder,
        content: contentPayload,
      }
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
        toast.success("Producto actualizado correctamente")
      } else {
        await createProduct(productData)
        toast.success("Producto creado correctamente")
      }
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Error al guardar producto")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteProduct(id)
        toast.success("Producto eliminado correctamente")
      } catch (err: any) {
        toast.error(err.message || "Error al eliminar producto")
      }
    }
  }

  const loading = loadingProducts || loadingCategories

  return (
    <div className="space-y-6">
      <Toaster />
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el catálogo de productos y servicios
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-center py-8">Cargando productos...</p>}
      {errorProducts && <p className="text-center py-8 text-red-500">{errorProducts}</p>}

      {/* Products table */}
      {!loading && !errorProducts && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Costo</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-contain rounded bg-muted"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">N/A</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category?.name || "Sin categoría"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${parseFloat(product.price.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {product.costPrice ? `${parseFloat(product.costPrice.toString()).toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={product.available}
                      onCheckedChange={() => toggleAvailability(product.id, !product.available)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/product/${product.id}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(product)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(product.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron productos
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                  {pagination.total} productos
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => pagination.page > 1 && fetchProducts(pagination.page - 1)}
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
                        onClick={() => pagination.page < pagination.totalPages && fetchProducts(pagination.page + 1)}
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

      {/* Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl overflow-visible">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-4 gap-4">
              {/* Left Column - 75% */}
              <div className="col-span-3 space-y-3">
                {/* Row 1: Name, Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Categoría</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="z-[9999] max-h-[200px] overflow-auto">
                        {categories.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground">Cargando...</div>
                        ) : categories.length > 0 ? (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-xs text-muted-foreground">Sin categorías</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Price, Cost, Spice */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="0.00"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Costo</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      placeholder="0.00"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Picante (0-5)</Label>
                    <Input
                      id="spiceLevel"
                      type="number"
                      min="0"
                      max="5"
                      value={formData.spiceLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spiceLevel: Math.max(0, Math.min(5, parseInt(e.target.value || "0", 10))),
                        })
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Image only */}
              <div 
                className="cursor-pointer h-32"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center overflow-hidden border border-border">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12" />
                      <span className="text-xs mt-1">Toca para seleccionar</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rest of fields without column division */}
            <div>
              <Label className="text-xs">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-8"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Tiempo de entrega</Label>
                <Input
                  id="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  placeholder="5-7 días hábiles"
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  placeholder="4.5"
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Reseñas</Label>
                <Input
                  id="reviews"
                  type="number"
                  min="0"
                  value={formData.reviews}
                  onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                  placeholder="0"
                  className="h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Contenido</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Producto"
                  value={newContentItem.item}
                  onChange={(e) => setNewContentItem({ ...newContentItem, item: e.target.value })}
                  className="flex-1 h-8"
                />
                <Input
                  placeholder="Cant."
                  value={newContentItem.quantity}
                  onChange={(e) => setNewContentItem({ ...newContentItem, quantity: e.target.value })}
                  className="w-20 h-8"
                />
                <Button type="button" size="sm" onClick={handleAddContentItem} className="h-8">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              {formData.content.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {formData.content.map((contentItem, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted/50 px-2 py-1 rounded text-xs"
                    >
                      <span>
                        <span className="font-medium">{contentItem.item}</span> {contentItem.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveContentItem(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs">Características</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Añadir característica"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 h-8"
                />
                <Button type="button" size="sm" onClick={handleAddFeature} className="h-8">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              {formData.features.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {formData.features.map((feature, index) => (
                    <div
                      key={`${feature}-${index}`}
                      className="flex items-center justify-between bg-muted/50 px-2 py-1 rounded text-xs"
                    >
                      <span>{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs">Incluye</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Elemento"
                  value={newIncludeItem.item}
                  onChange={(e) => setNewIncludeItem({ ...newIncludeItem, item: e.target.value })}
                  className="flex-1 h-8"
                />
                <Input
                  placeholder="Cant."
                  value={newIncludeItem.quantity}
                  onChange={(e) => setNewIncludeItem({ ...newIncludeItem, quantity: e.target.value })}
                  className="w-20 h-8"
                />
                <Button type="button" size="sm" onClick={handleAddIncludeItem} className="h-8">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              {formData.includes.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {formData.includes.map((includeItem, index) => (
                    <div
                      key={`${includeItem.item}-${index}`}
                      className="flex items-center justify-between bg-muted/50 px-2 py-1 rounded text-xs"
                    >
                      <span>
                        <span className="font-medium">{includeItem.item}</span> {includeItem.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIncludeItem(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-xs">Disponible</Label>
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
            </div>
            
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                {editingProduct ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
