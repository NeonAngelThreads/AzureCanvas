export let shader4 = `
                varying vec2 vUv;
                varying float vPos;
                void main() {
                    vUv = uv;
                    vPos = position.y;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;