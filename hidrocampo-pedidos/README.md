# 🌿 Hidrocampo - Sistema de Pedidos

Sistema web para gestión de pedidos de Hidrocampo. Conecta con Google Sheets como base de datos.

## 🚀 Despliegue Rápido en Vercel

### 1. Preparar Google Sheets

1. Sube `Sistema_Pedidos_Hidrocampo_CORREGIDO.xlsx` a Google Drive
2. Ábrelo con Google Sheets (click derecho → Abrir con → Google Sheets)
3. Copia el ID de la URL: `https://docs.google.com/spreadsheets/d/[ESTE_ID]/edit`
4. Renombra las hojas a: `BBDD_Clientes`, `BD_Productos`, `BD_Pedidos`

### 2. Crear Service Account en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea proyecto → Habilita **Google Sheets API**
3. Credentials → Create Service Account
4. Descarga el JSON con las credenciales
5. **Comparte tu Google Sheet** con el email del service account (como Editor)

### 3. Desplegar en Vercel

```bash
npm i -g vercel
vercel
```

Agrega estas variables de entorno en Vercel:

| Variable | Valor |
|----------|-------|
| `GOOGLE_SHEET_ID` | ID de tu Google Sheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` del JSON |
| `GOOGLE_PRIVATE_KEY` | `private_key` del JSON |

### 4. ¡Listo!

Tu app estará en `https://tu-proyecto.vercel.app`

## 📁 Estructura

```
src/
├── app/
│   ├── api/clientes/route.ts    # GET clientes
│   ├── api/productos/route.ts   # GET productos por cliente
│   ├── api/pedidos/route.ts     # GET/POST pedidos
│   └── page.tsx                 # Página principal
├── components/                   # Componentes React
├── lib/sheets.ts                # Conexión Google Sheets
└── types/index.ts               # Tipos TypeScript
```

## 🎨 Características

- ✅ Selector de cliente con búsqueda
- ✅ Productos filtrados por cliente
- ✅ Precios negociados automáticos
- ✅ Solo ingresar cantidades
- ✅ ID trazable (HC-2025-0001)
- ✅ Fecha de despacho configurable
- ✅ Cálculo automático de totales + IVA

## 🛠️ Desarrollo Local

```bash
npm install
cp .env.example .env.local
# Editar .env.local con credenciales
npm run dev
```

---
Desarrollado para Hidrocampo 🌿
