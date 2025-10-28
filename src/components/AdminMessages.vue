<template>
  <div class="p-8 bg-gray-800 rounded-xl shadow-2xl max-w-4xl mx-auto">
    <h2 class="text-3xl font-bold mb-6 text-teal-400">Panel de Mensajes (ADMIN)</h2>

    <div v-if="loading" class="text-center text-xl py-10">Cargando notitas del Guardián...</div>
    <div v-else-if="error" class="text-red-500 text-center py-10">Error al cargar: {{ error }}</div>
    <div v-else-if="mensajes.length === 0" class="text-center text-gray-400 py-10">
        No hay notitas nuevas en la Caja Fuerte.
    </div>

    <div v-else class="space-y-4">
      <div v-for="mensaje in mensajes" :key="mensaje.id" class="p-4 bg-gray-700 rounded-lg shadow-md border-l-4 border-purple-500">
        <p class="text-xs text-gray-400">Fecha: {{ formatDate(mensaje.received_at) }}</p>
        <p class="text-lg font-semibold text-white mt-1">{{ mensaje.name }}</p>
        <p class="text-sm text-teal-400">{{ mensaje.email }}</p>
        <p class="mt-2 text-gray-300 border-t border-gray-600 pt-2">{{ mensaje.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const mensajes = ref([]);
const loading = ref(true);
const error = ref(null);

// Function to format the date string safely
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    // Create a new Date object from the string
    const date = new Date(dateString);
    
    // Check if the date is valid before formatting
    if (isNaN(date.getTime())) {
        return 'Fecha Inválida';
    }
    
    // Format the date as DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const fetchMensajes = async () => {
   // 1. 🛑 OBTENER EL TOKEN DEL ALMACENAMIENTO LOCAL
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Redirigir al login si no hay token
        console.error("No hay token de autenticación. Redirigiendo a /login.");
        window.location.href = '/login'; 
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/admin/mensajes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 2. 🛑 ADJUNTAR EL TOKEN AL ENCABEZADO DE AUTORIZACIÓN
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.ok) {
        const data = await response.json();
        // Asignar el array de mensajes a la ref:
        mensajes.value = data; // Asumo que el backend devuelve un array directamente
    }

        if (!response.ok) {
            // Este es el bloque que captura el error 401
            const errorBody = await response.json();
            throw new Error(`Error ${response.status}: ${errorBody.message}`);
        }

       

  } catch (err) {
    console.error('Error al cargar mensajes:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Pide la lista de notitas tan pronto como el componente se ve
  fetchMensajes();
});
</script>