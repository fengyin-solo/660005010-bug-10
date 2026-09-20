import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
export const useOptimizationStore = defineStore('optimization', () => {
    const loading = ref(false);
    const result = ref(null);
    const animationStep = ref(0);
    const isPlaying = ref(false);
    let playTimer = null;
    async function runOptimization(params) {
        loading.value = true;
        stopAnimation();
        try {
            const { data } = await axios.post('/api/optimize', params);
            result.value = data;
            animationStep.value = 0;
        }
        finally {
            loading.value = false;
        }
    }
    const currentPath = () => {
        if (!result.value)
            return [];
        return result.value.path.slice(0, animationStep.value + 1);
    };
    function playAnimation() {
        if (!result.value)
            return;
        isPlaying.value = true;
        playTimer = setInterval(() => {
            if (animationStep.value < (result.value?.path.length || 0) - 1) {
                animationStep.value++;
            }
            else {
                stopAnimation();
            }
        }, 80);
    }
    function pauseAnimation() { stopAnimation(); }
    function stopAnimation() {
        isPlaying.value = false;
        if (playTimer) {
            clearInterval(playTimer);
            playTimer = null;
        }
    }
    function resetAnimation() { stopAnimation(); animationStep.value = 0; }
    function setStep(step) { animationStep.value = step; }
    return {
        loading, result, animationStep, isPlaying, currentPath,
        runOptimization, playAnimation, pauseAnimation, stopAnimation, resetAnimation, setStep
    };
});
