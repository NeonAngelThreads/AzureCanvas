export let hero_gradient_subtract = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uPressure;
            uniform sampler2D uVelocity;
            uniform vec2 texelSize;
            void main() {
                float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
                float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
                float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
                float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
                vec2 velocity = texture2D(uVelocity, vUv).xy;
                velocity -= 0.5 * vec2(R - L, T - B);
                gl_FragColor = vec4(velocity, 0.0, 1.0);
            }
        `;