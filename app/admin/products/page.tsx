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
    available: true,
    sortOrder: 0,
    content: [] as ContentItem[],
  })
  const [newContentItem, setNewContentItem] = useState({ item: "", quantity: "" })
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
      const content = product.content as ContentItem[] | undefined
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        costPrice: product.costPrice?.toString() || "",
        image: product.image || "",
        categoryId: product.categoryId,
        available: product.available,
        sortOrder: product.sortOrder || 0,
        content: content || [],
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        costPrice: "",
        image: "",
        categoryId: categories[0]?.id || "",
        available: true,
        sortOrder: 0,
        content: [],
      })
    }
    setIsModalOpen(true)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        image: formData.image || null,
        categoryId: formData.categoryId,
        available: formData.available,
        sortOrder: formData.sortOrder,
        content: formData.content.length > 0 ? formData.content : null,
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

                {/* Row 2: Price, Cost */}
                <div className="grid grid-cols-2 gap-3">
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
