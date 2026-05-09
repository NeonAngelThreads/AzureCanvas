export let hero_force = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uSource;
            uniform vec2 uPoint;
            uniform vec3 uColor;
            uniform float uRadius;
            void main() {
                float d = distance(vUv, uPoint);
                float f = exp(-d * d / uRadius);
                vec4 base = texture2D(uSource, vUv);
                gl_FragColor = vec4(base.rgb + f * uColor, 1.0);
            }
        `;