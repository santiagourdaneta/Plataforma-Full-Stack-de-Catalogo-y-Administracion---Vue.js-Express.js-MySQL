<template>
  <div class="p-6 bg-gray-800 rounded-xl shadow-2xl max-w-lg mx-auto" role="region" aria-labelledby="chart-title">
    <h3 id="chart-title" class="text-2xl font-bold text-teal-400 mb-4">Métricas de Rendimiento</h3>
    
    <div class="h-40 bg-gray-700 rounded-lg flex items-end p-2 mb-4" role="img" aria-label="Gráfico de barras de métricas en tiempo real">
        <div v-for="(value, index) in dataPoints" :key="index"
             :style="{ height: value + '%' }"
             class="w-1/6 bg-blue-500 mx-1 transition-all duration-500 hover:bg-blue-400 cursor-pointer"
             role="presentation"
        >
        </div>
    </div>
    
    <button
      @click="updateData"
      class="w-full py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300 font-semibold"
      aria-label="Actualizar datos del gráfico"
    >
      Actualizar Datos ({{ updates }})
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const dataPoints = ref([50, 60, 30, 80, 45, 70]);
const updates = ref(0);

const updateData = () => {
  dataPoints.value = dataPoints.value.map(() => Math.floor(Math.random() * 60) + 30);
  updates.value++;
};
</script>