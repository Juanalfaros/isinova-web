# Isinova Web 🚀

Sitio web corporativo de **Isinova**, expertos en tecnología educativa (EdTech) y soluciones para instituciones de aprendizaje. Construido con **Astro 5** y optimizado para **Cloudflare Pages**.

## �️ Stack Tecnológico

- **Framework**: [Astro 5](https://astro.build/) (Modo SSR)
- **Plataforma**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Iconografía**: [Phosphor Icons](https://phosphoricons.com/)
- **Gestión de Leads**: [Brevo](https://www.brevo.com/) (API Integration)
- **Integraciones**:
  - `@astrojs/cloudflare`: Adaptador para runtime de Cloudflare Workers.
  - `@astrojs/mdx`: Soporte para contenido rico.
  - `@astrojs/sitemap`: Generación automática de mapa del sitio.
  - `astro-compress`: Optimización de activos en el build.

## 📁 Estructura del Proyecto

```text
/
├── src/
│   ├── assets/       # Imágenes y recursos estáticos
│   ├── components/   # Componentes Astro reutilizables
│   ├── content/      # Colecciones de contenido (Servicios, etc.)
│   ├── layouts/      # Plantillas de página
│   ├── pages/        # Rutas y API Endpoints
│   └── styles/       # Estilos CSS globales
├── public/           # Archivos públicos (favicons, manifest)
├── astro.config.mjs  # Configuración de Astro y Adaptador
└── wrangler.toml     # Configuración de Cloudflare Pages
```

## 🚀 Desarrollo Local

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

2. **Variables de Entorno**:
   Crea un archivo `.env` basado en `.env.example` con las siguientes claves:
   - `BREVO_API_KEY`: Tu clave de API de Brevo.
   - `NOTIFICATION_EMAIL`: Correo donde llegarán las alertas.
   - `BREVO_LIST_ID`: ID de la lista por defecto en Brevo.

3. **Iniciar servidor de desarrollo**:
   ```bash
   pnpm dev
   ```

## 🌐 Despliegue en Cloudflare

Este proyecto está configurado para **Cloudflare Pages** utilizando Renderización en el Servidor (SSR).

### Pasos Críticos:
- **Compatibilidad de Node**: Asegúrate de tener activa la flag `nodejs_compat` en el panel de Cloudflare (configurado automáticamente en `wrangler.toml`).
- **Variables de Entorno**: Debes configurar manualmente las variables del `.env` en el panel de Cloudflare (Settings > Environment variables > Production).
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## � Funcionalidades de Backend

El proyecto cuenta con una ruta de API en `src/pages/api/contact-form.ts` que maneja:
- Registro de contactos en listas de Brevo.
- Envío de notificaciones vía e-mail con diseño optimizado.
- Validación de datos y logs de auditoría.

---

Desarrollado con ❤️ por **Isinova Tech Team**.
