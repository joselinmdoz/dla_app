"use client"

import { useState } from "react"
import { MenuCategory } from "./menu-category"
import { PizzaSlice as BurgerIcon, CoffeeCup, Leaf, FireFlame as Flame, ElectronicsChip, Cycling } from "iconoir-react"
import { BoxIcon } from "lucide-react"

const categories = [
  { id: "beef", label: "Cajas Super Express", icon: BoxIcon },
  { id: "chicken", label: "Electrónicos", icon: ElectronicsChip },
  { id: "motos", label: "Motos", icon: Cycling },
]

const menuItems = {
  beef: [
    {
      id: "caja-se1",
      name: "Caja Super Express 1",
      price: "125,24$",
      description: "",
      spiceLevel: 3,
      image: "/products/CajasSE/cajaSE1.svg",
    },
    {
      id: "caja-se2",
      name: "Caja Super Express 2",
      price: "162,84$",
      description: "",
      spiceLevel: 3,
      image: "/products/CajasSE/cajaSE2.svg",
    },
    {
      id: "caja-se3",
      name: "Caja Super Express 3",
      price: "157,36$",
      description: "",
      spiceLevel: 3,
      image: "/products/CajasSE/cajaSE3.svg",
    },
  ],
  chicken: [
    {
      id: "ecoflow-delta-2",
      name: "EcoFlow Delta 2",
      price: "599$",
      description: "Estación de Energía Portátil (1800W - 2700W Pico)",
      spiceLevel: 2,
      image: "/products/Electronics/ecoflowd2.svg",
    },
    {
      id: "ecoflow-delta-3",
      name: "EcoFlow Delta 3",
      price: "619$",
      description: "",
      spiceLevel: 2,
      image: "/products/Electronics/ecoflowd3.svg",
    },
    {
      id: "olla-reyna",
      name: "Olla Reyna",
      price: "70$",
      description: "",
      spiceLevel: 2,
      image: "/products/Electronics/ollareyna.svg",
    },
    {
      id: "olla-arrocera",
      name: "Olla Arrocera",
      price: "42$",
      description: "",
      spiceLevel: 2,
      image: "/products/Electronics/ollaarrocera.svg",
    },
    {
      id: "ventilador-pie",
      name: "Ventilador de Pie",
      price: "55$",
      description: "",
      spiceLevel: 2,
      image: "/products/Electronics/ventilador.svg",
    },
    {
      id: "nevera",
      name: "Nevera",
      price: "310$",
      description: "",
      spiceLevel: 2,
      image: "/products/Electronics/nevera.svg",
    },
    {
      id: "aire-split",
      name: "Aire Acondicionado Split",
      price: "330$",
      description: "",
      spiceLevel: 2,
      image: "/products/Electronics/split.svg",
    },
    {
      id: "refrigerador-200l",
      name: "Refrigerador 200L-SAX-D195F",
      price: "380$",
      description: "",
      spiceLevel: 2,
      image: "/products/Electronics/refrigerador.svg",
    },
  ],
  veggie: [
    {
      id: "plant-power",
      name: "Plant Power",
      price: "9,00€",
      description: "Brioche Bun, Falafel, Käse, Burger Sauce, Gurke, Salat, Zwiebel, Tomaten",
      spiceLevel: 0,
    },
    {
      id: "veggie-bbq",
      name: "Veggie BBQ",
      price: "11,00€",
      description: "Brioche Bun, Falafel, Käse, Burger Sauce, Gurke, Onion Rings, Geröstete Zwiebel, BBQ Sauce, Tomaten, Salat",
      spiceLevel: 0,
    },
  ],
  drinks: [
    { id: "coca-cola", name: "Coca Cola", price: "2,50€", description: "330ml Dose", image: "/graphics/cold drinks sprite cola fanta.svg" },
    { id: "coca-cola-zero", name: "Coca Cola Zero", price: "2,50€", description: "330ml Dose", image: "/graphics/cold drinks sprite cola fanta.svg" },
    { id: "fanta", name: "Fanta", price: "2,50€", description: "330ml Dose", image: "/graphics/cold drinks sprite cola fanta.svg" },
    { id: "sprite", name: "Sprite", price: "2,50€", description: "330ml Dose", image: "/graphics/cold drinks sprite cola fanta.svg" },
    { id: "capri-sonne", name: "Capri Sonne", price: "1,50€", description: "200ml", image: "/graphics/caprisun.svg" },
    { id: "wasser", name: "Wasser", price: "2,00€", description: "500ml", image: "/graphics/water.svg" },
    { id: "mezzo-mix", name: "Mezzo Mix", price: "2,50€", description: "330ml Dose", image: "/graphics/cold drinks sprite cola fanta.svg" },
    { id: "red-bull", name: "Red Bull", price: "3,50€", description: "250ml Dose", image: "/graphics/redbull.svg" },
  ],
}

export function MenuSection() {
  const [activeCategory, setActiveCategory] = useState("beef")

  return (
    <section id="menu" className="py-20 md:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Restaurant Style */}
        <div className="text-center mb-12">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-primary tracking-tighter mb-4">
            Nuestras ofertas
          </h2>
        </div>

        {/* Category Tabs - Bold Restaurant Style */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg tracking-tight transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/50 scale-105"
                    : "bg-card border-2 border-border text-foreground hover:border-primary/50 hover:scale-105"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{category.label}</span>
              </button>
            )
          })}
        </div>

        {/* Menu Items */}
        <MenuCategory items={menuItems[activeCategory as keyof typeof menuItems]} />
      </div>
    </section>
  )
}
