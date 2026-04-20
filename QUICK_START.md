# 🚀 Quick Start Guide

## ⚡ 5 Minutos para Tener la App Funcionando

### Paso 1: Instalar Dependencias
```bash
npm install
```
**⏱️ ~2-3 minutos**

### Paso 2: Configurar Firebase
1. Ir a https://console.firebase.google.com/
2. Crear nuevo proyecto
3. Habilitar Firestore Database
4. Habilitar Authentication (Email + Google)
5. Copiar credenciales a `.env`:

```bash
cp .env.example .env
```

Luego editar `.env` con tus valores:
```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### Paso 3: Deploy Firestore Rules
1. Firebase Console → Firestore → Rules
2. Reemplazar todo con contenido de `firestore.rules`
3. Click "Publish"

### Paso 4: Ejecutar Dev Server
```bash
npm run dev
```
**⏱️ ~30 segundos**

Abre: http://localhost:5173 ✓

### Paso 5: (Opcional) Seed Database
```bash
npm run seed
```

Login con:
- Email: `admin@tourism.com`
- Password: `Admin123!`

---

## 📋 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Inicia dev server con HMR

# Build
npm run build        # Compilar para producción
npm run preview      # Ver build en local

# Testing
npm run test         # Ejecutar tests una vez
npm run test:watch   # Modo watch
npm run test:coverage # Reporte de cobertura

# Lint
npm run lint         # Verificar código con ESLint

# Database
npm run seed         # Poblar BD con datos de ejemplo
```

---

## ✅ Verificar que Todo Funciona

```bash
# 1. Check de TypeScript
npx tsc --noEmit

# 2. Lint check
npm run lint

# 3. Build check
npm run build

# 4. Tests check
npm run test
```

---

## 🎯 Features Listos para Usar

✅ Autenticación (Email + Google)
✅ 8 Tours con imágenes reales
✅ Mapas interactivos
✅ Sistema de bookings
✅ Admin panel
✅ Dashboard de usuario
✅ Responsive design
✅ 20 tests incluidos

---

## 🔗 Links Útiles

- Firebase Console: https://console.firebase.google.com/
- Vite Docs: https://vitejs.dev/
- React Docs: https://react.dev
- Tailwind: https://tailwindcss.com
- DaisyUI: https://daisyui.com

---

## 🆘 Troubleshooting Rápido

**Error: Firebase config not found**
```bash
# Asegúrate que .env existe y tiene valores
cat .env

# Reinicia dev server
npm run dev
```

**Error: Port 5173 en uso**
```bash
npm run dev -- --port 5174
```

**Error: Node modules corrupto**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error: TypeScript**
```bash
npx tsc --noEmit
```

---

¡Listo! 🎉 Tu app de turismo está funcionando.
