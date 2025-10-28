import express, { Request, Response, NextFunction } from 'express';
import * as mysql from 'mysql2/promise';
import { Pool, RowDataPacket } from 'mysql2/promise';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html'; 
import authRouter from './src/routes/auth';
import rateLimit from 'express-rate-limit';

//Rate Limiting (Límite de Tasa)
//Defensa: Middleware de Express para limitar solicitudes.
//Esto es crucial para proteger el login y prevenir ataques DDoS o de fuerza bruta.

// 🛑 Limiter general (100 peticiones por ventana de 15 minutos)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP
    standardHeaders: true,
    legacyHeaders: false,
});

// 🛑 Limiter para Login (Más estricto: 5 peticiones por minuto)
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // Límite de 5 peticiones por IP en 1 minuto
    message: 'Demasiados intentos de inicio de sesión, inténtalo de nuevo en un minuto.',
});

// --------------------------------------------------
// CONFIGURACIÓN Y FUNCIONES DE BASE DE DATOS
// --------------------------------------------------

// Declaramos 'pool' como mutable y lo exportamos para que las pruebas puedan inyectar un mock.
// Inicialmente es undefined.
export let pool: Pool | undefined;

/**
 * Crea e inicializa el pool de la base de datos MySQL.
 * Se ha modificado para permitir DB_PASSWORD vacío, si es necesario.
 */
export function createDatabasePool(): Pool {
    // 🛑 FIX CLAVE: Revisamos las variables requeridas EXCLUYENDO DB_PASSWORD de la verificación
    // de "falsy" (cadenas vacías). Solo verificamos que las que son *esenciales* estén presentes.
    const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_DATABASE'];

    if (requiredEnv.some(key => !process.env[key])) {
        throw new Error('Missing one or more required database environment variables (DB_HOST, DB_USER, DB_DATABASE).');
    }

    // Si DB_PASSWORD es una cadena vacía en el .env, lo acepta como tal.
    const dbPassword = process.env.DB_PASSWORD || ''; 

    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: dbPassword, // Usamos la contraseña (que puede ser '')
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
}

/**
 * Retorna la instancia del pool de la base de datos, inicializándola si es necesario.
 * Esto permite que las pruebas inyecten un pool mockeado directamente antes de que se use.
 */
export async function getDatabasePool(): Promise<Pool> {
    if (!pool) {
        pool = createDatabasePool();
        console.log("✅ Conexión a la base de datos establecida.");
    }
    return pool;
}

export async function initializeDatabase() {
    try {
        await getDatabasePool(); // Esto inicializa el pool y lo asigna a 'pool'
    } catch (error) {
        console.error("❌ Error al inicializar la base de datos:", error);
        throw error;
    }
}

// --------------------------------------------------
// CONFIGURACIÓN DE EXPRESS Y MIDDLEWARE
// --------------------------------------------------
export const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Aplicación del middleware:
app.use(limiter); // Aplica a todas las rutas por defecto
app.post('/api/auth/login', loginLimiter, (req, res) => { /* ... */ }); // Aplica el límite estricto al login
app.use('/api/auth', authRouter);

// --------------------------------------------------
// UTILS DE AUTENTICACIÓN
// --------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extracts the token after 'Bearer'

    if (!token) {
        return res.sendStatus(401); // Unauthorized (No token)
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden (Invalid token, or expired)
        }

        // 🛑 CRITICAL CHECK: Ensure the user role is 'admin'
        // If your token payload includes a 'role' field:
        if ((user as any).role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' }); // Forbidden (Wrong role)
        }
        
        (req as any).user = user; // Attach user payload to request
        next();
    });
};

// --------------------------------------------------
// RUTAS
// --------------------------------------------------

app.get('/test-route', (req, res) => {
    // 🛑 ESTA RUTA DEBE FUNCIONAR SI EL SERVIDOR ESTÁ CARGANDO ESTE ARCHIVO
    res.send('Server is alive and this test route is active!');
});

/**
 * GET /api/juguetes?q=&page=1
 * Maneja la búsqueda y paginación de juguetes.
 */
app.get('/api/juguetes', async (req: Request, res: Response) => {
    try {
        // Extrae los parámetros de la URL
        const query = (req.query.q as string || '').trim();
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10; // Define cuántos resultados por página
        const offset = (page - 1) * limit;

        // Construir la cláusula WHERE para la búsqueda
        let whereClause = '1=1';
        const params: any[] = [];

        if (query) {
            // Buscamos en el nombre o descripción del juguete
            whereClause = 'nombre LIKE ? OR descripcion LIKE ?';
            params.push(`%${query}%`, `%${query}%`);
        }

        const currentPool = await getDatabasePool();

        // 1. Obtener el total de juguetes (para la paginación)
        const [countRows] = await currentPool.execute(`SELECT COUNT(*) as total FROM juguetes WHERE ${whereClause}`, params);
        const total = (countRows as any)[0].total;

        // 2. Obtener los datos de los juguetes para la página actual
        const sql = `SELECT * FROM juguetes WHERE ${whereClause} LIMIT ? OFFSET ?`;
        
        // Agregamos el límite y el offset a los parámetros de la consulta
        const dataParams = [...params, limit, offset];

       const [juguetes] = await currentPool.execute(sql, dataParams);

       // 🛑 APLICAR CONVERSIÓN DE TIPO AQUÍ
       const juguetesFixed = (juguetes as any[]).map(juguete => ({
           ...juguete,
           // Convierte el precio de string (MySQL DECIMAL) a float/number
           precio: parseFloat(juguete.precio) 
       }));

       // 5. Respuesta exitosa
       res.json({
           juguetes: juguetesFixed, // Usamos los juguetes corregidos
           totalItems: total,
           totalPages: Math.ceil(total / limit),
           currentPage: page
       });

    } catch (error) {
        console.error("❌ Error al buscar juguetes:", error);
        // Responde con 500 para indicar un fallo interno del servidor
        res.status(500).json({ error: 'Error interno del servidor al procesar la búsqueda.' });
    }
});

// Ruta pública para contacto
app.post('/api/contacto', async (req: Request, res: Response) => {
    try {

            console.log('--- DEBUG START ---');
            console.log('HEADERS:', req.headers['content-type']); // Should be 'application/json'
            console.log('BODY KEYS:', Object.keys(req.body)); // Should show [name, email, message]
            console.log('BODY VALUES:', req.body.name, req.body.email, req.body.message);
            console.log('--- DEBUG END ---');

        const { name, email, message } = req.body;

        // 1. 🛑 Validación de datos de entrada (causa común del 400 Bad Request)
        if (!name || !email || !message) {
            return res.status(400).json({ 
                error: 'Faltan campos requeridos. Asegúrate de enviar nombre, correo electrónico y mensaje.' 
            });
        }

        // 2. Validación simple de formato de email (opcional pero recomendado)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'El formato del correo electrónico no es válido.' 
            });
        }

        // 3. Conexión a la DB y consulta SQL
        const currentPool = await getDatabasePool();
        
        const sql = `
            INSERT INTO contactos (name, email, message) 
            VALUES (?, ?, ?)
        `;
        
        await currentPool.execute(sql, [name, email, message]);

        // 4. Respuesta exitosa (201 Created)
        res.status(201).json({ 
            message: 'Mensaje de contacto enviado exitosamente. ¡Gracias por contactarnos!' 
        });

    } catch (error) {
        // Manejo de errores de servidor/DB (ej: tabla no existe, conexión fallida)
        console.error('❌ Error al procesar el formulario de contacto:', error);
        res.status(500).json({ 
            error: 'Ocurrió un error interno del servidor. Inténtalo de nuevo más tarde.' 
        });
    }
});

// Ruta protegida para administradores (obtener mensajes)
app.get('/api/admin/mensajes', authenticateToken, async (req: Request, res: Response) => {
    try {
        const currentPool = await getDatabasePool();
        const sql = 'SELECT * FROM contactos ORDER BY received_at DESC';
        const [rows] = await currentPool.execute(sql, []);
        
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener mensajes:", error);
        res.status(500).json({ error: 'Error al obtener mensajes.' });
    }
});


