/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, watch, onMounted } from 'vue';
import { useOptimizationStore } from '../store/optimization';
const store = useOptimizationStore();
const cvs = ref();
function draw() {
    const c = cvs.value;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    // Fill background
    ctx.fillStyle = '#0a1929';
    ctx.fillRect(0, 0, W, H);
    const path = store.result?.path || [];
    if (path.length === 0)
        return;
    // Find ranges
    const xs = path.map(p => p.x), ys = path.map(p => p.y);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const padX = (xMax - xMin) * 0.2 || 1;
    const padY = (yMax - yMin) * 0.2 || 1;
    const rx = xMin - padX, ry = yMin - padY, rw = xMax - xMin + 2 * padX, rh = yMax - yMin + 2 * padY;
    const tx = (v) => ((v - rx) / rw) * W;
    const ty = (v) => H - ((v - ry) / rh) * H;
    // Draw contour-like grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
        const x = i / 10 * W;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
        const y = i / 10 * H;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }
    // Draw heatmap-style fill based on z values
    const zs = path.map(p => p.z);
    const zMin = Math.min(...zs), zMax = Math.max(...zs);
    const zr = zMax - zMin || 1;
    for (const pt of path) {
        const t = (pt.z - zMin) / zr;
        const px = tx(pt.x), py = ty(pt.y);
        // blend: red (high) → blue (low)
        const r = Math.round(255 * t), b = Math.round(255 * (1 - t)), g = Math.round(128 * (1 - Math.abs(t - 0.5) * 2));
        ctx.fillStyle = `rgba(${r},${g},${b},0.3)`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
    // Draw path line
    const animPath = store.currentPath();
    if (animPath.length > 1) {
        ctx.strokeStyle = 'rgba(0, 255, 200, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx(animPath[0].x), ty(animPath[0].y));
        for (let i = 1; i < animPath.length; i++)
            ctx.lineTo(tx(animPath[i].x), ty(animPath[i].y));
        ctx.stroke();
    }
    // Start point
    ctx.fillStyle = '#4fc3f7';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tx(path[0].x), ty(path[0].y), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Current point
    const cur = animPath[animPath.length - 1];
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.arc(tx(cur.x), ty(cur.y), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Final point
    const last = path[path.length - 1];
    ctx.fillStyle = '#ef5350';
    ctx.beginPath();
    ctx.arc(tx(last.x), ty(last.y), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Labels
    ctx.fillStyle = '#aaa';
    ctx.font = '11px system-ui';
    ctx.fillText(`x: ${cur.x.toFixed(3)}`, 10, 20);
    ctx.fillText(`y: ${cur.y.toFixed(3)}`, 10, 36);
    ctx.fillText(`f: ${cur.z.toFixed(4)}`, 10, 52);
}
onMounted(draw);
watch(() => [store.result, store.animationStep], draw, { deep: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    ref: "cvs",
    width: "400",
    height: "400",
    ...{ class: "contour-canvas" },
});
/** @type {typeof __VLS_ctx.cvs} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info" },
});
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['contour-canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            cvs: cvs,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
