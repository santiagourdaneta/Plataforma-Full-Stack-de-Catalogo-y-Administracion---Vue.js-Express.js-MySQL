<script setup lang="ts">
import { ref } from 'vue';

// Variables reactivas para los campos del formulario y el estado
const username = ref('admin'); // Mantener los valores por defecto para prueba
const password = ref('123456'); // Mantener los valores por defecto para prueba
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
    errorMessage.value = '';
    successMessage.value = '';
    isLoading.value = true;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // ✅ PASO CLAVE: Guardar el token en localStorage con la clave 'authToken'
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                successMessage.value = 'Inicio de sesión exitoso. Redireccionando...';
                
                // Redirige al dashboard de mensajes o al home después de un breve delay
                setTimeout(() => {
                    window.location.href = '/admin/mensajes';
                }, 1000);
            }
        } else {
            errorMessage.value = data.message || 'Credenciales inválidas o error en el servidor.';
        }
    } catch (error) {
        console.error('Error de red durante el login:', error);
        errorMessage.value = 'No se pudo conectar con el servidor backend.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div class="max-w-md w-full p-8 bg-white shadow-2xl rounded-xl border border-gray-200">
            <h2 class="text-3xl font-extrabold mb-8 text-center text-gray-900">Bienvenido, Guardián</h2>
            
            <form @submit.prevent="handleLogin" class="space-y-6">
                <p v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg font-medium">{{ errorMessage }}</p>
                <p v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded-lg font-medium">{{ successMessage }}</p>

                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                    <input 
                        type="text" 
                        id="username" 
                        :value="username" 
                        @input="event => username = event.target.value"
                        required 
                        placeholder="Ingresa tu nombre de usuario"
                        class="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900"
                    />
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input 
                        type="password" 
                        id="password" 
                        :value="password"
                        @input="event => password = event.target.value" 
                        required 
                        placeholder="Ingresa tu contraseña"
                        class="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900"
                    />
                </div>

                <button 
                    type="submit" 
                    :disabled="isLoading"
                    class="w-full py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-300 ease-in-out"
                >
                    {{ isLoading ? 'Verificando credenciales...' : '🔓 Ingresar al Panel' }}
                </button>
            </form>
        </div>
    </div>
</template>