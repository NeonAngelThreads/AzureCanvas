function updateWires() {
    const svg = document.getElementById('wire-svg');
    const hub = document.querySelector('.github-hub');
    const cards = document.querySelectorAll('.team-card');
    const container = document.querySelector('.github-connector-container');

    if (!svg || !hub || cards.length === 0) return;

    // 清空现有路径
    const existingPaths = svg.querySelectorAll('.wire-path, .energy-pulse');
    existingPaths.forEach(p => p.remove());

    const hubRect = hub.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    // 更新 SVG 的 viewBox
    svg.setAttribute('viewBox', `0 0 ${svgRect.width} ${svgRect.height}`);

    // Hub 的中心点（相对于 SVG）
    const hubX = hubRect.left + hubRect.width / 2 - svgRect.left;
    const hubY = hubRect.top - svgRect.top;

    cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();

        // 卡牌底部中心点（相对于 SVG）
        const startX = cardRect.left + cardRect.width / 2 - svgRect.left;
        const startY = cardRect.bottom - svgRect.top;

        // 创建直角路径
        // 路径逻辑：先向下走一段，再水平走到 Hub 上方，再向下走到 Hub
        const midY = startY + (hubY - startY) * (0.4 + index * 0.1); // 错开高度避免重叠

        const pathD = `M ${startX} ${startY}
                           L ${startX} ${midY}
                           L ${hubX} ${midY}
                           L ${hubX} ${hubY}`;

        // 基础背景线
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('class', 'wire-path');
        svg.appendChild(path);

        // 能量脉冲线
        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pulse.setAttribute('d', pathD);
        pulse.setAttribute('class', 'energy-pulse');
        // 错开动画时间
        pulse.style.animationDelay = `${index * 0.5}s`;
        svg.appendChild(pulse);
    });
}

// 初始化和窗口调整时更新
window.addEventListener('load', updateWires);
window.addEventListener('resize', updateWires);
// 监听滚动，因为某些动画可能会改变元素位置
window.addEventListener('scroll', () => {
    requestAnimationFrame(updateWires);
});

// 初始调用一次
setTimeout(updateWires, 1000);