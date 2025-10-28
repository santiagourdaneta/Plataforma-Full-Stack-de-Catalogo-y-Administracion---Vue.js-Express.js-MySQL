<template>
  <div class="p-8 bg-gray-800 rounded-xl shadow-2xl max-w-4xl mx-auto">
    <h2 class="text-3xl font-bold mb-6 text-purple-400">Juguetes de Velocidad de la Luz</h2>

    <input
      type="text"
      v-model="searchText"
      placeholder="Busca un juguete..."
      class="w-full p-3 mb-6 rounded-md border border-gray-600 bg-gray-700 text-white focus:ring-purple-500 focus:border-purple-500"
    />

    <div v-if="loading" class="text-center text-xl py-10 text-gray-400">Buscando juguetes...</div>
    <div v-else-if="error" class="text-red-500 text-center py-10">Error: {{ error }}</div>
    <div v-else-if="juguetes.length === 0" class="text-center text-gray-400 py-10">
        No se encontraron juguetes con ese término.
    </div>

    <div v-else class="space-y-3">
      <div v-for="juguete in juguetes" :key="juguete.id" class="p-4 bg-gray-700 rounded-lg shadow-md">
        <p class="text-lg font-semibold text-white">{{ juguete.nombre }}</p>
        <p class="text-sm text-teal-400">Color: {{ juguete.color }}</p>
        <p class="text-sm text-gray-300">{{ juguete.descripcion }}</p>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center space-x-4 mt-6">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1 || loading"
        class="py-2 px-4 bg-teal-600 text-white rounded-md disabled:bg-gray-500 transition-colors"
      >
        Anterior
      </button>
      <span class="text-white">Página {{ currentPage }} de {{ totalPages }}</span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages || loading"
        class="py-2 px-4 bg-teal-600 text-white rounded-md disabled:bg-gray-500 transition-colors"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { debounce } from 'lodash-es'; // Importamos la magia de debounce

const juguetes = ref([]);
const searchText = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const loading = ref(false);
const error = ref(null);

// 1. FUNCIÓN QUE HACE LA LLAMADA AL GUARDIÁN (El motor principal)
const fetchJuguetes = async () => {
  loading.value = true;
  error.value = null;
  
  const query = searchText.value.trim();
  const url = `http://localhost:3000/api/juguetes?q=${query}&page=${currentPage.value}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo obtener la lista de juguetes.`);
    }

    const data = await response.json();
    juguetes.value = data.juguetes;
    totalPages.value = data.totalPaginas;

  } catch (err) {
    console.error('Error al cargar juguetes:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// 2. CREAMOS LA VERSIÓN DEBOUNCE DE LA FUNCIÓN
// Solo llama a fetchJuguetes después de 300ms sin que el usuario escriba.
const debouncedFetch = debounce(fetchJuguetes, 300);

// 3. OBSERVAR LAS VARIABLES (watch)
// Observa la búsqueda (la variable searchText). Si cambia, resetea la página a 1 y llama a debouncedFetch.
watch(searchText, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        currentPage.value = 1; // Si busco algo nuevo, vuelvo a la página 1
        debouncedFetch();
    }
});

// Observa la página actual. Si cambia, llama a fetchJuguetes inmediatamente (no necesita debounce).
watch(currentPage, () => {
    fetchJuguetes();
});

// Pide los juguetes iniciales al montar
onMounted(() => {
  fetchJuguetes();
});
</script>