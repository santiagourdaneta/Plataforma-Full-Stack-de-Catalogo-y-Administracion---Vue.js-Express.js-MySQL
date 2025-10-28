# 🚀 Horizon Metrics | Plataforma Full-Stack de Catálogo y Administración

Este proyecto es una aplicación web completa construida con Vue.js (Frontend), Express.js (Backend) y MySQL (Base de Datos), diseñada para funcionar como un catálogo interactivo con un panel de administración seguro.

## ✨ Características Principales

* **Autenticación Segura (JWT):** Sistema de inicio de sesión con validación de credenciales y generación de Tokens Web JSON (JWT) para proteger rutas de administrador.
* **Gestión de Catálogo:** Búsqueda avanzada y paginación eficiente de productos (`juguetes`) con consultas SQL optimizadas.
* **Formulario de Contacto:** Ruta pública protegida contra inyección SQL para la recepción de mensajes.
* **Panel de Administración:** Ruta protegida con *middleware* que requiere rol de `admin` para ver los mensajes de contacto.
* **Seguridad Implementada:** Defensas contra Inyección SQL (Consultas Preparadas), Rate Limiting en rutas críticas y validación estricta de datos.

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnología | Versión Clave |
| :--- | :--- | :--- |
| **Frontend** | Vue.js | ^3.x |
| **Backend** | Node.js / Express.js | ^4.x |
| **Lenguaje** | TypeScript | ^4.x |
| **Base de Datos** | MySQL | ^8.0 |
| **Seguridad** | JWT (jsonwebtoken) | |
| **Otros** | Axios, express-rate-limit, bcrypt | |

## ⚙️ Configuración y Ejecución Local

Sigue estos pasos para poner en marcha el proyecto en tu máquina local.

### 1. Requisitos

* Node.js (LTS recomendado)
* MySQL Server (con credenciales de acceso)

### 2. Base de Datos (MySQL)

Crea la base de datos y las tablas necesarias.

1.  Crea la base de datos `horizon_metrics`.
2.  Ejecuta los siguientes scripts SQL:
    ```sql
    -- Tabla para usuarios (administradores)
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user'
    );

    -- Tabla para el catálogo de juguetes
    CREATE TABLE juguetes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        stock INT NOT NULL DEFAULT 0
    );

    -- Tabla para mensajes de contacto
    CREATE TABLE contactos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

### 3. Backend (Express.js)

1.  Navega a la carpeta raíz del backend.
2.  Instala dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la raíz del backend con tus credenciales:
    ```
    DB_HOST=localhost
    DB_USER=tu_usuario_mysql
    DB_PASSWORD=tu_contraseña
    DB_NAME=horizon_metrics
    JWT_SECRET=TU_CLAVE_SECRETA_JWT_AQUI
    ```
4.  Inicia el servidor:
    ```bash
    npm start
    ```
    El servidor se ejecutará en `http://localhost:3000`.

### 4. Frontend (Vue.js)

1.  Navega a la carpeta del frontend (si está separada).
2.  Instala dependencias:
    ```bash
    npm install
    ```
3.  Inicia el cliente:
    ```bash
    npm run dev 
    ```
    El cliente se ejecutará en `http://localhost:5173` (o el puerto configurado).

## 🔑 Credenciales de Prueba

| Usuario | Contraseña | Rol |
| :--- | :--- | :--- |
| `admin` | `123456` | Administrador |
*(Nota: La contraseña `123456` debe ser hasheada con bcrypt e insertada manualmente en la tabla `users` antes de probar el login).*

## 🤝 Contribuciones

Las contribuciones, informes de errores y sugerencias son bienvenidas. Por favor, abre un *issue* o *pull request* en este repositorio.

full-stack, vuejs, express, nodejs, mysql, typescript, ecommerce, jwt-authentication, rate-limiting, security
#VueJS #ExpressJS #MySQL #FullStack #WebDevelopment #JWT #ECommerce #TypeScript