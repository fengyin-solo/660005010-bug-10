/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useOptimizationStore } from '../store/optimization';
const store = useOptimizationStore();
const container = ref();
let scene, camera, renderer, controls, animId;
const surfaceGroup = new THREE.Group();
const pathGroup = new THREE.Group();
let resizeObserver = null;
// 释放 group 下所有渲染对象占用的 GPU 资源，避免每步重建后显存持续堆积
function disposeGroup(group) {
    group.traverse(obj => {
        const anyObj = obj;
        const geometry = anyObj.geometry;
        if (geometry)
            geometry.dispose();
        const material = anyObj.material;
        if (material) {
            if (Array.isArray(material))
                material.forEach(m => m.dispose());
            else
                material.dispose();
        }
    });
    group.clear();
}
function initScene() {
    const c = container.value;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    camera = new THREE.PerspectiveCamera(45, c.clientWidth / c.clientHeight, 0.1, 50);
    camera.position.set(4, 4, 5);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(c.clientWidth, c.clientHeight);
    c.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(new THREE.AmbientLight(0x404060, 1.5));
    const dl = new THREE.DirectionalLight(0xffffff, 1);
    dl.position.set(3, 4, 3);
    scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0x6688cc, 0.4);
    dl2.position.set(-3, -2, -2);
    scene.add(dl2);
    scene.add(surfaceGroup);
    scene.add(pathGroup);
}
// 曲面点云只依赖完整 path，整个优化过程中构建一次即可
function buildSurface() {
    disposeGroup(surfaceGroup);
    const path = store.result?.path || [];
    if (!path.length)
        return;
    const xs = path.map(p => p.x), ys = path.map(p => p.y), zs = path.map(p => p.z);
    const xMin = Math.min(...xs), xMax = Math.max(...xs), yMin = Math.min(...ys), yMax = Math.max(...ys);
    const zMin = Math.min(...zs), zMax = Math.max(...zs);
    const px = xMax - xMin || 1, py = yMax - yMin || 1, pz = zMax - zMin || 1;
    const scale = 3;
    const map = (x) => ((x - xMin) / px - 0.5) * scale;
    const mapy = (y) => ((y - yMin) / py - 0.5) * scale;
    const mapz = (z) => ((z - zMin) / pz) * 2;
    // Surface points as scattered dots
    const geom = new THREE.BufferGeometry();
    const positions = [], colors = [];
    for (const pt of path) {
        positions.push(map(pt.x), mapz(pt.z), mapy(pt.y));
        const t = (pt.z - zMin) / pz;
        colors.push(t, 0.3 * (1 - t), 1 - t);
    }
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false });
    surfaceGroup.add(new THREE.Points(geom, mat));
    // 坐标映射后续动画轨迹也要用，构建一次轨迹时直接复用
    pathMappers = { map, mapy, mapz };
    buildPath();
}
let pathMappers = null;
// 轨迹线和起/当前/终点标记随动画步进更新，旧对象必须释放
function buildPath() {
    disposeGroup(pathGroup);
    const path = store.result?.path || [];
    if (!path.length || !pathMappers)
        return;
    const { map, mapy, mapz } = pathMappers;
    // Path line
    const animPath = store.currentPath();
    if (animPath.length > 1) {
        const lineGeom = new THREE.BufferGeometry();
        const pts = [];
        for (const pt of animPath)
            pts.push(map(pt.x), mapz(pt.z), mapy(pt.y));
        lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        pathGroup.add(new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: 0x00ffcc })));
    }
    // Start/current/end markers
    const marker = (x, y, z, color, size = 0.12) => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.5 }));
        s.position.set(x, z, y);
        pathGroup.add(s);
    };
    const first = path[0];
    marker(map(first.x), mapy(first.y), mapz(first.z), 0x4fc3f7, 0.14);
    const cur = animPath[animPath.length - 1];
    marker(map(cur.x), mapy(cur.y), mapz(cur.z), 0x66bb6a, 0.12);
    const last = path[path.length - 1];
    marker(map(last.x), mapy(last.y), mapz(last.z), 0xef5350, 0.14);
}
function resize() {
    const c = container.value;
    if (!c || !renderer || c.clientWidth === 0 || c.clientHeight === 0)
        return;
    camera.aspect = c.clientWidth / c.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(c.clientWidth, c.clientHeight);
}
function animate() { animId = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
onMounted(() => {
    initScene();
    buildSurface();
    animate();
    // 监听容器自身尺寸（窗口缩放、栅格布局变化、初次布局完成都会触发）
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container.value);
    resize();
});
// 曲面点云只在新结果到来时重建
watch(() => store.result, buildSurface);
// 轨迹只在动画步进时重建
watch(() => store.animationStep, buildPath);
onUnmounted(() => {
    cancelAnimationFrame(animId);
    resizeObserver?.disconnect();
    disposeGroup(surfaceGroup);
    disposeGroup(pathGroup);
    controls?.dispose();
    renderer?.dispose();
    if (renderer?.domElement.parentElement)
        renderer.domElement.parentElement.removeChild(renderer.domElement);
});
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "container",
    ...{ class: "viewer3d" },
});
/** @type {typeof __VLS_ctx.container} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['viewer3d']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            container: container,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
