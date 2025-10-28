import * as dotenv from 'dotenv';
import path from 'path';
import { app, initializeDatabase } from './server';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Inicializar la conexión a la base de datos (usando la nueva lógica flexible)
        await initializeDatabase();
        
        // Iniciar el servidor Express
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ El servidor no pudo iniciar debido a un error de base de datos crítico.");
        process.exit(1);
    }
}

startServer();
