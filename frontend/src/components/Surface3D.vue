<template>
  <div class="panel">
    <h3>🏔️ 3D函数曲面 + 优化轨迹</h3>
    <div ref="container" class="viewer3d"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useOptimizationStore } from '../store/optimization'

const store = useOptimizationStore()
const container = ref<HTMLDivElement>()
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: OrbitControls, animId: number
let resizeObserver: ResizeObserver | null = null
const surfaceGroup = new THREE.Group(), pathGroup = new THREE.Group()

function initScene() {
  const c = container.value!; scene = new THREE.Scene(); scene.background = new THREE.Color(0x111827)
  camera = new THREE.PerspectiveCamera(45, c.clientWidth/c.clientHeight, 0.1, 50); camera.position.set(4, 4, 5)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(c.clientWidth, c.clientHeight)
  c.appendChild(renderer.domElement)
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true
  scene.add(new THREE.AmbientLight(0x404060, 1.5))
  const dl = new THREE.DirectionalLight(0xffffff, 1); dl.position.set(3, 4, 3); scene.add(dl)
  const dl2 = new THREE.DirectionalLight(0x6688cc, 0.4); dl2.position.set(-3, -2, -2); scene.add(dl2)
  scene.add(surfaceGroup); scene.add(pathGroup)
}

// 释放组内所有对象的几何体与材质，避免 GPU 资源残留
function disposeGroup(group: THREE.Group) {
  group.traverse(obj => {
    const mesh = obj as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const mat = mesh.material
    if (Array.isArray(mat)) mat.forEach(m => m.dispose())
    else if (mat) mat.dispose()
  })
  group.clear()
}

// 坐标映射只依赖优化结果，与播放步数无关
function getMapping() {
  const path = store.result?.path || []
  if (!path.length) return null
  const xs = path.map(p => p.x), ys = path.map(p => p.y), zs = path.map(p => p.z)
  const xMin = Math.min(...xs), xMax = Math.max(...xs), yMin = Math.min(...ys), yMax = Math.max(...ys)
  const zMin = Math.min(...zs), zMax = Math.max(...zs)
  const px = xMax - xMin || 1, py = yMax - yMin || 1, pz = zMax - zMin || 1
  const scale = 3
  return {
    path, zMin, pz,
    mapx: (x: number) => ((x - xMin) / px - 0.5) * scale,
    mapy: (y: number) => ((y - yMin) / py - 0.5) * scale,
    mapz: (z: number) => ((z - zMin) / pz) * 2
  }
}

// 曲面点云：仅在优化结果变化时重建
function buildSurface() {
  disposeGroup(surfaceGroup)
  const m = getMapping(); if (!m) return
  const geom = new THREE.BufferGeometry()
  const positions: number[] = [], colors: number[] = []
  for (const pt of m.path) {
    positions.push(m.mapx(pt.x), m.mapz(pt.z), m.mapy(pt.y))
    const t = (pt.z - m.zMin) / m.pz
    colors.push(t, 0.3 * (1 - t), 1 - t)
  }
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false })
  surfaceGroup.add(new THREE.Points(geom, mat))
}

// 轨迹线与标记点：随播放步数更新，旧对象先释放再重建
function buildPath() {
  disposeGroup(pathGroup)
  const m = getMapping(); if (!m) return
  const animPath = store.currentPath()
  if (animPath.length > 1) {
    const lineGeom = new THREE.BufferGeometry()
    const pts: number[] = []
    for (const pt of animPath) pts.push(m.mapx(pt.x), m.mapz(pt.z), m.mapy(pt.y))
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    pathGroup.add(new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: 0x00ffcc, linewidth: 1 })))
  }
  const marker = (x: number, y: number, z: number, color: number, size = 0.12) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.5 }))
    s.position.set(x, z, y); pathGroup.add(s)
  }
  const first = m.path[0]; marker(m.mapx(first.x), m.mapy(first.y), m.mapz(first.z), 0x4fc3f7, 0.14)
  const cur = animPath[animPath.length - 1]; marker(m.mapx(cur.x), m.mapy(cur.y), m.mapz(cur.z), 0x66bb6a, 0.12)
  const last = m.path[m.path.length - 1]; marker(m.mapx(last.x), m.mapy(last.y), m.mapz(last.z), 0xef5350, 0.14)
}

// 容器尺寸变化时同步相机宽高比与渲染尺寸
function handleResize() {
  const c = container.value
  if (!c || !renderer) return
  const w = c.clientWidth, h = c.clientHeight
  if (!w || !h) return
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function animate() { animId = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera) }

onMounted(() => {
  initScene()
  buildSurface(); buildPath()
  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(container.value!)
  handleResize()
  animate()
})
watch(() => store.result, () => { buildSurface(); buildPath() })
watch(() => store.animationStep, buildPath)
onUnmounted(() => {
  cancelAnimationFrame(animId)
  resizeObserver?.disconnect()
  disposeGroup(surfaceGroup); disposeGroup(pathGroup)
  controls?.dispose()
  renderer?.dispose()
  renderer?.domElement?.remove()
})
</script>

<style scoped>
.panel { background:#fff; border-radius:8px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,.06) }
.panel h3 { margin-bottom:8px; color:#333; font-size:14px }
.viewer3d { width:100%; height:360px; border-radius:8px; overflow:hidden; border:1px solid #eee }
</style>
