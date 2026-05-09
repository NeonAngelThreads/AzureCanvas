export let shader6 = `
            uniform float uTime; uniform vec3 uColors[8]; varying vec2 vUv;
            float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 4358.5453); }
            void main() {
                vec2 uv = floor(vUv * vec2(66.0, 96.0)) / vec2(66.0, 96.0);
                float flow = uv.y + uTime * 3.5;
                float lines = sin(uv.x * 30.0 + uTime * 2.0) * 0.1 + sin(uv.x * 60.0 - uTime * 1.5) * 0.1;
                float colorValue = (uv.x + lines + hash(vec2(uv.x, floor(flow * 12.0))) * 0.2);
                int colorIndex = int(clamp(floor(colorValue * 8.0), 0.0, 7.0));
                vec3 color = uColors[colorIndex];
                if (step(0.92, hash(vec2(uv.x, floor(flow * 15.0)))) > 0.5) color = mix(color, vec3(1.0), 0.6);
                float shape = 1.0 - pow(abs(vUv.x - 0.5) * 2.0, 4.0);
                gl_FragColor = vec4(color, shape * smoothstep(1.0, 0.95, vUv.y));
            }
        `;