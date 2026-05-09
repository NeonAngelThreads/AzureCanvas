export let shader1 = `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float uTime;
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    pos.y += sin(uTime * 0.5 + pos.x) * 0.5;
                    pos.x += cos(uTime * 0.5 + pos.y) * 0.5;
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `;