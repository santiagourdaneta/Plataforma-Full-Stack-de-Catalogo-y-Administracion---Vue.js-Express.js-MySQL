import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Define una interfaz para el objeto de usuario que se codificará en el token.
// Esto ayuda a mantener el tipado estricto.
interface UserPayload {
    id: number;
    username: string;
    role?: string; // El rol es opcional pero recomendado
}

/**
 * @function generateToken
 * @description Genera un JSON Web Token (JWT) para el usuario proporcionado.
 * @param user - El objeto de usuario a codificar en el token.
 * @returns {string} El token JWT generado.
 */
export const generateToken = (user: UserPayload): string => {
    // 1. Obtener la clave secreta
    // Usamos una clave de fallback si la variable de entorno no está definida.
    // En producción, ¡la clave secreta debe ser fuerte y almacenada de forma segura!
    const secret = process.env.JWT_SECRET || 'mi_clave_secreta_fuerte'; 

    // 2. Definir la carga útil (payload) del token
    const payload = {
        id: user.id,
        username: user.username,
        // Incluir el rol solo si existe, es clave para la autorización
        ...(user.role && { role: user.role }), 
    };

    // 3. Generar el token
    // Se establece una expiración de 1 día para el token
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    return token;
};
