export let shader2 = `
                varying vec3 vColor;
                void main() {
                    float d = distance(gl_PointCoord, vec2(0.5));
                    if (d > 0.5) discard;
                    gl_FragColor = vec4(vColor, 1.0 - d * 2.0);
                }
            `;