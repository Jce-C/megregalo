# Cómo Desplegar en Netlify

Este proyecto ya está configurado para desplegarse en Netlify. Aquí están las instrucciones:

## Opción 1: Despliegue desde Git (Recomendado)

1. **Sube tu proyecto a GitHub/GitLab**
   - Crea un repositorio en GitHub o GitLab
   - Sube todo el código del proyecto

2. **Conecta con Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Haz clic en "New site from Git"
   - Conecta tu repositorio de GitHub/GitLab
   - Selecciona tu repositorio

3. **Configuración automática**
   - Netlify detectará automáticamente la configuración desde `netlify.toml`
   - Build command: `npm install && vite build`
   - Publish directory: `dist/public`
   - No necesitas cambiar nada más

4. **Despliega**
   - Haz clic en "Deploy site"
   - Tu sitio estará listo en unos minutos

## Opción 2: Despliegue Manual

1. **Construir el proyecto localmente**
   ```bash
   npm install
   vite build
   ```

2. **Subir manualmente a Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Haz clic en "New site"
   - Selecciona "Deploy manually"
   - Arrastra la carpeta `dist/public` al área de despliegue

## Archivos Importantes

- `netlify.toml` - Configuración de build para Netlify
- `client/public/_redirects` - Configuración de rutas para SPA (Single Page Application)

## Características Configuradas

✅ **SPA Routing**: Las rutas de React Router funcionarán correctamente
✅ **Build automático**: Netlify construirá el proyecto automáticamente
✅ **Optimización**: Archivos CSS y JS minificados
✅ **Funciona sin backend**: La aplicación usa localStorage para las fotos

## Problema Solucionado

El "index" que necesitabas está en:
- `client/index.html` - El archivo HTML principal
- Se copia automáticamente a `dist/public/index.html` durante el build
- Netlify lo detecta automáticamente como página principal

## Notas Importantes

- La aplicación actualmente usa `localStorage` para guardar las fotos
- No necesitas configurar base de datos en Netlify
- Todas las animaciones y efectos visuales funcionarán perfectamente
- El proyecto está optimizado para producción

¡Ya puedes desplegarlo en Netlify sin problemas!