(function () {
    'use strict';

    var DATA = {
        group: [
            { id: 'g1', title: 'Data Structures Course Project', heat: 342, desc: 'Need 3-4 person team for linked list and tree comprehensive project', deadline: '2026-05-20', tags: ['CS','Programming'] },
            { id: 'g2', title: 'Marketing Case Analysis', heat: 289, desc: 'Analyze real enterprise marketing strategy, write report', deadline: '2026-05-18', tags: ['Business','Analysis'] },
            { id: 'g3', title: 'English Speech Contest Prep', heat: 201, desc: 'University-level English speech, need partner for practice', deadline: '2026-05-15', tags: ['English','Speech'] },
            { id: 'g4', title: 'Physics Lab Report Collaboration', heat: 178, desc: 'University physics experiment data analysis and report writing', deadline: '2026-05-25', tags: ['Science','Lab'] }
        ],
        competition: [
            { id: 'c1', title: 'National College Student Mathematical Modeling Contest', heat: 521, desc: 'Three-person team, solve practical mathematical modeling problems, with rich prizes', deadline: '2026-09-01', tags: ['Math','Modeling','Prizes'] },
            { id: 'c2', title: 'Lanqiao Cup Programming Contest', heat: 445, desc: 'Individual or team participation, algorithm and programming skills competition', deadline: '2026-06-15', tags: ['Programming','Algorithm'] },
            { id: 'c3', title: 'Internet+ Innovation & Entrepreneurship Contest', heat: 398, desc: 'Startup project roadshow, university-level selection registration open', deadline: '2026-05-30', tags: ['Entrepreneurship','Innovation'] },
            { id: 'c4', title: 'National English Speech Contest', heat: 267, desc: 'Campus selection, winners represent university in national competition', deadline: '2026-05-10', tags: ['English','Speech'] }
        ],
        internship: [
            { id: 'i1', title: 'Tencent Summer Intern Recruitment', heat: 634, desc: 'Product, technology, operations directions, accommodation subsidy provided', deadline: '2026-05-31', tags: ['Internet','Tech','Summer'] },
            { id: 'i2', title: 'Huawei Campus Recruitment Internship', heat: 589, desc: 'Hardware/software engineer internship, high chance of full-time conversion', deadline: '2026-05-25', tags: ['Hardware','Software'] },
            { id: 'i3', title: 'ByteDance Data Internship', heat: 512, desc: 'Data analysis direction, requires Python/SQL basics', deadline: '2026-05-20', tags: ['Data','Analysis'] },
            { id: 'i4', title: 'Local Government Internship', heat: 234, desc: 'Administrative management direction, gain government experience', deadline: '2026-06-01', tags: ['Government','Admin'] }
        ]
    };

    var SAMPLE_TEAMS = {
        group: [
            { id: 'sg1', name: 'Li Ming · Junior', major: 'Information Engineering, Computer Science', grade: 'Junior', skills: 'Proficient in algorithm design, C++ programming', intro: 'Looking for responsible teammates to complete course project together, relevant experience preferred.' },
            { id: 'sg2', name: 'Wang Fang · Sophomore', major: 'Business School, Marketing', grade: 'Sophomore', skills: 'Proficient in PPT creation, data analysis', intro: 'Looking for classmates with business background to cooperate on case analysis, welcome to contact!' },
            { id: 'sg3', name: 'Zhang Wei · Freshman', major: 'Foreign Languages College, English', grade: 'Freshman', skills: 'Fluent in English speaking, clear logic', intro: 'Preparing for speech contest, need a partner to practice with each other, can arrange 1 hour daily.' }
        ],
        competition: [
            { id: 'sc1', name: 'Chen Hao · Junior', major: 'Mathematics College, Applied Mathematics', grade: 'Junior', skills: 'Experienced in mathematical modeling, familiar with MATLAB', intro: 'Participated in provincial modeling competition, looking for teammates with strong programming skills to compete for national awards.' },
            { id: 'sc2', name: 'Liu Yang · Sophomore', major: 'Computer College, Software Engineering', grade: 'Sophomore', skills: 'Algorithm competition experience, LeetCode 1800+', intro: 'Preparing for Lanqiao Cup, looking for like-minded teammates to practice coding together.' },
            { id: 'sc3', name: 'Zhao Min · Junior', major: 'Entrepreneurship College, Business Administration', grade: 'Junior', skills: 'Business plan writing, roadshow experience', intro: 'Internet+ project already has initial plan, need technical direction teammate to join.' }
        ],
        internship: [
            { id: 'si1', name: 'Sun Lei · Junior', major: 'Computer College, Artificial Intelligence', grade: 'Junior', skills: 'Python/Java development, project experience', intro: 'Preparing for Tencent internship interview, looking for partners to refer each other and conduct mock interviews.' },
            { id: 'si2', name: 'Zhou Ting · Senior', major: 'Electronic Engineering College, Communication Engineering', grade: 'Senior', skills: 'Embedded development, hardware debugging', intro: 'Huawei internship intention, have relevant experience, welcome to prepare for written test together.' },
            { id: 'si3', name: 'Wu Jie · Graduate', major: 'Data Science College, Statistics', grade: 'Graduate', skills: 'Python/SQL/Data visualization', intro: 'ByteDance data internship preparation, looking for classmates to practice SQL questions and case analysis together.' }
        ]
    };

    var currentTab = 'group';
    var currentItemTitle = '';

    // Night mode
    function applyNightMode() {
        var on = localStorage.getItem('th_night_mode') === '1';
        document.body.classList.toggle('night-mode', on);
        var icon = document.querySelector('#nightToggle i');
        if (icon) icon.className = on ? 'fas fa-sun' : 'fas fa-moon';
    }

    document.getElementById('nightToggle').addEventListener('click', function () {
        var on = localStorage.getItem('th_night_mode') === '1';
        localStorage.setItem('th_night_mode', on ? '0' : '1');
        applyNightMode();
    });

    applyNightMode();

    // Tabs
    function activateTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.practice-tab').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        document.querySelectorAll('.tab-panel').forEach(function (panel) {
            panel.classList.toggle('active', panel.id === 'panel-' + tab);
        });
        renderRecruitSquare(tab);
    }

    document.querySelectorAll('.practice-tab').forEach(function (btn) {
        btn.addEventListener('click', function () { activateTab(btn.dataset.tab); });
    });

    // Escape HTML
    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Render item lists
    function renderList(tab) {
        var container = document.getElementById('list-' + tab);
        container.innerHTML = '';
        DATA[tab].forEach(function (item) {
            var card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML =
                '<div class="item-card-header">' +
                '<span class="item-title">' + esc(item.title) + '</span>' +
                '<span class="heat-badge">🔥 ' + item.heat + '</span>' +
                '</div>' +
                '<div class="item-tags">' +
                item.tags.map(function (t) { return '<span class="tag-chip">' + esc(t) + '</span>'; }).join('') +
                '</div>' +
                '<div class="item-desc">' + esc(item.desc) + '</div>' +
                '<div class="item-footer">' +
                '<span class="deadline-label"><i class="fas fa-calendar-alt"></i> Deadline ' + esc(item.deadline) + '</span>' +
                '<button class="btn btn-primary btn-sm" data-title="' + esc(item.title) + '">Find Teammates</button>' +
                '</div>';
            container.appendChild(card);
        });

        container.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-title]');
            if (btn) openModal(btn.dataset.title);
        });
    }

    // Render recruit square
    function renderRecruitSquare(tab) {
        var container = document.getElementById('recruit-' + tab);
        var stored = getStoredTeams(tab);
        if (stored.length === 0) { container.innerHTML = ''; return; }

        var html = '<div class="recruit-square"><div class="recruit-square-title"><i class="fas fa-users"></i> Recruitment Square</div>';

        stored.forEach(function (team) { html += buildTeamCard(team, true); });
        SAMPLE_TEAMS[tab].forEach(function (team) { html += buildTeamCard(team, false); });

        html += '</div>';
        container.innerHTML = html;

        container.querySelectorAll('[data-apply-id]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = btn.dataset.applyId;
                localStorage.setItem('practice_applied_' + id, '1');
                btn.parentElement.innerHTML = '<span class="applied-label">Application Sent ✓</span>';
            });
        });
    }

    function buildTeamCard(team, isMine) {
        var applied = !isMine && localStorage.getItem('practice_applied_' + team.id) === '1';
        var action = isMine
            ? '<button class="btn btn-sm" onclick="alert(\'Management feature in development\')">Manage</button>'
            : (applied
                ? '<span class="applied-label">Application Sent ✓</span>'
                : '<button class="btn btn-primary btn-sm" data-apply-id="' + esc(team.id) + '">Apply</button>');
        return '<div class="team-card">' +
            '<div class="team-card-header">' +
            '<span class="team-card-name">' + esc(team.name || (team.major + ' · ' + team.grade)) + '</span>' +
            '<span class="team-card-badge' + (isMine ? ' mine' : '') + '">' + (isMine ? 'My Team · Leader' : 'Recruiting') + '</span>' +
            '</div>' +
            '<div class="team-card-meta"><i class="fas fa-graduation-cap"></i> ' + esc(team.major) + ' &nbsp;|&nbsp; ' + esc(team.grade) + '</div>' +
            (team.skills ? '<div class="team-card-skills"><i class="fas fa-star"></i> ' + esc(team.skills) + '</div>' : '') +
            '<div class="team-card-intro">' + esc(team.intro) + '</div>' +
            '<div>' + action + '</div>' +
            '</div>';
    }

    // Modal
    function openModal(title) {
        currentItemTitle = title;
        document.getElementById('modalTitle').textContent = 'Find Teammates - ' + title;
        document.getElementById('recruitForm').reset();
        document.getElementById('recruitModal').classList.add('open');
    }

    function closeModal() {
        document.getElementById('recruitModal').classList.remove('open');
    }

    document.getElementById('modalCancel').addEventListener('click', closeModal);
    document.getElementById('recruitModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    document.getElementById('recruitForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var major = document.getElementById('fieldMajor').value.trim();
        var grade = document.getElementById('fieldGrade').value;
        var skills = document.getElementById('fieldSkills').value.trim();
        var intro = document.getElementById('fieldIntro').value.trim();

        if (!major) { document.getElementById('fieldMajor').focus(); return; }

        var team = {
            id: 'user_' + Date.now(),
            name: major + ' · ' + grade,
            major: major,
            grade: grade,
            skills: skills,
            intro: intro || '暂无介绍'
        };

        var teams = getStoredTeams(currentTab);
        teams.unshift(team);
        localStorage.setItem('practice_teams_' + currentTab, JSON.stringify(teams));

        closeModal();
        renderRecruitSquare(currentTab);

        var panel = document.getElementById('panel-' + currentTab);
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // LocalStorage helpers
    function getStoredTeams(tab) {
        try { return JSON.parse(localStorage.getItem('practice_teams_' + tab) || '[]'); }
        catch (e) { return []; }
    }

    // Init
    ['group', 'competition', 'internship'].forEach(function (tab) { renderList(tab); });

    var params = new URLSearchParams(window.location.search);
    var tabParam = params.get('tab');
    var defaultTab = ['group', 'competition', 'internship'].indexOf(tabParam) !== -1 ? tabParam : 'group';
    activateTab(defaultTab);

})();