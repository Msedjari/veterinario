
# 🐾 Clínica Veterinaria - Frontend

Aplicación frontend para la gestión de usuarios, mascotas y tratamientos veterinarios, desarrollada con React y TypeScript.

## 📦 Tecnologías utilizadas

- React 
- TypeScript
- React Router DOM
- Axios
- CSS

## 🚀 Características principales

- Gestión completa de usuarios (propietarios de mascotas)
- Administración de mascotas asociadas a usuarios
- Registro y seguimiento de tratamientos médicos
- Interfaz intuitiva con diseño responsive
- Navegación fluida entre secciones relacionadas

## 📱 Estructura de la aplicación

La aplicación está organizada en tres secciones principales:

- **Usuarios**: Registro y gestión de propietarios de mascotas
- **Mascotas**: Administración de mascotas asociadas a usuarios
- **Tratamientos**: Seguimiento de tratamientos médicos para cada mascota

## 🔧 Configuración del proyecto

### Requisitos previos

- Node.js (v14 o superior)
- npm o yarn
- [@Backend](https://github.com/Fernandodg97/veterinario) de la Clínica Veterinaria en funcionamiento 

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/clinica-veterinaria-frontend.git

# Entrar al directorio
cd clinica-veterinaria-frontend

# Instalar dependencias
npm install
# o
yarn install

# Iniciar la aplicación en modo desarrollo
npm start
# o
yarn start
```

### Configuración de la API

La aplicación se conecta a un backend REST. La URL base de la API se configura en el archivo `src/services/apiController.tsx`:

```typescript
// URL base de la API
const API_URL = 'http://192.168.251.60:4040/api';
```

Modifica esta URL para que apunte a tu servidor backend.

## 📁 Estructura del proyecto

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── ConfirmDialog.tsx
│   │   ├── users/
│   │   │   ├── UserList.tsx
│   │   │   └── UserForm.tsx
│   │   ├── pets/
│   │   │   ├── PetList.tsx
│   │   │   └── PetForm.tsx
│   │   ├── treatments/
│   │   │   ├── TreatmentList.tsx
│   │   │   └── TreatmentForm.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── api.tsx
│   │   └── apiController.tsx
│   ├── types/
│   │   └── index.tsx
│   ├── App.tsx
│   └── index.tsx
└── public/
```

## 🔄 Flujo de trabajo

### Usuarios

- Ver lista de todos los usuarios
- Crear nuevos usuarios
- Editar información de usuarios existentes
- Eliminar usuarios (con confirmación)
- Ver mascotas asociadas a un usuario específico

### Mascotas

- Ver lista de todas las mascotas
- Filtrar mascotas por usuario
- Crear nuevas mascotas (asociadas a un usuario)
- Editar información de mascotas existentes
- Eliminar mascotas (con confirmación)
- Ver tratamientos asociados a una mascota específica

### Tratamientos

- Ver lista de todos los tratamientos
- Filtrar tratamientos por mascota
- Crear nuevos tratamientos (asociados a una mascota)
- Eliminar tratamientos (con confirmación)

## 📊 Dashboard

La aplicación incluye un dashboard que muestra:

- Número total de usuarios registrados
- Número total de mascotas
- Número total de tratamientos
- Usuarios y mascotas añadidos recientemente

## 🌐 Rutas de la aplicación

- `/` - Dashboard principal
- `/users` - Lista de usuarios
- `/users/new` - Formulario para crear usuario
- `/users/edit/:id` - Formulario para editar usuario
- `/pets` - Lista de todas las mascotas
- `/pets/new` - Formulario para crear mascota
- `/pets/edit/:id` - Formulario para editar mascota
- `/users/:userId/pets` - Mascotas de un usuario específico
- `/users/:userId/pets/new` - Crear mascota para un usuario específico
- `/treatments` - Lista de todos los tratamientos
- `/treatments/new` - Formulario para crear tratamiento
- `/pets/:petId/treatments` - Tratamientos de una mascota específica
- `/pets/:petId/treatments/new` - Crear tratamiento para una mascota específica

## 🔌 Servicios API

La aplicación utiliza tres servicios principales para comunicarse con el backend:

- `userService`: Gestión de usuarios
- `petService`: Gestión de mascotas
- `treatmentService`: Gestión de tratamientos

Cada servicio proporciona métodos para operaciones CRUD (Crear, Leer, Actualizar, Eliminar).

## 👨‍💻 Autores

- [@Msedjari10](https://github.com/Msedjari10)
- [@Fernandodg97](https://github.com/Fernandodg97)


## 📄 Licencia

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
