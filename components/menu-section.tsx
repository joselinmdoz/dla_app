"use client"

import { useState } from "react"
import { MenuCategory } from "./menu-category"
import { useProducts, useCategories } from "@/hooks/use-products"
import { BoxIcon } from "lucide-react"
import { ElectronicsChip, Cycling } from "iconoir-react"
import { useLandingContent } from "@/hooks/use-landing-content"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MenuSection() {
  const { content, isSectionEnabled } = useLandingContent()
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const { products, loading, error } = useProducts(activeCategory === "all" ? undefined : activeCategory)
  const { categories, loading: loadingCategories } = useCategories()
  const menuEnabled = isSectionEnabled("menuSectionEnabled")

  const iconMap: Record<string, any> = {
    beef: BoxIcon,
    chicken: ElectronicsChip,
    motos: Cycling,
  }

  // Group products by category when showing all
  const groupedProducts = activeCategory === "all" 
    ? categories.map(category => ({
        categoryName: category.name,
        items: products
          .filter(p => p.category?.slug === category.slug)
          .map(product => ({
            id: product.id,
            name: product.name,
            price: `$${parseFloat(product.price).toFixed(2)}`,
            description: product.description || "",
            spiceLevel: product.spiceLevel,
            image: product.imagePreviewUrl || product.image || undefined,
          }))
      })).filter(group => group.items.length > 0)
    : []

  // Single category items
  const menuItems = activeCategory !== "all" 
    ? products.map(product => ({
        id: product.id,
        name: product.name,
        price: `$${parseFloat(product.price).toFixed(2)}`,
        description: product.description || "",
        spiceLevel: product.spiceLevel,
        image: product.imagePreviewUrl || product.image || undefined,
      }))
    : []

  if (!menuEnabled) {
    return null
  }

  if (loading || loadingCategories) {
    return (
      <section id="menu" className="py-20 md:py-32 bg-card">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-primary tracking-tighter mb-4">
              {content.menu.title}
            </h2>
          </div>
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="menu" className="py-20 md:py-32 bg-card">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-500">Error al cargar productos: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  // Combine default "all" with API categories
  const allCategories = [
    { id: "all", name: "Todos", slug: "all" },
    ...categories
  ]

  return (
    <section id="menu" className="py-20 md:py-32 bg-card">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Restaurant Style */}
        <div className="text-center mb-12">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-primary tracking-tighter mb-4">
            {content.menu.title}
          </h2>
        </div>

        {/* Mobile Category Selector */}
        <div className="md:hidden mb-10">
          <div className="max-w-sm mx-auto">
            <label htmlFor="menu-category-select" className="block text-sm font-semibold text-muted-foreground mb-2">
              Categoría
            </label>
            <Select
              value={activeCategory}
              onValueChange={setActiveCategory}
            >
              <SelectTrigger
                id="menu-category-select"
                className="w-full h-12 rounded-xl border-2 border-border bg-card px-4 text-base font-semibold text-foreground focus:border-primary"
              >
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {allCategories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop Category Tabs - Bold Restaurant Style */}
        <div className="hidden md:flex flex-wrap justify-center gap-3 mb-16">
          {allCategories.map((category) => {
            const Icon = category.slug === "all" ? BoxIcon : (iconMap[category.slug] || BoxIcon)
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg tracking-tight transition-all duration-300 ${
                  activeCategory === category.slug
                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/50 scale-105"
                    : "bg-card border-2 border-border text-foreground hover:border-primary/50 hover:scale-105"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{category.name}</span>
              </button>
            )
          })}
        </div>

        {/* Menu Items */}
        {activeCategory === "all" ? (
          // Show grouped by category
          groupedProducts.length > 0 ? (
            <div className="space-y-12">
              {groupedProducts.map((group, index) => (
                <div key={index}>
                  <h3 className="text-2xl font-bold text-primary mb-6 pb-2 border-b border-border">
                    {group.categoryName}
                  </h3>
                  <MenuCategory items={group.items} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              No hay productos disponibles
            </div>
          )
        ) : (
          // Show single category
          menuItems.length > 0 ? (
            <MenuCategory items={menuItems} />
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              No hay productos disponibles en esta categoría
            </div>
          )
        )}
      </div>
    </section>
  )
}
