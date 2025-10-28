import express, { Request, Response } from 'express';
import { getDatabasePool } from '../../server'; // Importa getDatabasePool
import { generateToken } from '../utils/auth'; // Importa la función del token
import { RowDataPacket } from 'mysql2/promise';

// 🛑 Instala y usa bcryptjs para comparar contraseñas (necesitas instalar: npm i bcryptjs @types/bcryptjs)
import * as bcrypt from 'bcryptjs'; 

const authRouter = express.Router();

// POST /login -> Maneja la solicitud de inicio de sesión
authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        
        // 1. Obtener la conexión a la DB
        const currentPool = await getDatabasePool();
        
        // 2. Verificar credenciales (consulta SQL)
        const sql = 'SELECT id, username, password_hash, role FROM users WHERE username = ?';
        const [rows] = await currentPool.execute(sql, [username]);
        
        const user = (rows as RowDataPacket[])[0]; // Asegurarse de tipar la respuesta
        
        if (!user) {
            // Usuario no encontrado o contraseña incorrecta (respuesta genérica por seguridad)
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // 3. Comparar contraseña (Usando bcrypt)
        // Reemplaza esta línea si usas otra librería de hashing
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // 4. Generar Token JWT
        const token = generateToken({ 
            id: user.id, 
            username: user.username, 
            role: user.role 
        }); 

        // 5. Respuesta Exitosa
        res.status(200).json({ token, role: user.role });

    } catch (error) {
        console.error('Error durante el login:', error);
        res.status(500).json({ error: 'Error interno del servidor durante el login.' });
    }
});

export default authRouter;