
import * as THREE from 'three';
import {shader9} from "../shaders/about.display.fragment.js";

import {hero_force} from "../shaders/shader.force.fragment.js";
import {hero_gradient_subtract} from "../shaders/about.gradient.subtract.fragment.js";

class FluidSimulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.width = 0;
        this.height = 0;
        this.simRes = 128;

        this.mouse = new THREE.Vector2(0, 0);
        this.lastMouse = new THREE.Vector2(0, 0);
        this.velocity = new THREE.Vector2(0, 0);
        this.scrollOffset = 0;

        this.colorProgress = 0;
        this.spectrumTexture = null;
        this.spectrumCanvas = null;
        this.spectrumCtx = null;

        this.titles = [
            { text: 'ABOUT US', size: '12vw', xOffset: 0, yOffset: 0, weight: 900, opacity: 0.03 },
            { text: 'Tenacity Codex', size: '5vw', xOffset: 0.1, yOffset: 0.15, weight: 700, opacity: 0.02 },
            { text: 'CREATIVE TEAM', size: '14vw', xOffset: -0.05, yOffset: 0.35, weight: 900, opacity: 0.03 }
        ];

        this.init();
    }

    async init() {
        await this.loadSpectrum();
        this.resize();
        this.setupBuffers();
        this.setupShaders();
        this.setupTextMask();
        this.addEventListeners();
        this.animate();
    }

    async loadSpectrum() {
        const loader = new THREE.TextureLoader();
        this.spectrumTexture = await new Promise(resolve => {
            loader.load('colors/download.png', (tex) => {
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                resolve(tex);
            });
        });

        // 为了在 JS 中高效取色，创建一个隐藏的 Canvas 副本
        const img = this.spectrumTexture.image;
        this.spectrumCanvas = document.createElement('canvas');
        this.spectrumCanvas.width = img.width;
        this.spectrumCanvas.height = 1;
        this.spectrumCtx = this.spectrumCanvas.getContext('2d', { willReadFrequently: true });
        this.spectrumCtx.drawImage(img, 0, 0, img.width, 1);
    }

    getSpectrumColor(progress) {
        if (!this.spectrumCtx) return new THREE.Vector3(1, 1, 1);
        const x = Math.floor((progress % 1.0) * this.spectrumCanvas.width);
        const data = this.spectrumCtx.getImageData(x, 0, 1, 1).data;
        return new THREE.Vector3(data[0] / 255, data[1] / 255, data[2] / 255);
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.width = parent.clientWidth;
        this.height = parent.clientHeight;
        this.renderer.setSize(this.width, this.height);

        if (this.displayMat) {
            this.displayMat.uniforms.uTexelSize.value.set(1/this.width, 1/this.height);
        }
        if (this.textElement) {
            this.setupTextMask();
        }
    }

    setupBuffers() {
        const params = {
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter
        };

        this.density = this.createDoubleBuffer(this.simRes, this.simRes, params);
        this.velocityField = this.createDoubleBuffer(this.simRes, this.simRes, params);
        this.pressure = this.createDoubleBuffer(this.simRes, this.simRes, params);
        this.divergence = new THREE.WebGLRenderTarget(this.simRes, this.simRes, params);
    }

    createDoubleBuffer(w, h, params) {
        return {
            read: new THREE.WebGLRenderTarget(w, h, params),
            write: new THREE.WebGLRenderTarget(w, h, params),
            swap: function() {
                const tmp = this.read;
                this.read = this.write;
                this.write = tmp;
            }
        };
    }

    setupShaders() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
        this.scene.add(this.mesh);

        this.baseVertex = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

        // 通用渲染函数
        this.renderQuad = (material, target) => {
            this.mesh.material = material;
            this.renderer.setRenderTarget(target);
            this.renderer.render(this.scene, this.camera);
        };
    }

    setupTextMask() {
        const canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = this.width * dpr;
        canvas.height = this.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 绘制所有标题
        this.titles.forEach(title => {
            ctx.font = `${title.weight} ${title.size} 'Inter', sans-serif`;

            // 计算当前标题的基础位置 + 滚动偏移
            const x = (this.width / 2) + (title.xOffset * this.width) + this.scrollOffset;
            const y = (this.height / 2) + (title.yOffset * this.height);

            // 1. 绘制极低透明度的背景文字（替代原 HTML 标题）
            ctx.fillStyle = `rgba(255, 255, 255, ${title.opacity})`;
            ctx.fillText(title.text.toUpperCase(), x, y);

            // 2. 在另一个层（或通过通道）标记遮罩区域
            // 这里我们直接用纯白绘制，稍后在 Shader 中作为 mask
            // 注意：由于我们需要在同一个 canvas 纹理中区分背景和遮罩，
            // 我们使用 Red 通道作为 mask 强度。
            ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.fillText(title.text.toUpperCase(), x, y);
        });

        if (this.textTexture) this.textTexture.dispose();
        this.textTexture = new THREE.CanvasTexture(canvas);
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.resize());

        // 监听滚动事件更新文字位置
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            // 滚动驱动移动：向右移动
            this.scrollOffset = scrollY * 0.5;
            this.setupTextMask(); // 重新生成遮罩纹理
        });

        const handleMove = (e) => {
            const x = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            const y = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;

            if (x === undefined || y === undefined) return;

            const rect = this.canvas.getBoundingClientRect();
            const newMouseX = (x - rect.left) / rect.width;
            const newMouseY = 1.0 - (y - rect.top) / rect.height;

            this.mouse.set(newMouseX, newMouseY);

            // 计算移动距离以更新色谱进度
            const dist = this.mouse.distanceTo(this.lastMouse);
            if (dist > 0) {
                this.colorProgress += dist * 0.7; // 调节此系数改变色谱切换速度
                this.velocity.subVectors(this.mouse, this.lastMouse);
            }

            this.lastMouse.copy(this.mouse);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchstart', handleMove);
        window.addEventListener('touchmove', handleMove);
    }

// 核心 Shader 逻辑
    getAdvectShader() {
        return new THREE.ShaderMaterial({
            uniforms: {
                uVelocity: { value: null },
                uSource: { value: null },
                dt: { value: 0.016 },
                dissipation: { value: 0.98 },
                texelSize: { value: new THREE.Vector2(1/this.simRes, 1/this.simRes) }
            },
            vertexShader: this.baseVertex,
            fragmentShader: `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uVelocity;
            uniform sampler2D uSource;
            uniform float dt;
            uniform float dissipation;
            uniform vec2 texelSize;
            void main() {
                vec2 pos = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                gl_FragColor = dissipation * texture2D(uSource, pos);
            }
        `
        });
    }

    getDivergenceShader() {
        return new THREE.ShaderMaterial({
            uniforms: {
                uVelocity: { value: null },
                texelSize: { value: new THREE.Vector2(1/this.simRes, 1/this.simRes) }
            },
            vertexShader: this.baseVertex,
            fragmentShader: `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uVelocity;
            uniform vec2 texelSize;
            void main() {
                float L = texture2D(uVelocity, vUv - vec2(texelSize.x, 0.0)).x;
                float R = texture2D(uVelocity, vUv + vec2(texelSize.x, 0.0)).x;
                float T = texture2D(uVelocity, vUv + vec2(0.0, texelSize.y)).y;
                float B = texture2D(uVelocity, vUv - vec2(0.0, texelSize.y)).y;
                float div = 0.5 * (R - L + T - B);
                gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
            }
        `
        });
    }

    getJacobiShader() {
        return new THREE.ShaderMaterial({
            uniforms: {
                uPressure: { value: null },
                uDivergence: { value: null },
                texelSize: { value: new THREE.Vector2(1/this.simRes, 1/this.simRes) }
            },
            vertexShader: this.baseVertex,
            fragmentShader: `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uPressure;
            uniform sampler2D uDivergence;
            uniform vec2 texelSize;
            void main() {
                float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
                float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
                float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
                float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
                float div = texture2D(uDivergence, vUv).x;
                float pressure = (L + R + B + T - div) * 0.25;
                gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
            }
        `
        });
    }

    getGradientSubtractShader() {
        return new THREE.ShaderMaterial({
            uniforms: {
                uPressure: { value: null },
                uVelocity: { value: null },
                texelSize: { value: new THREE.Vector2(1/this.simRes, 1/this.simRes) }
            },
            vertexShader: this.baseVertex,
            fragmentShader: hero_gradient_subtract
        });
    }

    getForceShader() {
        return new THREE.ShaderMaterial({
            uniforms: {
                uSource: { value: null },
                uPoint: { value: new THREE.Vector2() },
                uColor: { value: new THREE.Vector3() },
                uRadius: { value: 0.05 }
            },
            vertexShader: this.baseVertex,
            fragmentShader: hero_force
        });
    }

    getDisplayShader() {
        return new THREE.ShaderMaterial({
            uniforms: {
                uDensity: { value: null },
                uMask: { value: null },
                uTexelSize: { value: new THREE.Vector2(1/this.width, 1/this.height) }
            },
            vertexShader: this.baseVertex,
            fragmentShader: shader9,
            transparent: true
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.advectMat) {
            this.advectMat = this.getAdvectShader();
            this.divergenceMat = this.getDivergenceShader();
            this.jacobiMat = this.getJacobiShader();
            this.gradientSubtractMat = this.getGradientSubtractShader();
            this.forceMat = this.getForceShader();
            this.displayMat = this.getDisplayShader();
        }

        // 1. Advect
        this.advectMat.uniforms.uVelocity.value = this.velocityField.read.texture;
        this.advectMat.uniforms.uSource.value = this.velocityField.read.texture;
        this.advectMat.uniforms.dissipation.value = 1.0; // 增加惯性，让流动持续更久
        this.renderQuad(this.advectMat, this.velocityField.write);
        this.velocityField.swap();

        this.advectMat.uniforms.uSource.value = this.density.read.texture;
        this.advectMat.uniforms.dissipation.value = 0.99; // 墨水扩散更持久
        this.renderQuad(this.advectMat, this.density.write);
        this.density.swap();

        // 2. Add Force
        const time = Date.now() * 20;

        // 始终添加微小的扰动
        this.forceMat.uniforms.uPoint.value.set(
            0.5 + Math.sin(time * 0.3) * 0.4,
            0.5 + Math.cos(time * 0.5) * 0.4
        );
        this.forceMat.uniforms.uSource.value = this.velocityField.read.texture;
        this.forceMat.uniforms.uColor.value.set(Math.sin(time) * 0.02, Math.cos(time) * 0.02, 0);
        this.forceMat.uniforms.uRadius.value = 0.001;
        this.renderQuad(this.forceMat, this.velocityField.write);
        this.velocityField.swap();

        if (this.velocity.length() > 0.0001) {
            const speed = this.velocity.length();
            this.forceMat.uniforms.uPoint.value.copy(this.mouse);

            // Add Velocity (基于鼠标速度增强惯性)
            this.forceMat.uniforms.uSource.value = this.velocityField.read.texture;
            this.forceMat.uniforms.uColor.value.set(this.velocity.x * 80.0, this.velocity.y * 80.0, 0);
            this.forceMat.uniforms.uRadius.value = 0.0005 + speed * 0.5; // 速度越快，影响范围越大
            this.renderQuad(this.forceMat, this.velocityField.write);
            this.velocityField.swap();

            // Add Density (Ink) - 使用色谱取色
            this.forceMat.uniforms.uSource.value = this.density.read.texture;
            const inkColor = this.getSpectrumColor(this.colorProgress);
            this.forceMat.uniforms.uColor.value.copy(inkColor).multiplyScalar(1.5); // 增加初始亮度
            this.forceMat.uniforms.uRadius.value = 0.0002 + speed * 0.05;
            this.renderQuad(this.forceMat, this.density.write);
            this.density.swap();

            this.velocity.multiplyScalar(0.96); // 减缓自身衰减
        }

        // 3. Pressure Solver (Navier-Stokes)
        // Divergence
        this.divergenceMat.uniforms.uVelocity.value = this.velocityField.read.texture;
        this.renderQuad(this.divergenceMat, this.divergence);

        // Jacobi Iterations
        this.jacobiMat.uniforms.uDivergence.value = this.divergence.texture;
        for (let i = 0; i < 40; i++) {
            this.jacobiMat.uniforms.uPressure.value = this.pressure.read.texture;
            this.renderQuad(this.jacobiMat, this.pressure.write);
            this.pressure.swap();
        }

        // Gradient Subtract
        this.gradientSubtractMat.uniforms.uPressure.value = this.pressure.read.texture;
        this.gradientSubtractMat.uniforms.uVelocity.value = this.velocityField.read.texture;
        this.renderQuad(this.gradientSubtractMat, this.velocityField.write);
        this.velocityField.swap();

        // 4. Display
        this.displayMat.uniforms.uDensity.value = this.density.read.texture;
        this.displayMat.uniforms.uMask.value = this.textTexture;
        this.renderQuad(this.displayMat, null);
    }
}

new FluidSimulation('fluid-canvas');

// 鼠标移动背景光效
const orbs = document.querySelectorAll('.experience-orb');
window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;

    orbs.forEach((orb, index) => {
        const factor = (index + 1) * 0.5;
        orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
});