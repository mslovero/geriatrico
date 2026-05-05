# 🏥 Sistema de Gestión Geriátrica

Sistema integral de gestión para residencias geriátricas que permite administrar pacientes, medicación, historiales médicos, signos vitales y más.

## 🚀 Características Principales

### 📊 **Gestión de Pacientes**
- Registro completo de pacientes con datos personales y médicos
- Asignación de habitaciones y camas
- Estados de paciente (activo, temporal, ausente, alta médica, etc.)
- Contactos de emergencia y médico de cabecera
- Ficha completa del paciente con toda su información médica

### 💊 **Gestión de Medicamentos**
- Registro de medicamentos asignados a cada paciente
- Control de administración de medicamentos con horarios
- Historial de administración
- Alertas y seguimiento

### 📈 **Monitoreo Médico**
- Registro de signos vitales (presión arterial, temperatura, frecuencia cardíaca, saturación de oxígeno)
- Historial médico completo
- Gestión de archivos médicos
- Registro de incidencias

### 📦 **Gestión de Stock** ⭐ NUEVO
- **Sistema profesional de lotes** con trazabilidad completa
- Control FIFO automático (First In, First Out)
- Gestión de medicamentos y suministros médicos
- Separación de stock: Geriátrico / Pacientes / Obra Social
- Alertas de stock bajo y próximos a vencer
- Reportes de costos y consumo
- **[Ver documentación completa](./README_STOCK_PROFESIONAL.md)**
- **[✅ Corrección de Flujo Implementada (05/12/2024)](./FLUJO_EJECUTIVO.md)**

### 🍽️ **Nutrición y Cuidados**
- Gestión de dietas personalizadas
- Control nutricional
- Registro de turnos médicos

### 👥 **Gestión de Usuarios**
- Sistema de autenticación seguro
- Roles y permisos
- Administración de usuarios (solo para administradores)

### 🏠 **Infraestructura**
- Gestión de habitaciones
- Control de camas (disponibles/ocupadas)
- Asignación automática

## 🛠️ Stack Tecnológico

### **Frontend**
- ⚛️ React + Vite
- 🎨 CSS moderno con diseño responsive
- 🔄 React Router para navegación
- 🔐 Context API para autenticación

### **Backend**
- 🐘 Laravel (PHP)
- 🗄️ MySQL
- 🔒 Autenticación con Sanctum
- 📡 API RESTful

### **Deployment**
- ☁️ Frontend: Vercel
- 🚀 Backend: Render
- 🐳 Docker para desarrollo local

## 📦 Instalación

### Requisitos Previos
- Node.js (v16+)
- PHP (v8.0+)
- Composer
- MySQL
- Docker (opcional)

### Configuración con Docker

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/geriatrico.git
cd geriatrico

# Iniciar con Docker
docker-compose up -d
```

### Configuración Manual

#### Backend (Laravel)
```bash
cd geriatrico
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

#### Frontend (React)
```bash
cd frontGeriatrico
npm install
npm run dev
```

## 🌐 Demo en Vivo

- **Frontend**: [URL de Vercel]
- **Backend API**: [URL de Render]

## 📸 Capturas de Pantalla

[Aquí puedes agregar capturas de pantalla de tu aplicación]

## 🎯 Casos de Uso

Este sistema está diseñado para:
- ✅ Residencias geriátricas
- ✅ Centros de día para adultos mayores
- ✅ Clínicas especializadas en geriatría
- ✅ Hospitales con unidades geriátricas

## 🔐 Seguridad

- Autenticación basada en tokens
- Validación de datos en frontend y backend
- Protección CORS configurada
- Sanitización de inputs
- Soft deletes para preservar datos históricos

## 📝 Funcionalidades Destacadas

1. **Dashboard Interactivo**: Visualización en tiempo real de estadísticas clave
2. **Gestión Integral**: Todo en un solo lugar - desde pacientes hasta medicamentos
3. **Responsive Design**: Funciona perfectamente en desktop, tablet y móvil
4. **Historial Completo**: Trazabilidad total de todas las acciones médicas
5. **Alertas y Notificaciones**: Sistema de incidencias para eventos importantes

## 🚧 Roadmap

- [ ] Reportes en PDF
- [ ] Notificaciones push
- [ ] Integración con sistemas de farmacia
- [ ] App móvil nativa (React Native)
- [ ] Dashboard de analíticas avanzadas
- [ ] Integración con dispositivos IoT para signos vitales

## 👨‍💻 Desarrollador

Desarrollado por [Tu Nombre]

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
