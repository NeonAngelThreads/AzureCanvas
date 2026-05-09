gsap.registerPlugin(ScrollTrigger);

// 关于我们文字消失动画
gsap.to("#about-us-title", {
    scrollTrigger: {
        trigger: ".top-spacer",
        start: "top top",
        end: "100px top",
        scrub: true,
    },
    opacity: 0,
    ease: "none"
});

// 螺线描边逻辑
const path = document.querySelector('#spiralPath');
const pathLength = path.getTotalLength();
path.style.strokeDasharray = pathLength;
path.style.strokeDashoffset = pathLength;

const scrollProgressToDrawProgress = (scrollProgress) => {
    // 修改了阈值，使动画在更短的滚动距离内完成
    if (scrollProgress < 0.2) return scrollProgress / 0.2 * 0.3; // 前 20% 滚动完成 30% 路径
    if (scrollProgress < 0.4) return 0.3 + (scrollProgress - 0.2) / 0.2 * 0.6; // 再 20% 滚动完成剩下 60%
    return 0.9 + (scrollProgress - 0.4) / 0.6 * 0.1; // 最后 60% 滚动只处理收尾
};

ScrollTrigger.create({
    trigger: ".canvas-container",
    start: "top 60%",
    end: "bottom 20%",
    scrub: 0.5,
    onUpdate: (self) => {
        const drawProgress = scrollProgressToDrawProgress(self.progress);
        const drawLength = drawProgress * pathLength;
        path.style.strokeDashoffset = pathLength - drawLength;

        // 静态需求，移除此处的标题动态控制逻辑
        /*
        const titles = document.querySelectorAll('.spiral-title');
        const progress = self.progress;
        ...
        */
    }
});

// --- 团队卡牌交互逻辑 ---
const teamCards = document.querySelectorAll('.team-card');
const overlay = document.getElementById('transition-overlay');

teamCards.forEach(card => {
    card.addEventListener('click', () => {
        const rect = card.getBoundingClientRect();
        const githubUrl = card.dataset.github;

        // 克隆一个卡牌用于动画，避免破坏原布局
        const clone = card.cloneNode(true);
        document.body.appendChild(clone);

        // 设置克隆卡牌的初始位置
        gsap.set(clone, {
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            margin: 0,
            zIndex: 10001,
            transformPerspective: 1000
        });

        // 隐藏原卡牌
        card.style.visibility = 'hidden';

        // 播放 3D 飞入动画
        const tl = gsap.timeline({
            onComplete: () => {
                window.location.href = githubUrl;
            }
        });

        tl.to(clone, {
            duration: 1.2,
            top: '50%',
            left: '50%',
            xPercent: -50,
            yPercent: -50,
            width: '60vh',
            height: '85vh',
            rotationY: 720,
            rotationX: 0,
            scale: 1,
            ease: "expo.inOut"
        });

        tl.to(overlay, {
            duration: 0.8,
            opacity: 1,
            ease: "power2.in"
        }, "-=0.6"); // 与飞入动画重叠
    });
});