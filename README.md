# 🐷 PORCIPLUS — Sistema de Gestión Sanitaria & Control de Mortalidad

**PORCIPLUS** es una solución integral desarrollada para explotaciones y granjas porcinas, diseñada para la captura de datos zootécnicos, control sanitario, registro de bajas/mortalidad y análisis estadístico en tiempo real. 

El sistema cuenta con arquitectura cliente-servidor basada en **Google Apps Script**, permitiendo operar tanto como una Aplicación Web independiente (Web App) como integrada directamente en hojas de cálculo alojadas en la Nube.

---

## 🚀 Características Principales

- **📊 Tablero Ejecutivo & Métricas en Tiempo Real**:
  - Indicadores clave de desempeño (KPIs): Total de bajas, tasa de mortalidad, bajas acumuladas en el mes y semana pico.
  - Visualización gráfica de causas recurrentes y galpones/zonas críticas.

- **📋 Registro y Tabla Interactiva**:
  - Registro ágil de bajas con campos detallados: arete, fecha, causa, ubicación/lote, observaciones y auditoría de usuario.
  - Búsqueda en tiempo real, ordenamiento por columnas, paginación y exportación de datos.

- **📈 Analítica & Gráficos Zootécnicos**:
  - Curvas de tendencia semanal.
  - Desglose porcentual por causa clínica o accidental.

- **⚠️ Alertas Sanitarias Tempranas**:
  - Detección de picos inusuales de mortalidad para activar protocolos de bioseguridad preventiva.

- **🔐 Seguridad y Control de Accesos (RBAC)**:
  - Sistema de roles: Administrador, Médico Veterinario y Operador.
  - Permisos granulares: Visualización, Registro, Edición/Eliminación y Administración de usuarios.
  - Registro de auditoría por cada evento persistido.

- **☁️ Sincronización en la Nube con Google Apps Script**:
  - Almacenamiento seguro y persistente en la Nube de Google Drive.
  - Sincronización bidireccional de registros zootécnicos y cuentas de usuario.
  - Soporte para cambiar o vincular una nueva hoja de cálculo en cualquier momento pegando su enlace o ID.
  - Operación fuera de línea con persistencia local y sincronización diferida.

---

## 📁 Estructura del Proyecto

```text
PORCIPLUS/
│
├── Código.gs          # Backend en Google Apps Script (APIs, sincronización, base de datos)
├── index.html         # Frontend cliente (SPA interactiva moderna, interfaz y lógica React)
├── .gitignore         # Reglas de exclusión para control de versiones Git
├── .gitattributes     # Normalización de saltos de línea (LF) y codificación UTF-8
└── README.md          # Documentación general del sistema
```

---

## 🛠️ Guía de Instalación y Despliegue

### 1. Crear el Proyecto en Google Apps Script
1. Ingresa a [Google Apps Script](https://script.google.com/) con tu cuenta de Google.
2. Haz clic en **Nuevo proyecto** y asigna el nombre **PORCIPLUS**.

### 2. Configurar el Código del Servidor
1. En el editor de Apps Script, abre el archivo predeterminado `Código.gs` (o `Code.gs`).
2. Reemplaza todo su contenido con el código del archivo [`Código.gs`](Código.gs) de este repositorio.
3. Guarda los cambios (`Ctrl + S`).

### 3. Crear el Archivo de Interfaz
1. En el panel izquierdo de Apps Script, haz clic en el botón **+** (Añadir un archivo) y selecciona **HTML**.
2. Nómbralo **`index`** (o `Index`, ambos son compatibles).
3. Reemplaza todo su contenido con el archivo [`index.html`](index.html) de este repositorio.
4. Guarda los cambios (`Ctrl + S`).

### 4. Implementar como Aplicación Web (Web App)
1. En la esquina superior derecha, haz clic en **Implementar** > **Nueva implementación**.
2. Haz clic en el icono de engranaje (⚙️) junto a "Seleccionar tipo" y elige **Aplicación web**.
3. Configura los siguientes parámetros:
   - **Descripción**: `PORCIPLUS Versión Producción`
   - **Ejecutar como**: `Yo (tu correo electrónico)`
   - **Quién tiene acceso**: `Cualquier usuario con cuenta de Google` (o la opción según las políticas de tu organización).
4. Haz clic en **Implementar**.
5. Concede los permisos habituales de Google Drive y acceso a la hoja de cálculo cuando el asistente lo solicite.
6. Copia la **URL de la aplicación web** generada para acceder al sistema desde cualquier dispositivo o navegador.

---

## 👥 Credenciales de Acceso Inicial

El sistema incluye usuarios predeterminados de demostración con diferentes niveles de privilegios:

| Usuario | Contraseña | Rol | Privilegios |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | **Administrador** | Acceso total: datos, reportes, usuarios y configuración en la nube |
| **veterinario** | `vet123` | **Médico Veterinario** | Registro, edición, análisis clínico y alertas |
| **operador** | `user123` | **Operador / Usuario** | Captura y consulta de bajas zootécnicas |

> 💡 *Nota: Puedes crear nuevos usuarios o editar las contraseñas existentes directamente desde el módulo **Gestión de Usuarios** una vez iniciada la sesión como Administrador.*

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia MIT. Consulta el archivo de licencia correspondiente para más detalles.
