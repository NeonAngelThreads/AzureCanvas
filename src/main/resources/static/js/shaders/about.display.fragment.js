export let shader9 = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uDensity;
            uniform sampler2D uMask;
            uniform vec2 uTexelSize;

            void main() {
                vec4 d = texture2D(uDensity, vUv);
                vec4 maskTex = texture2D(uMask, vUv);
                float mask = maskTex.r; // 我们在 setupTextMask 中绘制的是白色，r=1.0

                // 绘制背景文字：我们通过 maskTex 的 alpha 或者颜色值来决定
                // 因为我们在 Canvas 里绘制了低透明度的背景，它在 maskTex 中也存在
                // 这里我们简单地用一个底色叠加
                vec3 bgTextColor = vec3(1.0) * 0.03; // 对应 0.03 的 opacity

                // 边缘检测
                float m_l = texture2D(uMask, vUv - vec2(uTexelSize.x * 2.0, 0.0)).r;
                float m_r = texture2D(uMask, vUv + vec2(uTexelSize.x * 2.0, 0.0)).r;
                float m_t = texture2D(uMask, vUv + vec2(0.0, uTexelSize.y * 2.0)).r;
                float m_b = texture2D(uMask, vUv - vec2(0.0, uTexelSize.y * 2.0)).r;

                float edge = (1.0 - m_l) + (1.0 - m_r) + (1.0 - m_t) + (1.0 - m_b);
                edge = smoothstep(0.0, 1.0, edge * mask);

                float m = length(d.rgb);
                vec3 finalColor = d.rgb;

                float glow = m * edge * 2.5;
                finalColor += glow * finalColor;
                finalColor *= 1.2;

                float alpha = smoothstep(0.005, 0.15, m) * mask;

                // 最终颜色：背景文字 + 流体墨水
                vec3 outputColor = mix(bgTextColor * mask, finalColor, alpha);
                float finalAlpha = max(mask * 0.03, alpha);

                gl_FragColor = vec4(outputColor, finalAlpha);
            }
        `;