<p align="center">
  <img src="./public/images/logos/logo.png" alt="POS App Logo" width="300" height="auto"/>
</p>

  <p align="center">
    Un sistema moderno de Punto de Venta (PDV) de alto rendimiento construido con<br/>
    <strong>Laravel 13</strong> · <strong>Inertia.js v3</strong> · <strong>React 19</strong> · <strong>Tailwind CSS v4</strong>
  </p>

<p align="center">
  <img src="https://img.shields.io/badge/PHP-8.4-777BB4?logo=php&logoColor=white" alt="PHP 8.4"/>
  <img src="https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white" alt="Laravel 13"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Pest-4-F28D1A?logo=php&logoColor=white" alt="Pest 4"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/>
</p>

<p align="center">
  <strong>Idiomas Soportados:</strong>
  <img src="https://img.shields.io/badge/Português-🇧🇷-34D399" alt="Português"/>
  <img src="https://img.shields.io/badge/English-🇺🇸-60A5FA" alt="English"/>
  <img src="https://img.shields.io/badge/Español-🇪🇸-F87171" alt="Español"/>
</p>

<p align="center">
  Traducciones: <a href="README.md">English 🇺🇸</a> | <a href="README.pt.md">Português 🇧🇷</a> | <strong>Español 🇪🇸</strong>
</p>

---

## 📑 Tabla de Contenidos

- [Características](#-características)
- [Prerrequisitos](#-prerrequisitos)
- [Instalación](#-instalación)
- [Tecnologías](#-tecnologías)
- [Credenciales por Defecto](#-credenciales-por-defecto)
- [Pruebas y Calidad de Código](#-pruebas-y-calidad-de-código)
- [Licencia](#-licencia)

---

## ✨ Características

### 🛍️ Terminal PDV (Punto de Venta)
- **Terminal PDV Interactivo** — Interfaz de ventas completa con cuadrícula de productos, gestión de carrito en tiempo real y pago instantáneo
- **Múltiples Métodos de Pago** — Soporte para Efectivo, Tarjeta de Crédito, Tarjeta de Débito y PIX
- **Carrito Inteligente** — Agregar/eliminar artículos, ajustar cantidades y ver totales en tiempo real con cálculo de descuentos
- **Sistema de Cupones** — Aplicar cupones basados en porcentaje con alcance flexible (global, por categoría o por producto)
- **Recibo Digital** — Recibo generado automáticamente con detalles de la venta, información de pago y cálculo de cambio
- **Validación de Stock** — Comprobación de inventario en tiempo real durante el pago con bloqueo pesimista (*pessimistic locking*) para evitar la venta de artículos sin stock disponible
- **Atajos de Teclado** — Navegación completa por teclado: `F2` buscar, flechas para navegar por los productos, `Enter` agregar al carrito, `F8` pagar, `Alt+N` limpiar carrito, `F3` aplicar cupón, teclas numéricas para métodos de pago, `Esc` cancelar

### 📊 Tablero General y Estadísticas
- **Métricas de Ingresos** — Ingresos totales, cantidad de ventas y ticket promedio de un vistazo
- **Desglose de Pagos** — Gráfico visual de ventas por método de pago
- **Productos Más Vendidos** — Lista clasificada de los productos con mejor rendimiento
- **Alertas de Stock Bajo** — Visibilidad inmediata de los productos con pocas existencias o agotados
- **Historial de Ventas Recientes** — Flujo en vivo de las últimas transacciones

### 📈 Informes y Exportaciones
- **Filtros Avanzados** — Filtre informes por rango de fechas, método de pago, categoría o producto específico
- **Resumen de Ventas** — Total de ventas, ingresos, descuentos aplicados y ticket promedio
- **Gráfico de Ventas Diarias** — Visualización de ventas día a día
- **Exportación a CSV** — Descargue los datos de ventas filtrados en formato de hoja de cálculo
- **Exportación a PDF** — Genere informes profesionales en PDF a través de DomPDF

### 📦 Control de Inventario
- **Catálogo de Productos** — CRUD completo para productos con nombre, precio, stock, imagen y categoría
- **Gestión de Categorías** — Organice los productos en categorías
- **Gestión de Proveedores** — Realice el seguimiento y gestione proveedores de productos
- **Control de Stock** — Deducción automática de stock en cada venta realizada

### 👥 Control de Usuarios y Empleados
- **Perfiles de Empleados** — Gestione empleados con cuentas de usuario vinculadas
- **Control de Acceso Basado en Roles (RBAC)** — Roles de Administrador y Empleado con permisos granulares a través de Spatie Permission
- **Gestión de Roles y Permisos** — Cree, edite y asigne roles y permisos directamente desde la interfaz

### 🔐 Autenticación y Seguridad
- **Laravel Fortify** — Inicio de sesión, registro, restablecimiento de contraseña y verificación de correo electrónico
- **Autenticación de Dos Factores (2FA)** — 2FA basada en TOTP con códigos QR y códigos de recuperación
- **Gestión de Perfil** — Actualice nombre, correo electrónico y avatar con recorte de imagen integrado
- **Gestión de Contraseñas** — Cambie la contraseña desde los ajustes de seguridad

### ⚙️ Ajustes y Personalización
- **Configuración de Perfil** — Edite información personal y avatar
- **Ajustes de Seguridad** — Gestione contraseña y 2FA
- **Apariencia** — Alternador de tema de modo claro/oscuro
- **Soporte Multilingüe** — Integración completa de i18n (Portugués, Inglés, Español) con selector de idioma persistente en la barra de navegación

---

## 📋 Prerrequisitos

- PHP **8.4+**
- Composer **2+**
- Node.js **22+** y npm

---

## ⚡ Instalación

```bash
# 1. Clone y acceda al proyecto
git clone https://github.com/thiagohf23/pos-app.git
cd pos-app

# 2. Copie la plantilla de entorno (.env)
cp .env.example .env

# 3. Instale las dependencias
composer install
npm install

# 4. Genere la clave de la aplicación (APP_KEY)
php artisan key:generate

# 5. Cree la base de datos SQLite y ejecute las migraciones + seeds
touch database/database.sqlite
php artisan migrate:fresh --seed

# 6. Inicie los servidores de desarrollo
composer run dev
```

La aplicación se ejecutará en [http://localhost:8000](http://localhost:8000).

> El comando `composer run dev` inicia Laravel y Vite juntos. ¿Prefiere terminales separadas? Ejecute `php artisan serve` y `npm run dev`. Para compilar los assets de producción, utilice `npm run build`.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|---|---|
| **Backend** | Laravel 13, PHP 8.4 |
| **Frontend** | React 19, Inertia.js v3, TypeScript |
| **Estilos** | Tailwind CSS v4, shadcn/ui |
| **Base de Datos** | SQLite |
| **Autenticación** | Laravel Fortify (2FA, Passkeys) |
| **Autorización** | Spatie Laravel-Permission |
| **Generación de PDF** | Barryvdh DomPDF |
| **Pruebas** | Pest PHP 4, Larastan |
| **Estilo de Código** | Laravel Pint, ESLint, Prettier |
| **Enrutamiento** | Laravel Wayfinder (funciones de rutas tipadas) |

---

## 👥 Credenciales por Defecto

Cuando se ejecutan las seeds de la base de datos, se generan los siguientes usuarios:

| Rol | Correo Electrónico | Contraseña |
|---|---|---|
| **Administrador** | `admin@example.com` | `password` |
| **Empleado** | `employee@example.com` | `password` |

> También se generan 15 empleados ficticios adicionales para pruebas.

---

## 🧪 Pruebas y Calidad de Código

```bash
php artisan test        # Ejecuta la suite de pruebas Pest
composer run lint       # Da formato al código con Laravel Pint
composer run ci:check   # Lint + formato + tipos + pruebas
```

---

## 📄 Licencia

El POS App es un software de código abierto bajo la [licencia MIT](LICENSE).

---

<p align="center">
  Hecho con ❤️, mucho ☕ y la ayuda de asistentes de IA.
</p>
