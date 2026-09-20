/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import ControlPanel from './components/ControlPanel.vue';
import ContourPlot from './components/ContourPlot.vue';
import Surface3D from './components/Surface3D.vue';
import ConvergenceChart from './components/ConvergenceChart.vue';
import { useOptimizationStore } from './store/optimization';
const store = useOptimizationStore();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "app-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "app-main" },
});
/** @type {[typeof ControlPanel, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ControlPanel, new ControlPanel({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
if (__VLS_ctx.store.result) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "vis-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "vis-item" },
    });
    /** @type {[typeof ContourPlot, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(ContourPlot, new ContourPlot({}));
    const __VLS_4 = __VLS_3({}, ...__VLS_functionalComponentArgsRest(__VLS_3));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "vis-item" },
    });
    /** @type {[typeof Surface3D, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(Surface3D, new Surface3D({}));
    const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
}
if (__VLS_ctx.store.result) {
    /** @type {[typeof ConvergenceChart, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(ConvergenceChart, new ConvergenceChart({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
/** @type {__VLS_StyleScopedClasses['app-container']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['app-main']} */ ;
/** @type {__VLS_StyleScopedClasses['vis-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['vis-item']} */ ;
/** @type {__VLS_StyleScopedClasses['vis-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ControlPanel: ControlPanel,
            ContourPlot: ContourPlot,
            Surface3D: Surface3D,
            ConvergenceChart: ConvergenceChart,
            store: store,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
