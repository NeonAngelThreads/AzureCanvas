import * as THREE from 'three';
import {shader5} from "../shaders/about.waterfallMat.js";
import {shader6} from "../shaders/about.waterfallMat.fragment.js";
import {shader7} from "../shaders/about.waterfall.fragment.js";
import {shader8} from "../shaders/about.waterfall.pond.fragment.js";

// --- 移植自 portal-logic 的核心渲染逻辑 ---
const PALETTE = [
    new THREE.Color('#E0F7FA'), new THREE.Color('#B2EBF2'),
    new THREE.Color('#81D4FA'), new THREE.Color('#4FC3F7'),
    new THREE.Color('#29B6F6'), new THREE.Color('#0288D1'),
    new THREE.Color('#01579B'), new THREE.Color('#0D47A1')
];

const box = document.getElementById('portal-preview-box');

// 初始化 Three.js 场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const viewSize = 10;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(box.clientWidth, box.clientHeight);
box.appendChild(renderer.domElement);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
camera.position.z = 10;

// 辅助函数：根据当前容器尺寸更新相机
function updateCameraSize(w, h) {
    const aspect = w / h;
    camera.left = -viewSize * aspect;
    camera.right = viewSize * aspect;
    camera.top = viewSize;
    camera.bottom = -viewSize;
    camera.updateProjectionMatrix();
}
updateCameraSize(box.clientWidth, box.clientHeight);

// 1. 主瀑布 Shader
const waterfallMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColors: { value: PALETTE } },
    vertexShader: shader5,
    fragmentShader: shader6,
    transparent: true
});
const waterfall = new THREE.Mesh(new THREE.PlaneGeometry(10, 16), waterfallMat);
scene.add(waterfall);

// 2. 水潭 Shader
const pondMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColors: { value: PALETTE } },
    vertexShader: shader7,
    fragmentShader: shader8,
    transparent: true
});
const pond = new THREE.Mesh(new THREE.PlaneGeometry(24, 6), pondMat);
pond.position.y = -8.0;
scene.add(pond);

// 动画循环
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    waterfallMat.uniforms.uTime.value = elapsed;
    pondMat.uniforms.uTime.value = elapsed;
    renderer.render(scene, camera);
}
animate();

// 点击放大（原位扩展且防黑屏逻辑）
box.addEventListener('click', () => {
    const rect = box.getBoundingClientRect();

    // 关键：先用 set 固定当前位置，切换到 fixed 瞬间不闪烁
    gsap.set(box, {
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        margin: 0,
        zIndex: 9999
    });

    gsap.to(box, {
        duration: 0.7,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        ease: "expo.inOut",
        onStart: () => {
            // 解决切换 fixed 瞬间的渲染同步
            renderer.setSize(window.innerWidth, window.innerHeight);
            updateCameraSize(window.innerWidth, window.innerHeight);
        },
        onUpdate: () => {
            // 动画期间持续更新，确保画面撑满
            renderer.setSize(box.clientWidth, box.clientHeight);
            updateCameraSize(box.clientWidth, box.clientHeight);
        },
        onComplete: () => {
            window.location.href = '../portal/inner-portal.html';
        }
    });
});

window.addEventListener('resize', () => {
    if(box.style.position !== 'fixed') {
        renderer.setSize(box.clientWidth, box.clientHeight);
        updateCameraSize(box.clientWidth, box.clientHeight);
    }
});