"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Star, ShieldCheck, Truck, CheckCircle } from "iconoir-react"

// Product data with IDs
const products: Record<string, {
  id: string
  name: string
  price: string
  image: string
  description: string
  features: string[]
  includes: { item: string; quantity: string }[]
  deliveryTime: string
  rating: number
  reviews: number
}> = {
  "caja-se1": {
    id: "caja-se1",
    name: "Caja Super Express 1",
    price: "125,24$",
    image: "/products/CajasSE/cajaSE1.svg",
    description: "La Caja Super Express 1 es la solución perfecta para tus necesidades de envío. Incluye todos los materiales de embalaje necesarios para proteger tus productos durante el transporte.",
    features: [
      "Caja de cartón resistente de doble corrugado",
      "Material de protección interno",
      "Etiquetas de envío precargadas",
      "Servicios de seguimiento incluidos",
      "Seguro básico de envío",
    ],
    includes: [
      { item: "Arroz Blanco grano largo", quantity: "3 kg" },
      { item: "Frijol Negro", quantity: "1 kg" },
      { item: "Alubia Roja", quantity: "500 g" },
      { item: "Azucar Blanca", quantity: "1 kg" },
      { item: "Pasta de Tomate 400g", quantity: "1" },
      { item: "Pasta Pena", quantity: "500 g" },
      { item: "Pasta espaquetti", quantity: "500 g x2" },
      { item: "Aceite", quantity: "1 Lt x2" },
      { item: "Leche Condensada", quantity: "390 g x2" },
      { item: "Preparado de leche en Polvo", quantity: "1 kg" },
      { item: "Mayonesa 500 ml", quantity: "1" },
      { item: "Sazonador Completo 335g", quantity: "1" },
      { item: "Sardinas en aceite", quantity: "2" },
      { item: "Sardinas en tomate", quantity: "2" },
      { item: "Pork Luncheon Meat", quantity: "320 g" },
      { item: "Corned Beef", quantity: "340 g" },
      { item: "Morcilla con manteca", quantity: "625 g" },
      { item: "Resfresco en polvo", quantity: "2 Lt x4" },
      { item: "Cafe Molido Natural", quantity: "250g x2" },
      { item: "Caldo de Carne (36 pastillas)", quantity: "1" },
      { item: "Caldo de Pollo (12 pastillas)", quantity: "1" },
      { item: "Caldo Sabor Jamon (12 pastillas)", quantity: "1" },
    ],
    deliveryTime: "3-5 días hábiles",
    rating: 4.8,
    reviews: 124,
  },
  "caja-se2": {
    id: "caja-se2",
    name: "Caja Super Express 2",
    price: "162,84$",
    image: "/products/CajasSE/cajaSE2.svg",
    description: "La Caja Super Express 2 ofrece mayor capacidad para envíos más grandes. Ideal para paquetes voluminosos que requieren protección adicional.",
    features: [
      "Caja de cartón premium de triple corrugado",
      "Sistema de amortiguación avanzado",
      "Etiquetas de envío express",
      "Seguro premium de envío",
      "Prioridad en entrega",
    ],
    includes: [
      { item: "Arroz Blanco grano largo Disempre", quantity: "4 kg" },
      { item: "Frijol Negro Bolsa 1kg Rico Prato", quantity: "2 kg" },
      { item: "Alubia Roja Bolsa 500g Cister", quantity: "500 g x4" },
      { item: "Azucar Blanca 1 kg Maisdoce", quantity: "1 kg" },
      { item: "Pasta de Tomate 400g Abre Facil HollandPark", quantity: "2" },
      { item: "Pasta Pena Galo 500g", quantity: "2" },
      { item: "Pasta espaquetti Sarbio 500g", quantity: "2" },
      { item: "Aceite Sumavi 1 Lt", quantity: "2" },
      { item: "Leche Condensada Lata 390g HollandPark", quantity: "2" },
      { item: "Preparado Leche en Polvo entera Dobon 1 kg", quantity: "1" },
      { item: "Mayonesa 500 ml Hollandpark", quantity: "1" },
      { item: "Salsa Soya tradicional Kikoman 250 ml", quantity: "2" },
      { item: "Sazonador Completo 335g Bote Carmencita", quantity: "1" },
      { item: "Caldo de Carne pastilla x 10g (12 pastillas) Calnort", quantity: "1" },
      { item: "Caldo de Pollo pastilla x 10g (12 pastillas) Calnort", quantity: "1" },
      { item: "Caldo Sabor Jamon pastilla x 10g (12 pastas) Calnort", quantity: "1" },
      { item: "Sardinas en aceite", quantity: "3" },
      { item: "Sardinas en tomate", quantity: "3" },
      { item: "Pork Luncheon Meat Lata 320g Pampeano", quantity: "1" },
      { item: "Resfresco el Ricote de limon", quantity: "2" },
      { item: "Resfresco el Ricote de piña", quantity: "2" },
      { item: "Cafe Molido Natural 250g Purasangre", quantity: "2" },
      { item: "Chorizo en manteca", quantity: "1" },
      { item: "Corned Beef Lata 340g Pampeano", quantity: "1" },
      { item: "Morcilla con manteca 625g JAN", quantity: "1" },
      { item: "Aceitunas S/Hueso Coviran Bolsa 160g", quantity: "2" },
      { item: "Maiz Dulce Coaliment 425ml/340g", quantity: "1" },
      { item: "Malta Van Pur 6 pack Lata 33 cl", quantity: "1" },
      { item: "Caramelo Melody Toffee Leche c/Choco 500g Bolsa Riclan", quantity: "1" },
      { item: "Galletas con Crema de Chocolate 112g Renata", quantity: "1" },
      { item: "Galletas con Crema de Fresa 112g Renata", quantity: "1" },
      { item: "Chocolate Kinder chocolate T1x24x8 12.5g Ferrero", quantity: "4" },
    ],
    deliveryTime: "2-4 días hábiles",
    rating: 4.9,
    reviews: 89,
  },
  "caja-se3": {
    id: "caja-se3",
    name: "Caja Super Express 3",
    price: "157,36$",
    image: "/products/CajasSE/cajaSE3.svg",
    description: "La Caja Super Express 3 es nuestra opción más popular para envíos medianos. Equilibrio perfecto entre tamaño, protección y precio.",
    features: [
      "Caja de cartón de alta resistencia",
      "Protección contra impactos",
      "Etiquetas de envío estándar",
      "Seguro estándar de envío",
      "Seguimiento en tiempo real",
    ],
    includes: [
      { item: "Arroz Blanco grano largo Disempre", quantity: "3 kg" },
      { item: "Frijol Negro Bolsa 1kg Rico Prato", quantity: "2 kg" },
      { item: "Alubia Roja Bolsa 500g Cister", quantity: "500 g x4" },
      { item: "Azucar Blanca 1 kg Maisdoce", quantity: "1 kg" },
      { item: "Pasta de Tomate 400g Abre Facil HollandPark", quantity: "2" },
      { item: "Pasta espaquetti Sarbio 500g", quantity: "2" },
      { item: "Aceite Sumavi 1 Lt", quantity: "2" },
      { item: "Leche Condensada Lata 390g HollandPark", quantity: "1" },
      { item: "Preparado Leche en Polvo entera Dobon 1 kg", quantity: "1" },
      { item: "Mayonesa 500 ml Hollandpark", quantity: "1" },
      { item: "Sazonador Completo 335g Bote Carmencita", quantity: "1" },
      { item: "Sardinas en aceite", quantity: "2" },
      { item: "Sardinas en tomate", quantity: "2" },
      { item: "Pork Luncheon Meat Lata 320g Pampeano", quantity: "1" },
      { item: "Cafe Molido Natural 250g Purasangre", quantity: "2" },
      { item: "Corned Beef Lata 340g Pampeano", quantity: "1" },
      { item: "Morcilla con manteca 625g JAN", quantity: "1" },
      { item: "Jabon en Pastillas 2 Ud de 90g Dove", quantity: "3" },
      { item: "Gel de Baño de Lima 400 ml Aroma Natural", quantity: "1" },
      { item: "Acondicionador de Argan y Leche de Coco 400 ml Aroma Natural", quantity: "1" },
      { item: "Cepillo Dental", quantity: "3" },
      { item: "Pasta Dental Blanqueadora 125 gr Dento Kisss", quantity: "2" },
      { item: "Papel Higienico 2 Capas Blanco COVIRAN 4U", quantity: "2" },
      { item: "Detergente en Polvo WASHO PLUS", quantity: "4" },
    ],
    deliveryTime: "4-6 días hábiles",
    rating: 4.7,
    reviews: 156,
  },
  "ecoflow-delta-2": {
    id: "ecoflow-delta-2",
    name: "EcoFlow Delta 2",
    price: "599$",
    image: "/products/Electronics/ecoflowd2.svg",
    description: "Estación de Energía Portátil (1800W - 2700W Pico)",
    features: [
      "Capacidad de 1024Wh",
      "Salida AC de 1800W",
      "Carga rápida X-Stream",
      "Compatible con paneles solares",
      "12 meses de garantía",
    ],
    includes: [
      { item: "EcoFlow Delta 2", quantity: "1" },
      { item: "Cable de carga AC", quantity: "1" },
      { item: "Cable de carga para auto", quantity: "1" },
      { item: "Cable DC5521", quantity: "1" },
      { item: "Manual de usuario", quantity: "1" },
    ],
    deliveryTime: "5-7 días hábiles",
    rating: 4.9,
    reviews: 234,
  },
  "ecoflow-delta-3": {
    id: "ecoflow-delta-3",
    name: "EcoFlow Delta 3",
    price: "619$",
    image: "/products/Electronics/ecoflowd3.svg",
    description: "La nueva generación de estaciones de energía portátiles con mayor eficiencia y durabilidad.",
    features: [
      "Capacidad de 2048Wh",
      "Salida AC de 3600W",
      "Carga ultra rápida",
      "Batería LiFePO4",
      "App de control remoto",
    ],
    includes: [
      { item: "EcoFlow Delta 3", quantity: "1" },
      { item: "Cable de carga AC", quantity: "1" },
      { item: "Cable de carga para auto", quantity: "1" },
      { item: "Cable MC4 para solares", quantity: "1" },
      { item: "Manual de usuario", quantity: "1" },
    ],
    deliveryTime: "5-7 días hábiles",
    rating: 5.0,
    reviews: 89,
  },
  "olla-reyna": {
    id: "olla-reyna",
    name: "Olla Reyna",
    price: "70$",
    image: "/products/Electronics/ollareyna.svg",
    description: "Olla de presión eléctrica de alta capacidad para cocinar de manera rápida y eficiente.",
    features: [
      "Capacidad de 6 litros",
      "12 funciones de cocción",
      "Material acero inoxidable",
      "Sistema de seguridad dual",
      "Pantalla digital",
    ],
    includes: [
      { item: "Olla Reyna", quantity: "1" },
      { item: "Recipiente de cocción", quantity: "1" },
      { item: "Cucharón de serving", quantity: "1" },
      { item: "Manual de recetas", quantity: "1" },
      { item: "Cable de alimentación", quantity: "1" },
    ],
    deliveryTime: "7-10 días hábiles",
    rating: 4.6,
    reviews: 156,
  },
  "olla-arrocera": {
    id: "olla-arrocera",
    name: "Olla Arrocera",
    price: "42$",
    image: "/products/Electronics/ollaarrocera.svg",
    description: "Olla arrocera compacta ideal para arroz perfecto y más.",
    features: [
      "Capacidad de 10 tazas",
      "Función de mantener caliente",
      "Interior antiadherente",
      "Diseño compacto",
      "Fácil de limpiar",
    ],
    includes: [
      { item: "Olla Arrocera", quantity: "1" },
      { item: "Recipiente de cocinar", quantity: "1" },
      { item: "Espátula de serving", quantity: "1" },
      { item: "Manual de usuario", quantity: "1" },
    ],
    deliveryTime: "7-10 días hábiles",
    rating: 4.5,
    reviews: 203,
  },
  "ventilador-pie": {
    id: "ventilador-pie",
    name: "Ventilador de Pie",
    price: "55$",
    image: "/products/Electronics/ventilador.svg",
    description: "Ventilador de pie potente con múltiples velocidades y oscilación.",
    features: [
      "3 velocidades",
      "Oscilación automática",
      "Temporizador 8 horas",
      "Altura ajustable",
      "Motor silencioso",
    ],
    includes: [
      { item: "Ventilador de Pie", quantity: "1" },
      { item: "Base circular", quantity: "1" },
      { item: "Manual de usuario", quantity: "1" },
    ],
    deliveryTime: "7-10 días hábiles",
    rating: 4.4,
    reviews: 89,
  },
  "nevera": {
    id: "nevera",
    name: "Nevera",
    price: "310$",
    image: "/products/Electronics/nevera.svg",
    description: "Nevera compacta perfecta para espacios pequeños o secundarios.",
    features: [
      "Capacidad 130 litros",
      "Clase energética A+",
      "Congelador integrado",
      "Control mecánico",
      "Puerta reversible",
    ],
    includes: [
      { item: "Nevera", quantity: "1" },
      { item: "Bandejas de vidrio", quantity: "3" },
      { item: "Congelador extraíble", quantity: "1" },
      { item: "Manual de instalación", quantity: "1" },
    ],
    deliveryTime: "10-15 días hábiles",
    rating: 4.6,
    reviews: 67,
  },
  "aire-split": {
    id: "aire-split",
    name: "Aire Acondicionado Split",
    price: "330$",
    image: "/products/Electronics/split.svg",
    description: "Aire acondicionado split frío/calor de alta eficiencia.",
    features: [
      "12000 BTU",
      "Frío y calor",
      "Tecnología inverter",
      "Control remoto",
      "Función sleep",
    ],
    includes: [
      { item: "Unidad interior", quantity: "1" },
      { item: "Unidad exterior", quantity: "1" },
      { item: "Control remoto", quantity: "1" },
      { item: "Kit de instalación", quantity: "1" },
      { item: "Manual de usuario", quantity: "1" },
    ],
    deliveryTime: "10-15 días hábiles",
    rating: 4.7,
    reviews: 45,
  },
  "refrigerador-200l": {
    id: "refrigerador-200l",
    name: "Refrigerador 200L-SAX-D195F",
    price: "380$",
    image: "/products/Electronics/refrigerador.svg",
    description: "Refrigerador de 200 litros con tecnología No Frost y diseño moderno.",
    features: [
      "Capacidad 200 litros",
      "Tecnología No Frost",
      "Display digital",
      "Dispensador de agua",
      "Puerta de vidrio",
    ],
    includes: [
      { item: "Refrigerador", quantity: "1" },
      { item: "Bandejas ajustables", quantity: "4" },
      { item: "Cajón de verduras", quantity: "1" },
      { item: "Manual de usuario", quantity: "1" },
    ],
    deliveryTime: "10-15 días hábiles",
    rating: 4.8,
    reviews: 34,
  },
}

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const product = products[productId]

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black text-foreground mb-4">Producto no encontrado</h1>
          <Link href="/#menu" className="text-primary hover:underline">
            Volver al menú
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="pt-24 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/#menu" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </Link>
      </div>

      {/* Product Details */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Image */}
            <div className="relative">
              <div className="relative w-full aspect-square bg-card rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  style={{ filter: 'drop-shadow(0 20px 60px rgba(251, 191, 36, 0.3))' }}
                />
              </div>
              
              {/* Price Badge */}
              <div className="absolute -top-6 -right-6 z-20 bg-primary text-primary-foreground px-8 py-4 rounded-full shadow-2xl">
                <span className="text-4xl font-black">{product.price}</span>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-4 tracking-tight">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground font-medium">
                    {product.rating} ({product.reviews} reseñas)
                  </span>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>


              {/* Includes */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-xl font-black text-foreground mb-4">Contenido de la Caja</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.includes.map((include, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      <span className="text-muted-foreground text-sm">
                        <span className="text-foreground font-medium">{include.item}</span> {include.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-xl font-black text-foreground mb-4">Características</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Delivery Info */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo de entrega</p>
                    <p className="font-bold text-foreground">{product.deliveryTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seguro incluido</p>
                    <p className="font-bold text-foreground">Sí</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="https://www.solvebigtech.com/solvedc/tracking/dayready/"
                className="group flex items-center justify-center gap-3 w-full py-5 bg-primary text-primary-foreground font-bold text-xl tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-2xl hover:shadow-primary/25"
              >
                Rastrear envío
                <ArrowLeft className="w-6 h-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
