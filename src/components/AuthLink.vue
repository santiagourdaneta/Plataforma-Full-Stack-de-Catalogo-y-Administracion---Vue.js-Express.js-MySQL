<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const isLogged = ref(false);
const isAdmin = ref(false);

const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    isLogged.value = !!token;
    
    // NOTA: Para verificar el rol de forma real, deberías decodificar el token aquí.
    // Por simplicidad, asumimos que si hay token, puede intentar ver el Admin link.
    // Una verificación más estricta sería:
    // try {
    //     const [header, payload, signature] = token.split('.');
    //     const user = JSON.parse(atob(payload));
    //     isAdmin.value = user.role === 'Admin';
    // } catch {
    //     isAdmin.value = false;
    // }

    // Usaremos isAdmin si hay token para mostrar el enlace de Admin
    isAdmin.value = isLogged.value;
};

const handleLogout = () => {
    localStorage.removeItem('authToken');
    isLogged.value = false;
    isAdmin.value = false;
    // Redirige o refresca para limpiar el estado
    window.location.href = '/login'; 
};

// Se ejecuta al montar y añade un listener para cambios de storage
onMounted(() => {
    checkAuthStatus();
    // Esto ayuda a reaccionar si el token cambia en otra pestaña/componente
    window.addEventListener('storage', checkAuthStatus);
});
</script>

<template>
    <a v-if="isAdmin" href="/admin/mensajes" class="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium">
        Administración
    </a>

    <button v-if="isLogged" @click="handleLogout" class="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium focus:outline-none">
        Logout
    </button>
    
    <a v-else href="/login" class="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium">
        Login
    </a>
</template>