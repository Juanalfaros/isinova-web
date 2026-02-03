# Isinova Web 🚀

Sitio web corporativo de **Isinova**, expertos en tecnología educativa (EdTech) y soluciones para instituciones de aprendizaje. Construido con **Astro 5** y optimizado para **Cloudflare Pages**.

## 🎯 Sobre Isinova

Isinova es una empresa chilena especializada en **Ingeniería EdTech & Consultoría** que ofrece:

- **Implementación de Aulas Virtuales** (Moodle, Blackboard, Canvas)
- **ERPs Académicos** (Banner o soluciones a medida)
- **Integraciones Académicas** personalizadas
- **Soporte crítico** para +50.000 alumnos activos
- **Desarrollo de Software** educativo a medida

## ⚡ Stack Tecnológico

### Core

- **Framework**: [Astro 5](https://astro.build/) (Modo SSR)
- **Plataforma**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Tipografía**: [Exo 2](https://fonts.google.com/specimen/Exo+2) (Google Fonts)
- **Iconografía**: [Phosphor Icons](https://phosphoricons.com/)

### Integraciones

- `@astrojs/cloudflare`: Adaptador para runtime de Cloudflare Workers
- `@astrojs/mdx`: Soporte para contenido rico en MDX
- `@astrojs/sitemap`: Generación automática de sitemap
- `astro-compress`: Optimización de activos en el build

### Gestión de Leads y Emails (Brevo Integration)

- **Estrategia CRM-First**: Toda la gestión de correos es "No-Code", controlada visualmente desde Brevo.
- **Atributos Clave**:
    - `EXT_ID`: ID del ticket generado por la API.
    - `NOMBRE` / `NOMBRE_COMPLETO`: Datos del usuario.
    - `QUIZ_RESULTADO` / `QUIZ_ETAPA`: Datos de segmentación comercial.
- **API Endpoint**: `POST /api/contact-form` (Sincronización automática a listas).
- **Plantillas HTML**: Ubicadas en `/email-templates` (Solo referencia para copiar a Brevo).

### Seguridad & Analytics

- **Google Tag Manager**: Integración de analytics y marketing
- **reCAPTCHA v3**: Protección contra spam en formularios

## 📁 Estructura del Proyecto

```text
/
├── src/
│   ├── assets/           # Imágenes y recursos estáticos
│   │   └── images/       # Fotos del equipo, servicios, etc.
│   ├── components/       # Componentes Astro reutilizables
│   │   ├── about/        # Componentes de sección "Nosotros"
│   │   ├── contacto/     # Formularios y contacto
│   │   ├── layout/       # Header, Footer, Navigation
│   │   ├── sections/     # Componentes de secciones principales
│   │   └── services/     # Componentes de servicios
│   ├── content/          # Colecciones de contenido estructurado
│   │   ├── config.ts     # Configuración de colecciones Astro
│   │   ├── equipo/       # Perfiles del equipo (YAML)
│   │   └── servicios/    # Descripciones de servicios (MDX)
│   ├── layouts/          # Plantillas de página base
│   ├── pages/            # Rutas y API Endpoints
│   │   ├── api/          # Endpoints de servidor
│   │   ├── servicios/    # Páginas de servicios
│   │   └── *.astro       # Páginas estáticas
│   ├── styles/           # Estilos CSS globales
│   └── env.d.ts          # Tipos para variables de entorno
├── public/               # Archivos públicos (favicons, manifest)
├── email-signatures/     # Firmas de correo (local)
├── astro.config.mjs      # Configuración de Astro y adaptador
├── wrangler.toml         # Configuración de Cloudflare Pages
├── package.json          # Dependencias y scripts
└── .env.example          # Plantilla de variables de entorno
```

## 🚀 Desarrollo Local

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Configura las siguientes variables:

- `BREVO_API_KEY`: Tu clave de API de Brevo
- `BREVO_LIST_ID`: ID de lista por defecto en Brevo
- `NOTIFICATION_EMAIL`: Correo para notificaciones
- `PUBLIC_GTM_ID`: ID de Google Tag Manager
- `PUBLIC_RECAPTCHA_SITE_KEY`: Clave pública de reCAPTCHA
- `RECAPTCHA_SECRET_KEY`: Clave secreta de reCAPTCHA

### 3. Iniciar servidor de desarrollo

```bash
pnpm dev
```

Visita `http://localhost:4321` para ver el sitio.

## 🌐 Despliegue en Cloudflare Pages

Este proyecto está configurado para **Cloudflare Pages** con Renderización en el Servidor (SSR).

### Configuración Automática

El archivo `wrangler.toml` incluye:

- `compatibility_flags = ["nodejs_compat"]`
- `pages_build_output_dir = "./dist"`

### Pasos de Despliegue

1. **Conectar repositorio** a Cloudflare Pages
2. **Configurar variables de entorno** en el panel de Cloudflare
3. **Build settings**:
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Node.js version**: 18+

### Variables de Entorno en Producción

Configura manualmente en Cloudflare Dashboard:

- Settings > Environment variables > Production
- Añade todas las variables del archivo `.env`

## 🔧 Funcionalidades del Backend

### API Endpoints

- **`/api/contact-form.ts`**: Sincronización con Brevo CRM
  - Validación de datos y protección reCAPTCHA v3
  - **Sincronización Total**: Envío de contactos y atributos (incluyendo Quiz) al CRM.
  - **Estrategia No-Code**: La API solo entrega los datos; la lógica de correos se gestiona visualmente en Brevo (Marketing Automation).

### Colecciones de Contenido

- **Servicios**: Contenido MDX con metadata estructurada
- **Equipo**: Perfiles en formato YAML con fotos y roles
- **Configuración**: Tipado estricto con Zod schemas

### Optimizaciones

- **Compresión de activos**: `astro-compress`
- **Sitemap automático**: Generación de XML sitemap
- **SEO optimizado**: Metadatos y structured data
- **Performance**: 99/100 en Google PageSpeed

## 🎨 Sistema de Diseño

### Colores Institucionales

- **Primary**: `#6246ea` (Púrpura Isinova)
- **Accent**: `#00ff8c` (Verde brillante)
- **Dark**: `#2b2d42` (Texto principal)
- **Background**: `#f8fafc` (Fondo claro)

### Tipografía

- **Principal**: Exo 2 (Google Fonts)
- **Peso**: 400-700 (Regular a Bold)
- **Gradientes**: Aplicados en títulos y elementos destacados

### Componentes Clave

- **Hero**: Sección principal con animaciones
- **Services Cards**: Tarjetas de servicios con pricing
- **Team Profiles**: Perfiles del equipo con fotos
- **Contact Forms**: Formularios con validación
- **FAQ Sections**: Preguntas frecuentes interactivas

## 📊 Métricas y Performance

- **Uptime SLA**: 99.99% Garantizado
- **Concurrencia**: +5k Usuarios/segundo
- **Performance**: 99/100 Google PageSpeed
- **Soporte**: Crítico para +50.000 alumnos activos

## 🔐 Seguridad

- **reCAPTCHA v3**: Protección contra spam
- **Validación de datos**: Sanitización de inputs
- **HTTPS**: Forzado en todas las conexiones
- **Headers de seguridad**: Configurados en Cloudflare

## 📝 Licencia

Desarrollado con ❤️ por **Isinova Tech Team**.

---

**Isinova SpA** - Transformación Digital Educativa para Chile y América Latina

📧 contacto@isinova.cl | 🌐 www.isinova.cl | 📱 +56 9 6468 2849
