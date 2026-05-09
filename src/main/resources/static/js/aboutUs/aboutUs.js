import * as THREE from 'three';
import {shader1} from "../shaders/about.particle.vertex.js";
import {shader2} from "../shaders/about.particle.fragement.js";
import {shader3} from "../shaders/about.spiral.vertex.js";
import {shader4} from "../shaders/about.spiral.frangment.js";

// --- 配置与数据 ---


class ImmersiveAbout {
    constructor() {
        this.container = document.getElementById('webgl-container');
        this.overlay = document.getElementById('transition-overlay');
        this.isTransitioning = false;
        this.initLenis();
        this.initThree();
        this.addLights();
        this.createSpiral();
        this.createCards();
        this.createParticles();
        this.initEvents();
        this.animate();
    }

    initLenis() {
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        this.lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 10;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
    }

    createSpiral() {
        const points = [];
        for (let i = 0; i < 500; i++) {
            const angle = 0.1 * i;
            const x = (1 + angle) * Math.cos(angle) * 0.2;
            const y = -i * 0.05 + 10;
            const z = (1 + angle) * Math.sin(angle) * 0.2;
            points.push(new THREE.Vector3(x, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 200, 0.05, 8, false);
        
        this.spiralMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uScroll: { value: 0 },
                uColorStart: { value: new THREE.Color('#FF6A00') },
                uColorEnd: { value: new THREE.Color('#00CFFF') }
            },
            vertexShader: shader4,
            fragmentShader: shader3,
            transparent: true
        });

        this.spiral = new THREE.Mesh(geometry, this.spiralMaterial);
        this.scene.add(this.spiral);

        // 同步滚动到 Shader
        gsap.to(this.spiralMaterial.uniforms.uScroll, {
            scrollTrigger: {
                trigger: ".scroll-spacer",
                start: "top top",
                end: "bottom bottom",
                scrub: true
            },
            value: 1
        });
    }

    createParticles() {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

            const color = new THREE.Color(Math.random() > 0.5 ? '#FF00FF' : '#00FFFF');
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 2;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 }
            },
            vertexShader: shader1,
            fragmentShader: shader2,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    initEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // 鼠标交互
        this.mouse = new THREE.Vector2();
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // 点击卡牌交互
        const raycaster = new THREE.Raycaster();
        window.addEventListener('click', (e) => {
            if (this.isTransitioning) return;

            raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.cards);

            if (intersects.length > 0) {
                const selectedCard = intersects[0].object;
                this.handleCardClick(selectedCard);
            }
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const time = performance.now() * 0.001;
        if (this.spiralMaterial) this.spiralMaterial.uniforms.uTime.value = time;
        if (this.particles) this.particles.material.uniforms.uTime.value = time;

        // 相机轻微跟随鼠标
        this.camera.position.x += (this.mouse.x * 2 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouse.y * 2 - this.camera.position.y) * 0.05;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// 启动
new ImmersiveAbout();
