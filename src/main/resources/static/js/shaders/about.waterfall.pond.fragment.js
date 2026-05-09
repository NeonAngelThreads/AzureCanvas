export let shader8 = `
            uniform float uTime; uniform vec3 uColors[8]; varying vec2 vUv;
            float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 4358.5453); }
            void main() {
                vec2 uv = floor(vUv * vec2(120.0, 60.0)) / vec2(120.0, 60.0);
                float rowId = floor(vUv.y * 30.0);
                float rowOffset = hash(vec2(rowId, 0.0));
                float breathing = 0.4 + 0.6 * (0.5 + 0.5 * sin(uTime * 2.5 + rowOffset * 15.0));
                gl_FragColor = vec4(uColors[7], smoothstep(0.0, 0.2, vUv.y) * 0.7 * breathing);
            }
        `;