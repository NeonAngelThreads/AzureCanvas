export let shader3 = `
                uniform float uScroll;
                uniform vec3 uColorStart;
                uniform vec3 uColorEnd;
                varying vec2 vUv;
                varying float vPos;
                void main() {
                    float gradient = smoothstep(10.0, -15.0, vPos);
                    vec3 color = mix(uColorStart, uColorEnd, gradient);
                    float alpha = smoothstep(uScroll * -25.0 + 10.0, uScroll * -25.0 + 8.0, vPos);
                    gl_FragColor = vec4(color, alpha);
                }
            `;