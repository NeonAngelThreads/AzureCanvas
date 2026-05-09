// Club Grid Expansion Logic
(function () {
    const EXTRA_CLUBS = [
        { id: 8,  emoji: '📷', name: 'Photography Club' },
        { id: 9,  emoji: '🎨', name: 'Art Club' },
        { id: 10, emoji: '♟️', name: 'Board Games Club' },
        { id: 11, emoji: '🤖', name: 'Robotics Club' },
        { id: 12, emoji: '🌱', name: 'Environmental Assoc.' },
        { id: 13, emoji: '📚', name: 'Book Club' },
    ];

    const grid = document.getElementById('clubGrid');
    const moreCell = document.getElementById('clubMoreCell');
    const moreEmblem = document.getElementById('clubMoreEmblem');
    const moreLabel = document.getElementById('clubMoreLabel');
    if (!grid || !moreCell) return;

    let expanded = false;

    moreCell.addEventListener('click', function (e) {
        e.preventDefault();
        if (!expanded) {
            // first click: expand all clubs
            expanded = true;
            // remove the more cell temporarily
            grid.removeChild(moreCell);
            // insert extra clubs
            EXTRA_CLUBS.forEach((c, idx) => {
                const a = document.createElement('a');
                a.className = 'club-cell club-cell-extra';
                a.style.animationDelay = (idx * 40) + 'ms';
                a.href = 'club.html?id=' + c.id;
                a.innerHTML = `<div class="club-emblem">${c.emoji}</div><div class="club-name">${c.name}</div>`;
                grid.appendChild(a);
            });
            // re-add more cell as "Club Overview"
            moreEmblem.textContent = '🏠';
            moreLabel.textContent = 'Club Overview';
            moreCell.href = 'club.html';
            grid.appendChild(moreCell);
        } else {
            // second click: navigate
            window.location.href = 'club.html';
        }
    });
})();