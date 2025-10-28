<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

// -------------------------------------------------------------------
// TIPOS DE DATOS (TypeScript)
// -------------------------------------------------------------------

// Define la estructura esperada para un juguete
interface Juguete {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number | string; // Permitimos string ya que la DB puede devolverlo así
    stock: number;
}

// -------------------------------------------------------------------
// ESTADOS REACTIVOS
// -------------------------------------------------------------------

const searchQuery = ref(''); // Término de búsqueda
const juguetes = ref<Juguete[]>([]); // Lista de resultados
const isLoading = ref(false); // Estado de carga
const errorMessage = ref(''); // Mensaje de error

// 🛑 ESTADOS DE PAGINACIÓN
const currentPage = ref(1);
const totalPages = ref(0);
const totalItems = ref(0);

// -------------------------------------------------------------------
// LÓGICA DE BÚSQUEDA Y API
// -------------------------------------------------------------------

const fetchResults = async () => {
    errorMessage.value = '';
    isLoading.value = true;
    
    // Construye la URL con los parámetros de búsqueda y paginación
    const url = `http://localhost:3000/api/juguetes?q=${searchQuery.value}&page=${currentPage.value}`;

    try {
        const response = await fetch(url);
        
        // Verifica si la respuesta HTTP es exitosa
        if (!response.ok) {
            // Manejo de errores HTTP (ej: 404, 500)
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(`Error ${response.status}: ${errorData.error || errorData.message || 'No se pudieron cargar los juguetes.'}`);
        }

        const data = await response.json();
        
        // 🛑 Mapear los resultados para asegurar que el precio sea un número
        juguetes.value = data.juguetes.map((item: any) => ({
            ...item,
            // Convierte el valor de precio a float para usar .toFixed() en el template
            precio: parseFloat(item.precio) 
        }));

        // 🛑 Actualizar estados de paginación
        totalPages.value = data.totalPages;
        totalItems.value = data.totalItems;

    } catch (error: any) {
        console.error('Error durante la búsqueda:', error);
        errorMessage.value = error.message || 'Error de red. No se pudo conectar al servidor.';
        juguetes.value = [];
        totalPages.value = 0;
        totalItems.value = 0;
    } finally {
        isLoading.value = false;
    }
};

// -------------------------------------------------------------------
// LÓGICA DE PAGINACIÓN
// -------------------------------------------------------------------

/**
 * Cambia la página actual y recarga los resultados.
 * @param page El número de página a cargar.
 */
const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
        currentPage.value = page;
        // Reiniciamos el scroll al cargar una nueva página (buena UX)
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
        fetchResults();
    }
};

// -------------------------------------------------------------------
// WATCHERS Y HOOKS DE CICLO DE VIDA
// -------------------------------------------------------------------

// Reinicia la página a 1 cada vez que cambia el término de búsqueda
watch(searchQuery, () => {
    currentPage.value = 1;
    fetchResults();
});

// Cargar resultados al montar el componente
onMounted(fetchResults);

// Función auxiliar para generar el array de números de página
// Muestra 2 páginas a la izquierda y 2 a la derecha de la actual
const getPageNumbers = () => {
    const range = 2; // Mostrar 2 números antes y 2 después
    const start = Math.max(1, currentPage.value - range);
    const end = Math.min(totalPages.value, currentPage.value + range);
    const pages = [];

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
};

</script>

<template>
    <div class="p-4 md:p-8 max-w-7xl mx-auto">
        
        <div class="mb-8">
            <input
                type="text"
                v-model="searchQuery"
                placeholder="Busca por nombre o descripción..."
                class="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                aria-label="Término de búsqueda de juguetes"
            />
        </div>

        <p v-if="isLoading" class="text-center py-10 text-indigo-600 font-semibold">
            Cargando resultados, por favor espera...
        </p>

        <p v-else-if="errorMessage" class="text-center py-10 bg-red-100 text-red-700 rounded-lg p-4">
            {{ errorMessage }}
        </p>
        
        <p v-else-if="juguetes.length === 0 && searchQuery !== ''" class="text-center py-10 text-gray-500">
            No se encontraron juguetes que coincidan con "{{ searchQuery }}".
        </p>

        <div v-else-if="juguetes.length > 0">
            <p class="text-sm text-gray-600 mb-4">
                Mostrando {{ juguetes.length }} resultados de {{ totalItems }} en total.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <div v-for="item in juguetes" :key="item.id" 
                     class="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100 overflow-hidden"
                >
                    <div class="h-48 bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                        
                    </div>
                    
                    <div class="p-5">
                        <h2 class="text-xl font-bold text-gray-900 mb-2">{{ item.nombre }}</h2>
                        <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ item.descripcion }}</p>
                        
                        <div class="flex justify-between items-end mt-4">
                            <span class="text-2xl font-extrabold text-indigo-600">
                                ${{ item.precio.toFixed(2) }} 
                            </span>
                            <span :class="{
                                'text-green-600 bg-green-100': item.stock > 10,
                                'text-orange-600 bg-orange-100': item.stock <= 10 && item.stock > 0,
                                'text-red-600 bg-red-100': item.stock === 0
                            }" class="text-xs font-semibold px-3 py-1 rounded-full">
                                {{ item.stock > 0 ? `Stock: ${item.stock}` : 'Agotado' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="totalPages > 1" class="flex justify-center items-center mt-12 space-x-2">
            
            <button 
                @click="changePage(currentPage - 1)" 
                :disabled="currentPage === 1 || isLoading"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition duration-150"
            >
                &lt; Anterior
            </button>

            <template v-for="page in getPageNumbers()" :key="page">
                <button 
                    @click="changePage(page)" 
                    :disabled="isLoading"
                    :class="{ 
                        'bg-indigo-600 text-white font-bold shadow-md': page === currentPage,
                        'bg-white text-gray-700 hover:bg-indigo-50': page !== currentPage 
                    }"
                    class="w-10 h-10 border rounded-lg transition duration-150"
                >
                    {{ page }}
                </button>
            </template>

            <button 
                @click="changePage(currentPage + 1)" 
                :disabled="currentPage === totalPages || isLoading"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition duration-150"
            >
                Siguiente &gt;
            </button>
        </div>
        
    </div>
</template>

<style scoped>
/* Estilos adicionales si fueran necesarios */
</style>