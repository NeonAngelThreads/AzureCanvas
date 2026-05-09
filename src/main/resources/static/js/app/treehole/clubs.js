const CLUBS = [
    {
        id:0, name:'Student Union', emoji:'🏛️',
        desc:'The Student Union is the highest student self-governing organization in the university, responsible for coordinating various student club activities, safeguarding student rights, and organizing campus cultural activities. It hosts large-scale events such as welcome parties, graduation parties, and sports meets every year, providing an important stage for students to showcase themselves.',
        leader:{name:'Mingyuan Zhang', grade:'Junior', dept:'Computer Science College'},
        members:['Li','Wang','Chen','Liu','Zhao','Sun','Zhou','Wu','Zheng','Feng'],
        memberCount:120,
        activities:[
            {id:1,title:'May Fourth Youth Day Art Performance',date:'2026-05-04',time:'19:00',location:'Grand Auditorium',desc:'Celebrating May Fourth Youth Day, showcasing youth elegance',spots:200,booked:156},
            {id:2,title:'Student Representative Assembly',date:'2026-05-15',time:'14:00',location:'Administration Building Lecture Hall',desc:'Discussing student rights-related topics',spots:100,booked:88},
        ],
        chatMsgs:[
            {from:'Mingyuan Zhang',text:'Hello everyone, welcome to the Student Union chat room!',mine:false},
            {from:'Xiaoyan Wang',text:'Has the program list for the May Fourth evening party been released?',mine:false},
            {from:'Zhiyuan Chen',text:'Still rehearsing, will be announced next week!',mine:false},
        ]
    },
    {
        id:1, name:'Badminton Club', emoji:'🏸',
        desc:'Founded in 2010, the Badminton Club is one of the most active sports clubs in the university. It regularly hosts campus leagues and welcomes players of all levels to join and enjoy the fun of badminton.',
        leader:{name:'Xiaofeng Lin', grade:'Sophomore', dept:'Physical Education College'},
        members:['Huang','Zheng','He','Gao','Lin','Liang','Guo','Luo','Han','Tang'],
        memberCount:85,
        activities:[
            {id:1,title:'Spring Badminton League',date:'2026-05-10',time:'09:00',location:'Gymnasium Court 3',desc:'Singles, doubles, and mixed doubles competitions',spots:64,booked:48},
            {id:2,title:'New Member Training Camp',date:'2026-05-20',time:'15:00',location:'Gymnasium',desc:'Basic skills training, welcome beginners',spots:30,booked:12},
        ],
        chatMsgs:[
            {from:'Xiaofeng Lin',text:'League at 9am this Saturday, everyone be on time!',mine:false},
            {from:'Zhiqiang Huang',text:'OK, I will bring my racket',mine:false},
        ]
    },
    {
        id:2, name:'Table Tennis Club', emoji:'🏓',
        desc:'The Table Tennis Club is dedicated to promoting table tennis, regularly organizing training and competitions, and cultivating students' competitive spirit and teamwork skills.',
        leader:{name:'Xiaoming Zhao', grade:'Junior', dept:'Engineering College'},
        members:['Qian','Sun','Li','Zhou','Wu','Zheng','Wang','Feng','Chen','Chu'],
        memberCount:60,
        activities:[
            {id:1,title:'Inter-University Table Tennis Friendly',date:'2026-05-12',time:'14:00',location:'Gymnasium Table Tennis Room',desc:'Compete with brother universities',spots:20,booked:18},
        ],
        chatMsgs:[
            {from:'Xiaoming Zhao',text:'Friendly match roster confirmed, please check the notice',mine:false},
        ]
    },
    {
        id:3, name:'Chinese Classics Society', emoji:'📜',
        desc:'The Chinese Classics Society is committed to promoting excellent traditional Chinese culture, conducting activities such as classic reading, calligraphy, tea ceremony, and Hanfu, allowing students to experience the charm of traditional culture.',
        leader:{name:'Yawen Su', grade:'Senior', dept:'Literature College'},
        members:['Wei','Jiang','Shen','Han','Yang','Zhu','Qin','You','Xu','He'],
        memberCount:45,
        activities:[
            {id:1,title:'Dragon Boat Festival Traditional Culture Experience',date:'2026-05-31',time:'10:00',location:'Culture Square',desc:'Make zongzi, sachets, and calligraphy',spots:50,booked:32},
            {id:2,title:'"Analects" Reading Club',date:'2026-05-08',time:'19:00',location:'Library Seminar Room',desc:'Read classics together, exchange insights',spots:20,booked:15},
        ],
        chatMsgs:[
            {from:'Yawen Su',text:'Dragon Boat Festival materials are ready, welcome to participate!',mine:false},
            {from:'Chenxi Wei',text:'Looking forward to it, I have already signed up',mine:false},
        ]
    },
    {
        id:4, name:'Outdoor Sports Association', emoji:'🏕️',
        desc:'The Outdoor Sports Association organizes hiking, camping, rock climbing and other outdoor activities, cultivating students' adventurous spirit and environmental awareness, and enjoying the beauty of nature.',
        leader:{name:'Haoran Wu', grade:'Sophomore', dept:'Geography College'},
        members:['Shi','Zhang','Kong','Cao','Yan','Hua','Jin','Wei','Tao','Jiang'],
        memberCount:72,
        activities:[
            {id:1,title:'Weekend Hiking & Mountain Climbing',date:'2026-05-09',time:'07:00',location:'Gather at South Gate',desc:'Destination: nearby mountain, about 8km total',spots:30,booked:28},
            {id:2,title:'Summer Camping Trip',date:'2026-06-01',time:'16:00',location:'Suburban Camp',desc:'Two days and one night, experience wilderness survival',spots:25,booked:10},
        ],
        chatMsgs:[
            {from:'Haoran Wu',text:'Only 2 spots left for weekend hiking, sign up now!',mine:false},
            {from:'Xiaoyu Shi',text:'Can you send the equipment list?',mine:false},
            {from:'Haoran Wu',text:'Sent to group files, remember to bring sunscreen and water',mine:false},
        ]
    },
    {
        id:5, name:'Dance Alliance', emoji:'💃',
        desc:'The Dance Alliance gathers students who love dance, covering street dance, modern dance, folk dance and other styles, regularly holding performances and exchange activities.',
        leader:{name:'Meiqi Lin', grade:'Junior', dept:'Art College'},
        members:['Qi','Xie','Zou','Yu','Bai','Shui','Dou','Zhang','Yun','Su'],
        memberCount:95,
        activities:[
            {id:1,title:'Campus Dance Competition',date:'2026-05-22',time:'18:30',location:'Grand Auditorium',desc:'Various dance styles compete on the same stage',spots:300,booked:245},
            {id:2,title:'Street Dance Open Class',date:'2026-05-07',time:'19:00',location:'Activity Center',desc:'Zero-basis introduction, experience the charm of street dance',spots:40,booked:38},
        ],
        chatMsgs:[
            {from:'Meiqi Lin',text:'Competition rehearsal time: 7-9pm every day, Activity Center',mine:false},
            {from:'Yuqing Qi',text:'OK, I will be there tonight',mine:false},
        ]
    },
    {
        id:6, name:'Music Society', emoji:'🎵',
        desc:'The Music Society is the most influential art club in the university, covering vocal, instrumental, choral and other directions, hosting multiple concerts and performances every year.',
        leader:{name:'Letian Chen', grade:'Senior', dept:'Music College'},
        members:['Pan','Ge','Xi','Fan','Peng','Lang','Lu','Wei','Chang','Ma'],
        memberCount:110,
        activities:[
            {id:1,title:'Spring Concert',date:'2026-05-18',time:'19:30',location:'Concert Hall',desc:'Vocal and instrumental joint performance',spots:150,booked:142},
            {id:2,title:'Guitar Beginner Workshop',date:'2026-05-11',time:'15:00',location:'Music Building 204',desc:'Learn guitar from scratch',spots:15,booked:9},
        ],
        chatMsgs:[
            {from:'Letian Chen',text:'Concert program list finalized, final sprint everyone!',mine:false},
            {from:'Xiaoyue Pan',text:'So excited, are there still tickets?',mine:false},
            {from:'Letian Chen',text:'Still a few tickets left, come get them from me',mine:false},
        ]
    },
    {
        id:7, name:'IEEE Student Branch', emoji:'⚡',
        desc:'The IEEE Student Branch is the on-campus organization of the Institute of Electrical and Electronics Engineers, dedicated to promoting academic exchange and technological innovation in electronics, computer, and communications fields.',
        leader:{name:'Keyuan Liu', grade:'Junior', dept:'Electronic Information College'},
        members:['Miao','Feng','Hua','Fang','Yu','Ren','Yuan','Liu','Feng','Bao'],
        memberCount:68,
        activities:[
            {id:1,title:'Embedded Systems Development Lecture',date:'2026-05-06',time:'19:00',location:'Engineering Building Lecture Hall',desc:'Industry experts share practical experience',spots:80,booked:75},
            {id:2,title:'Electronic Design Contest Training',date:'2026-05-13',time:'14:00',location:'Lab Building 301',desc:'Prepare for National College Student Electronic Design Contest',spots:25,booked:20},
        ],
        chatMsgs:[
            {from:'Keyuan Liu',text:'Lecture guest confirmed, from Huawei Research Institute',mine:false},
            {from:'Zhiyuan Miao',text:'So impressive! I have already signed up',mine:false},
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {

// ===== init =====
    const params = new URLSearchParams(location.search);
    const clubId = parseInt(params.get('id') || '0');
    const club = CLUBS.find(c => c.id === clubId) || CLUBS[0];

// night mode
    const nightBtn = document.getElementById('nightBtn');
    const isNight = localStorage.getItem('th_night_mode') === '1';
    if (isNight) document.body.classList.add('night-mode');
    nightBtn.addEventListener('click', () => {
        document.body.classList.toggle('night-mode');
        localStorage.setItem('th_night_mode', document.body.classList.contains('night-mode') ? '1' : '0');
    });

// populate hero
    document.getElementById('heroEmblem').textContent = club.emoji;
    document.getElementById('heroName').textContent = club.name;
    document.getElementById('heroDesc').textContent = club.desc.slice(0, 60) + '…';
    document.getElementById('heroMemberCount').textContent = club.memberCount;
    document.getElementById('heroActivityCount').textContent = club.activities.length;
    document.getElementById('chatRoomTitle').textContent = club.name + ' Chat Room';
    document.getElementById('chatOnlineCount').textContent = Math.floor(Math.random()*8+3) + ' online';

// join btn
    const joinKey = 'club_joined_' + club.id;
    const joinBtn = document.getElementById('joinBtn');
    function updateJoinBtn() {
        const joined = localStorage.getItem(joinKey);
        joinBtn.textContent = joined ? '✓ Joined' : '+ Join Club';
        joinBtn.className = 'club-join-btn' + (joined ? ' joined' : '');
    }
    updateJoinBtn();
    joinBtn.addEventListener('click', () => {
        const joined = localStorage.getItem(joinKey);
        if (joined) localStorage.removeItem(joinKey);
        else localStorage.setItem(joinKey, '1');
        updateJoinBtn();
    });

// tabs
    document.querySelectorAll('.club-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.club-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.club-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
        });
    });

// ===== intro =====
    document.getElementById('introFullDesc').textContent = club.desc;
    const ldr = club.leader;
    document.getElementById('leaderAvatar').textContent = ldr.name[0];
    document.getElementById('leaderName').textContent = ldr.name;
    document.getElementById('leaderMeta').textContent = ldr.dept + ' · ' + ldr.grade;
    const membersRow = document.getElementById('membersRow');
    club.members.forEach(m => {
        const el = document.createElement('div');
        el.className = 'member-avatar';
        el.textContent = m;
        el.setAttribute('data-name', m + ' Student');
        membersRow.appendChild(el);
    });

// ===== activities =====
    const activityList = document.getElementById('activityList');
    const bookedKey = 'club_booked_' + club.id;
    let bookedSet = new Set(JSON.parse(localStorage.getItem(bookedKey) || '[]'));

    function renderActivities() {
        activityList.innerHTML = club.activities.map(act => {
            const d = new Date(act.date);
            const month = d.toLocaleString('zh', {month:'short'});
            const day = d.getDate();
            const pct = Math.round(act.booked / act.spots * 100);
            const isBooked = bookedSet.has(act.id);
            return `<div class="activity-card">
      <div class="activity-date-block">
        <div class="activity-month">${month}</div>
        <div class="activity-day">${day}</div>
      </div>
      <div class="activity-info">
        <div class="activity-title">${act.title}</div>
        <div class="activity-meta">
          <span><i class="fas fa-clock" style="margin-right:4px"></i>${act.time}</span>
          <span><i class="fas fa-map-marker-alt" style="margin-right:4px"></i>${act.location}</span>
        </div>
        <div class="activity-desc">${act.desc}</div>
        <div class="activity-spots">
          Booked ${act.booked}/${act.spots} people
          <div class="spots-bar"><div class="spots-fill" style="width:${pct}%"></div></div>
        </div>
      </div>
      <button class="book-btn ${isBooked ? 'booked' : ''}" data-act-id="${act.id}">
        ${isBooked ? '✓ Booked' : 'Book'}
      </button>
    </div>`;
        }).join('');
        activityList.querySelectorAll('.book-btn:not(.booked)').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.actId);
                bookedSet.add(id);
                localStorage.setItem(bookedKey, JSON.stringify([...bookedSet]));
                const act = club.activities.find(a => a.id === id);
                if (act) act.booked = Math.min(act.booked + 1, act.spots);
                renderActivities();
            });
        });
    }
    renderActivities();

// ===== forum =====
    const forumKey = 'club_forum_' + club.id;
    function getForumPosts() { return JSON.parse(localStorage.getItem(forumKey) || '[]'); }
    function saveForumPosts(posts) { localStorage.setItem(forumKey, JSON.stringify(posts)); }

    function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function renderForum() {
        const posts = getForumPosts();
        const forumList = document.getElementById('forumList');
        if (!posts.length) {
            forumList.innerHTML = '<div class="empty-tip">No posts yet, be the first to post!</div>';
            return;
        }
        forumList.innerHTML = posts.slice().reverse().map((p, ri) => {
            const i = posts.length - 1 - ri;
            const commentsHtml = (p.comments || []).map(c =>
                `<div class="forum-comment-item"><span class="forum-comment-author">${escHtml(c.author)}</span>${escHtml(c.text)}</div>`
            ).join('');
            return `<div class="forum-post-card" data-idx="${i}">
      <div class="forum-post-header">
        <div class="avatar" style="width:36px;height:36px;font-size:0.85rem">${escHtml(p.author[0])}</div>
        <div><div style="font-weight:600;font-size:0.92rem">${escHtml(p.author)}</div><div style="font-size:0.75rem;color:var(--text-muted)">${p.time}</div></div>
      </div>
      <div class="forum-post-body">${escHtml(p.text)}</div>
      <div class="forum-post-actions">
        <button class="action-btn forum-like-btn" data-idx="${i}"><i class="far fa-heart"></i> ${p.likes||0}</button>
        <button class="action-btn forum-cmt-btn" data-idx="${i}"><i class="far fa-comment"></i> ${(p.comments||[]).length} Comments</button>
      </div>
      <div class="forum-comments" id="forum-cmt-${i}">
        ${commentsHtml}
        <div class="forum-comment-input-row">
          <input class="forum-comment-input" placeholder="Write comment…" data-idx="${i}">
          <button class="btn btn-sm" data-cmt-idx="${i}">Send</button>
        </div>
      </div>
    </div>`;
        }).join('');

        forumList.querySelectorAll('.forum-like-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const posts2 = getForumPosts();
                posts2[idx].likes = (posts2[idx].likes || 0) + 1;
                saveForumPosts(posts2);
                renderForum();
            });
        });
        forumList.querySelectorAll('.forum-cmt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const box = document.getElementById('forum-cmt-' + idx);
                box.classList.toggle('open');
            });
        });
        forumList.querySelectorAll('[data-cmt-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.cmtIdx);
                const input = forumList.querySelector(`.forum-comment-input[data-idx="${idx}"]`);
                const text = input.value.trim();
                if (!text) return;
                const posts2 = getForumPosts();
                if (!posts2[idx].comments) posts2[idx].comments = [];
                posts2[idx].comments.push({ author: 'Me', text });
                saveForumPosts(posts2);
                renderForum();
                const box = document.getElementById('forum-cmt-' + idx);
                if (box) box.classList.add('open');
            });
        });
    }
    renderForum();

    document.getElementById('forumPostBtn').addEventListener('click', () => {
        const input = document.getElementById('forumInput');
        const text = input.value.trim();
        if (!text) return;
        const posts = getForumPosts();
        posts.push({ author: 'Me', text, time: new Date().toLocaleString(), likes: 0, comments: [] });
        saveForumPosts(posts);
        input.value = '';
        renderForum();
    });

// ===== chat =====
    const chatApplyBtn = document.getElementById('chatApplyBtn');
    const chatStatus = document.getElementById('chatStatus');
    const chatApplyBox = document.getElementById('chatApplyBox');
    const chatRoom = document.getElementById('chatRoom');
    const chatApprovedKey = 'club_chat_approved_' + club.id;

    function openChatRoom() {
        chatApplyBox.style.display = 'none';
        chatRoom.classList.add('open');
        const msgs = document.getElementById('chatMessages');
        msgs.innerHTML = club.chatMsgs.map(m => `
    <div class="chat-msg ${m.mine ? 'chat-msg-mine' : ''}">
      <div class="chat-msg-avatar">${m.from[0]}</div>
      <div class="chat-bubble ${m.mine ? 'chat-bubble-mine' : 'chat-bubble-theirs'}">${escHtml(m.text)}</div>
    </div>`).join('');
        msgs.scrollTop = msgs.scrollHeight;
    }

    if (localStorage.getItem(chatApprovedKey)) openChatRoom();

    chatApplyBtn.addEventListener('click', () => {
        chatApplyBtn.disabled = true;
        chatStatus.textContent = 'Application submitted, waiting for administrator review…';
        setTimeout(() => {
            chatStatus.textContent = '✓ Application approved! Entering chat room…';
            setTimeout(() => {
                localStorage.setItem(chatApprovedKey, '1');
                openChatRoom();
            }, 800);
        }, 2000);
    });

    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    function sendChatMsg() {
        const text = chatInput.value.trim();
        if (!text) return;
        const msgs = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = 'chat-msg chat-msg-mine';
        div.innerHTML = `<div class="chat-msg-avatar">Me</div><div class="chat-bubble chat-bubble-mine">${escHtml(text)}</div>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
        chatInput.value = '';
    }
    chatSendBtn.addEventListener('click', sendChatMsg);
    chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMsg(); });

}); // DOMContentLoaded