<script setup lang="ts">
import { ref } from 'vue';

const name = ref('');
const email = ref('');
const message = ref('');
const statusMessage = ref('');
const isSubmitting = ref(false);

const submitForm = async () => {
    if (!name.value || !email.value || !message.value) {
        statusMessage.value = 'Por favor, completa todos los campos.';
        return;
    }

    isSubmitting.value = true;
    statusMessage.value = '';

    try {
        const response = await fetch('http://localhost:3000/api/contacto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name.value,
                email: email.value,
                message: message.value,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            statusMessage.value = '✅ ¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.';
            // Limpiar formulario
            name.value = '';
            email.value = '';
            message.value = '';
        } else {
            statusMessage.value = `❌ Error al enviar: ${data.message || 'Error desconocido.'}`;
        }
    } catch (error) {
        console.error('Error de red/servidor:', error);
        statusMessage.value = '❌ No se pudo conectar con el servidor backend.';
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="max-w-xl mx-auto p-8 bg-gray-50 shadow-xl rounded-xl">
        
        <p v-if="statusMessage" 
           :class="statusMessage.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
           class="p-3 mb-6 rounded font-semibold text-center">
            {{ statusMessage }}
        </p>

        <form @submit.prevent="submitForm" class="space-y-6">
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input 
                    type="text" 
                    id="name" 
                    v-model="name" 
                    required 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input 
                    type="email" 
                    id="email" 
                    v-model="email" 
                    required 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
            </div>

            <div>
                <label for="message" class="block text-sm font-medium text-gray-700">Mensaje</label>
                <textarea 
                    id="message" 
                    rows="4" 
                    v-model="message" 
                    required 
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                ></textarea>
            </div>

            <button 
                type="submit" 
                :disabled="isSubmitting"
                class="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
            >
                {{ isSubmitting ? 'Enviando...' : 'Enviar Mensaje' }}
            </button>
        </form>
    </div>
</template>