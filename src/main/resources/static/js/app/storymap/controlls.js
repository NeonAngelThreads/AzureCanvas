// ==================== 配置 ====================
const API_BASE_URL = 'https://api.szsummer.com/api';
const MUST_CENTER = [22.1524, 113.5662];

let map;
let markers = {};
let currentFilter = "all";
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let allStories = [];
let originalStoriesData = [];
let pendingStoryCoords = null;

// ==================== 模拟数据 ====================
const MOCK_STORIES = [
    { storyMapId:"1", title:"Discovery in Library", description:"On the 5th floor by the window, I found an old letter in a textbook written by a senior in 2015 encouraging students.", category:"study", location:"Library", lat:22.1528, lng:113.5665, likes:24, comments:3, authorID:"user_001", author:"Ming", createdAt:"2024-10-15T08:00:00Z", updatedAt:"2024-10-15T08:00:00Z" },
    { storyMapId:"2", title:"Auntie's Secret Menu", description:"If you ask for 'a taste of home', she makes special tomato egg noodles. It's a hidden gem!", category:"life", location:"Canteen", lat:22.1515, lng:113.5658, likes:56, comments:8, authorID:"user_002", author:"Chen", createdAt:"2024-10-10T08:00:00Z", updatedAt:"2024-10-10T08:00:00Z" },
    { storyMapId:"3", title:"Basketball Court Friendships", description:"Met my best friend here 3 years ago. Basketball is our common language.", category:"emotion", location:"Basketball Court", lat:22.1530, lng:113.5670, likes:42, comments:5, authorID:"user_003", author:"Jay", createdAt:"2024-10-05T08:00:00Z", updatedAt:"2024-10-05T08:00:00Z" },
    { storyMapId:"4", title:"Music Festival 2024", description:"First music festival on the big lawn this April. The whole school was buzzing!", category:"event", location:"Grand Lawn", lat:22.1520, lng:113.5650, likes:89, comments:12, authorID:"user_004", author:"Student Union", createdAt:"2024-09-28T08:00:00Z", updatedAt:"2024-09-28T08:00:00Z" },
    { storyMapId:"5", title:"All-nighter Review", description:"During finals week, the 24h study room is always full. Shared efforts feel great.", category:"study", location:"Study Room", lat:22.1535, lng:113.5668, likes:67, comments:9, authorID:"user_005", author:"Wang", createdAt:"2024-09-20T08:00:00Z", updatedAt:"2024-09-20T08:00:00Z" },
    { storyMapId:"6", title:"The Cat at the Gate", description:"An orange cat named 'Principal' sits at the gate every day, waiting for graduates to visit.", category:"life", location:"Main Gate", lat:22.1510, lng:113.5675, likes:103, comments:21, authorID:"user_006", author:"Cat Lover", createdAt:"2024-10-01T08:00:00Z", updatedAt:"2024-10-01T08:00:00Z" }
];
originalStoriesData = [...MOCK_STORIES];

// ==================== API 调用 ====================
async function fetchStoriesFromAPI(page = 1, limit = 10) {
    const url = `${API_BASE_URL}/storymaps?page=${page}&limit=${limit}`;
    try {
        const response = await fetch(url, { method:'GET', credentials:'include', headers:{ 'Content-Type':'application/json' } });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.warn('API Failed, using mock data:', error);
        return null;
    }
}
function convertAPIStory(story) {
    return {
        storyMapId: story.storyMapId,
        title: story.title,
        description: story.description,
        category: story.category || 'life',
        location: story.location || 'Campus',
        lat: story.lat || MUST_CENTER[0] + (Math.random() - 0.5) * 0.003,
        lng: story.lng || MUST_CENTER[1] + (Math.random() - 0.5) * 0.003,
        likes: story.likes || 0,
        comments: story.comments || 0,
        authorID: story.authorID,
        author: story.author || 'Anonymous',
        createdAt: story.createdAt,
        updatedAt: story.updatedAt
    };
}

async function loadMoreStories() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    showLoadingIndicator(true);
    let apiData = await fetchStoriesFromAPI(currentPage, 10);
    let newStories = [];
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
        newStories = apiData.map(convertAPIStory);
        hasMore = apiData.length === 10;
    } else if (currentPage === 1 && allStories.length === 0) {
        newStories = originalStoriesData.map(s => ({ ...s }));
        hasMore = false;
        console.log('Mock data loaded:', newStories.length);
    } else if (apiData === null && currentPage > 1) {
        hasMore = false;
    }
    if (newStories.length > 0) {
        allStories = [...allStories, ...newStories];
        currentPage++;
        renderStoriesList();
        loadMarkers();
    } else if (currentPage === 1 && allStories.length === 0) {
        renderStoriesList();
    }
    isLoading = false;
    showLoadingIndicator(false);
}

function showLoadingIndicator(show) {
    const container = document.getElementById('storiesList');
    let existingLoader = document.querySelector('.loading-trigger');
    if (show) {
        if (!existingLoader) {
            const loaderDiv = document.createElement('div');
            loaderDiv.className = 'loading-trigger';
            loaderDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            container.appendChild(loaderDiv);
        }
    } else {
        if (existingLoader) existingLoader.remove();
    }
}

function setupInfiniteScroll() {
    const container = document.querySelector('.stories-list');
    if (!container) return;
    const handleScroll = () => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
            if (!isLoading && hasMore) loadMoreStories();
        }
    };
    container.addEventListener('scroll', handleScroll);
}

function initMap() {
    map = L.map('map').setView(MUST_CENTER, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    L.marker(MUST_CENTER, {
        icon: L.divIcon({
            html: '<div style="background: #667eea; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>',
            className: 'custom-marker'
        })
    }).addTo(map).bindPopup('<b>MUST</b><br>Where your story begins');
    loadMarkers();

    // 双击地图创建故事
    map.on('dblclick', function(e) {
        pendingStoryCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
        document.getElementById('coordHint').innerHTML = `📍 Selected: ${pendingStoryCoords.lat.toFixed(5)}, ${pendingStoryCoords.lng.toFixed(5)}<br>Fill in your story content`;
        document.getElementById('storyModal').style.display = 'flex';
    });
}

function loadMarkers() {
    Object.values(markers).forEach(m => map.removeLayer(m));
    markers = {};
    let filtered = currentFilter === "all" ? allStories : allStories.filter(s => s.category === currentFilter);
    const colors = { study:'#1976d2', life:'#388e3c', emotion:'#c2185b', event:'#f57c00' };
    filtered.forEach(story => {
        const icon = L.divIcon({
            html: `<div style="background: ${colors[story.category] || '#667eea'}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="fas fa-map-pin" style="font-size: 14px;"></i></div>`,
            iconSize: [32,32],
            popupAnchor: [0,-16]
        });
        const marker = L.marker([story.lat, story.lng], { icon }).addTo(map).bindPopup(`
                    <div style="min-width:200px;"><strong>📖 ${story.title}</strong>
                    <p style="margin:8px 0; font-size:13px;">${story.description.substring(0,80)}${story.description.length>80?'...':''}</p>
                    <div style="display:flex; justify-content:space-between; font-size:12px; color:#999;"><span><i class="fas fa-heart"></i> ${story.likes}</span><span><i class="fas fa-comment"></i> ${story.comments}</span><span><i class="fas fa-user"></i> ${story.author}</span></div>
                    <button onclick="showStoryDetail('${story.storyMapId}')" style="margin-top:8px; background:#667eea; color:white; border:none; padding:4px 12px; border-radius:15px; cursor:pointer;">View Details</button></div>
                `);
        markers[story.storyMapId] = marker;
    });
}

function renderStoriesList() {
    const container = document.getElementById('storiesList');
    let filtered = currentFilter === "all" ? allStories : allStories.filter(s => s.category === currentFilter);
    if (filtered.length === 0 && !isLoading) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><i class="fas fa-book-open"></i><br>No stories here yet. Share yours!</div>';
        return;
    }
    const sorted = [...filtered].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    container.innerHTML = sorted.map(s => `
                <div class="story-card" onclick="showStoryDetail('${s.storyMapId}'); zoomToStory(${s.lat}, ${s.lng})">
                    <div class="story-title">${s.title}<span class="story-category category-${s.category}">${s.category==='study'?'📚 Study':s.category==='life'?'🍜 Life':s.category==='emotion'?'💕 Emotion':'🎉 Event'}</span></div>
                    <div class="story-preview">${s.description.substring(0,100)}${s.description.length>100?'...':''}</div>
                    <div class="story-meta"><span><i class="fas fa-map-marker-alt"></i> ${s.location||'Campus'}</span><span><i class="fas fa-user"></i> ${s.author}</span><span><i class="fas fa-calendar"></i> ${formatDate(s.createdAt)}</span></div>
                    <div class="story-meta" style="margin-top:5px;"><span class="story-likes"><i class="fas fa-heart"></i> ${s.likes}</span><span class="story-comments"><i class="fas fa-comment"></i> ${s.comments}</span></div>
                </div>
            `).join('');
    if (!hasMore && allStories.length > 0) {
        const footer = document.createElement('div');
        footer.className = 'loading-trigger';
        footer.innerHTML = "✨ You've reached the end ✨";
        if (!document.querySelector('.end-message')) container.appendChild(footer);
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function zoomToStory(lat, lng) {
    map.setView([lat, lng], 18);
    const tempMarker = L.marker([lat, lng], {
        icon: L.divIcon({ html: '<div style="background:#ff4444; width:20px; height:20px; border-radius:50%; animation:pulse 1s infinite;"></div>' })
    }).addTo(map);
    setTimeout(() => map.removeLayer(tempMarker), 2000);
}

window.showStoryDetail = function(id) {
    const story = allStories.find(s=>s.storyMapId===id);
    if(!story) return;
    const overlay = document.getElementById('storyDetailOverlay');
    document.getElementById('detailTitle').innerHTML = `${story.title}<span class="category-badge-large" style="background:rgba(102,126,234,0.15); color:#4f46e5;">${getCategoryIcon(story.category)} ${getCategoryName(story.category)}</span>`;
    document.getElementById('detailBody').innerHTML = `
                <div class="detail-group"><div class="detail-label"><i class="fas fa-book-open"></i> Story Content</div><div class="story-full-content">${story.description.replace(/\n/g,'<br>')}</div></div>
                <div class="detail-group"><div class="detail-label"><i class="fas fa-info-circle"></i> Details</div><div><span class="info-chip"><i class="fas fa-map-marker-alt"></i> ${story.location||'Campus'}</span><span class="info-chip"><i class="fas fa-user"></i> ${story.author}</span><span class="info-chip"><i class="fas fa-calendar"></i> ${formatDate(story.createdAt)}</span></div></div>
                <div class="stats-row"><div class="stat-item"><i class="fas fa-heart" style="color:#ef4444;"></i> ${story.likes} Likes</div><div class="stat-item"><i class="fas fa-comment" style="color:#3b82f6;"></i> ${story.comments} Comments</div></div>
            `;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};
function closeStoryDetailModal() {
    document.getElementById('storyDetailOverlay').style.display = 'none';
    document.body.style.overflow = '';
}
function getCategoryIcon(c) { const i={study:'📚',life:'🍜',emotion:'💕',event:'🎉'}; return i[c]||'📖'; }
function getCategoryName(c) { const n={study:'Study',life:'Daily Life',emotion:'Memories',event:'Campus Event'}; return n[c]||'Story'; }

function addNewStory(title, category, content, locationName) {
    let lat, lng;
    if (pendingStoryCoords) { lat = pendingStoryCoords.lat; lng = pendingStoryCoords.lng; }
    else { lat = MUST_CENTER[0] + (Math.random()-0.5)*0.003; lng = MUST_CENTER[1] + (Math.random()-0.5)*0.003; }
    const newStory = {
        storyMapId: Date.now().toString(),
        title, description: content, category, location: locationName || "Campus",
        lat, lng, likes:0, comments:0, authorID:"current_user", author:"Current User",
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    submitStory(newStory);
    allStories.unshift(newStory);
    renderStoriesList();
    loadMarkers();
    showSuccessToast("✨ Story published! Memory recorded on map.");
    pendingStoryCoords = null;
    document.getElementById('coordHint').innerHTML = "💡 Tip: Double-click map to get coordinates";
}

async function submitStory(story) {
    const url = 'https://api.szsummer.com/api/storymaps';

    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: "cors",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(story)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.uuid){
            console.error('Map add failed');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}
function showSuccessToast(msg) {
    const toast = document.createElement('div');
    toast.innerHTML = `<div style="position:fixed; bottom:100px; right:30px; background:rgba(0,0,0,0.8); backdrop-filter:blur(12px); color:white; padding:12px 24px; border-radius:40px; z-index:4000; animation:fadeIn 0.3s;"><i class="fas fa-check-circle" style="color:#4ade80; margin-right:8px;"></i> ${msg}</div>`;
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(),2500);
}

function applyFilter() { renderStoriesList(); loadMarkers(); }

function locateByIP() {
    fetch('https://api.szsummer.com/api/ip-location')
        .then(response => {
            if (!response.ok) throw new Error('HTTP error ' + response.status);
            return response.json();
        })
        .then(data => {
            if (data && data.latitude && data.longitude) {
                map.setView([data.latitude, data.longitude], 13);
                showSuccessToast(`Located: ${data.city || ''}, ${data.country || ''}`);
            } else {
                throw new Error('Invalid response');
            }
        })
        .catch(err => {
            console.warn('IP location failed:', err);
            showSuccessToast("Unable to get IP location, using default view.");
        });
}
function resetToUST() { map.setView(MUST_CENTER,16); showSuccessToast("Returned to MUST"); }

// 探索功能
const explorePanel = document.getElementById('explorePanel');
const exploreBtn = document.getElementById('exploreBtn');
const searchInputExplore = document.getElementById('searchInput');
const searchRes = document.getElementById('searchResults');
exploreBtn.addEventListener('click', (e) => { e.stopPropagation(); explorePanel.classList.toggle('open'); if(explorePanel.classList.contains('open')) searchInputExplore.focus(); });
// 修改后的探索搜索逻辑
searchInputExplore.addEventListener('input', async function() {
    let q = this.value.trim();
    if(q.length < 2) { searchRes.innerHTML = ''; return; }
    try {
        // 添加 &accept-language=en 参数强制返回英文结果
        let res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + " Macau")}&format=json&limit=8&accept-language=en`);
        let data = await res.json();

        searchRes.innerHTML = data.map(item => {
            // 格式化显示，只取名称的前部分，避免过长的地址描述
            const displayName = item.display_name.split(',').slice(0, 3).join(',');
            return `<div class="result-item" data-lat="${item.lat}" data-lon="${item.lon}">📍 ${displayName}</div>`;
        }).join('');

        document.querySelectorAll('.result-item').forEach(el => {
            el.addEventListener('click', () => {
                map.setView([parseFloat(el.dataset.lat), parseFloat(el.dataset.lon)], 16);
                explorePanel.classList.remove('open');
                searchInputExplore.value = '';
                searchRes.innerHTML = '';
            });
        });
    } catch(e) {
        console.warn('Search failed:', e);
    }
});
document.addEventListener('click', (e) => { if(!explorePanel.contains(e.target) && e.target!==exploreBtn && !exploreBtn.contains(e.target)) explorePanel.classList.remove('open'); });

// 修复弹窗拖动误关
function fixModalDragClose(modalOverlay) {
    let startX,startY,isDragging=false;
    modalOverlay.addEventListener('mousedown', (e) => {
        if(e.target===modalOverlay) {
            startX=e.clientX; startY=e.clientY;
            isDragging=false;
            const onMouseMove=(ev)=>{ if(Math.hypot(ev.clientX-startX, ev.clientY-startY)>5) isDragging=true; };
            const onMouseUp=(ev)=>{ if(!isDragging && ev.target===modalOverlay) modalOverlay.style.display='none'; document.removeEventListener('mousemove',onMouseMove); document.removeEventListener('mouseup',onMouseUp); };
            document.addEventListener('mousemove',onMouseMove);
            document.addEventListener('mouseup',onMouseUp);
        }
    });
}
fixModalDragClose(document.getElementById('storyDetailOverlay'));
fixModalDragClose(document.getElementById('storyModal'));

// 事件绑定
document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',function(){
        document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
        this.classList.add('active');
        currentFilter=this.dataset.category;
        applyFilter();
    });
});
const fab = document.getElementById('fabBtn'), modal = document.getElementById('storyModal'), cancelBtn = document.getElementById('cancelModal'), submitBtn = document.getElementById('submitStory');
fab.addEventListener('click',()=>{ pendingStoryCoords=null; document.getElementById('coordHint').innerHTML="💡 Tip: Double-click map to get coordinates"; modal.style.display='flex'; });
cancelBtn.addEventListener('click',()=>{ modal.style.display='none'; document.getElementById('storyTitle').value=''; document.getElementById('storyContent').value=''; pendingStoryCoords=null; document.getElementById('coordHint').innerHTML="💡 Tip: Double-click map to get coordinates"; });
submitBtn.addEventListener('click',()=>{
    const title=document.getElementById('storyTitle').value.trim();
    const content=document.getElementById('storyContent').value.trim();
    const category=document.getElementById('storyCategory').value;
    const location=document.getElementById('storyLocation').value.trim();
    if(!title||!content){ showSuccessToast('Please fill in title and content!'); return; }
    if(content.length<20){ showSuccessToast('Content is too short, please write at least 20 words.'); return; }
    addNewStory(title,category,content,location);
    modal.style.display='none';
    document.getElementById('storyTitle').value='';
    document.getElementById('storyContent').value='';
});
modal.addEventListener('click',(e)=>{ if(e.target===modal) modal.style.display='none'; });
document.getElementById('closeDetailBtn').addEventListener('click',closeStoryDetailModal);
document.getElementById('storyDetailOverlay').addEventListener('click',(e)=>{ if(e.target===document.getElementById('storyDetailOverlay')) closeStoryDetailModal(); });
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape' && document.getElementById('storyDetailOverlay').style.display==='flex') closeStoryDetailModal(); });

document.getElementById('locateIpBtn').addEventListener('click', locateByIP);
document.getElementById('resetMapBtn').addEventListener('click', resetToUST);

// 天气
const AREA_COORDS = { taipa:{lat:22.1564,lon:113.5588}, coloane:{lat:22.1200,lon:113.5600}, peninsula:{lat:22.1987,lon:113.5439} };
const weatherIcon = document.getElementById('weatherIcon');
const weatherTemp = document.getElementById('weatherTemp');

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                if (keyword) {
                    searchStories(keyword);
                }
            }
        });
    }
}

async function searchStories(keyword) {
    try {
        const storiesList = document.getElementById('storiesList');
        storiesList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';

        const response = await fetch(`https://api.szsummer.com/api/storymaps/search?keyword=${encodeURIComponent(keyword)}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const searchResults = await response.json();

        if (Array.isArray(searchResults) && searchResults.length > 0) {
            let formattedResults = searchResults.map(convertAPIStory).filter(Boolean);
            if (currentFilter !== "all") {
                formattedResults = formattedResults.filter(story => story.category === currentFilter);
            }
            renderSearchResults(formattedResults, keyword);
        } else {
            storiesList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><i class="fas fa-search"></i><br>No matching stories found</div>';
        }
    } catch (error) {
        console.error('Search failed:', error);
        let localResults = allStories.filter(story =>
            story.title.toLowerCase().includes(keyword.toLowerCase()) ||
            story.description.toLowerCase().includes(keyword.toLowerCase()) ||
            story.location.toLowerCase().includes(keyword.toLowerCase())
        );
        if (currentFilter !== "all") {
            localResults = localResults.filter(story => story.category === currentFilter);
        }
        if (localResults.length > 0) {
            renderSearchResults(localResults, keyword);
        } else {
            document.getElementById('storiesList').innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><i class="fas fa-search"></i><br>No matching stories found</div>';
        }
    }
}

function renderSearchResults(results, keyword) {
    const container = document.getElementById('storiesList');
    if (results.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><i class="fas fa-search"></i><br>No matching stories found</div>';
        return;
    }
    const sorted = [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const html = sorted.map(story => {
        const highlightedTitle = highlightKeyword(story.title, keyword);
        const highlightedDescription = highlightKeyword(story.description.substring(0, 100), keyword);
        const highlightedLocation = highlightKeyword(story.location || 'Campus', keyword);

        return `
                    <div class="story-card" onclick="showStoryDetail('${story.storyMapId}'); zoomToStory(${story.lat}, ${story.lng})">
                        <div class="story-title">
                            ${highlightedTitle}
                            <span class="story-category category-${story.category}">
                                ${story.category === 'study' ? '📚 Study' : story.category === 'life' ? '🍜 Life' : story.category === 'emotion' ? '💕 Emotion' : '🎉 Event'}
                            </span>
                        </div>
                        <div class="story-preview">
                            ${highlightedDescription}${story.description.length > 100 ? '...' : ''}
                        </div>
                        <div class="story-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${highlightedLocation}</span>
                            <span><i class="fas fa-user"></i> ${story.author}</span>
                            <span><i class="fas fa-calendar"></i> ${formatDate(story.createdAt)}</span>
                        </div>
                        <div class="story-meta" style="margin-top: 5px;">
                            <span class="story-likes"><i class="fas fa-heart"></i> ${story.likes}</span>
                            <span class="story-comments"><i class="fas fa-comment"></i> ${story.comments}</span>
                        </div>
                    </div>
                `;
    }).join('');
    container.innerHTML = html;
}

function highlightKeyword(text, keyword) {
    if (!keyword || !text || typeof text !== 'string') return text || '';

    // 如果文本中已经包含了 em 标签（代表 API 已经处理过），则直接返回
    if (text.includes('<em>')) return text;

    // 对关键词中的特殊字符进行转义，防止正则崩溃
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 使用正则表达式进行全局 (g) 和 忽略大小写 (i) 的匹配
    // 只匹配文本，不破坏 HTML 结构
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');

    // 执行替换
    return text.replace(regex, '<span class="text-red-500 font-bold">$1</span>');
}

async function fetchWeather(area) {
    const c = AREA_COORDS[area];
    if(!c) return;
    try {
        weatherIcon.className = 'fas fa-spinner fa-pulse weather-icon';
        weatherTemp.innerText = '--°C';
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current_weather=true&timezone=Asia%2FSingapore`);
        const data = await res.json();
        if(data && data.current_weather) {
            const temp = Math.round(data.current_weather.temperature);
            const code = data.current_weather.weathercode;
            let icon = 'fa-cloud-sun';
            if(code===0||code===1) icon='fa-sun';
            else if(code===2) icon='fa-cloud-sun';
            else if(code===3) icon='fa-cloud';
            else if(code>=51&&code<=67) icon='fa-cloud-rain';
            else if(code>=71&&code<=77) icon='fa-snowflake';
            else if(code>=80&&code<=99) icon='fa-bolt';
            weatherIcon.className = `fas ${icon} weather-icon`;
            weatherTemp.innerText = `${temp}°C`;
        }
    } catch(err) { weatherIcon.className='fas fa-cloud-sun weather-icon'; weatherTemp.innerText='--°C'; }
}

const customSelect = document.getElementById('areaSelectCustom');
const triggerBtn = customSelect.querySelector('.select-trigger');
const options = customSelect.querySelectorAll('.select-options li');
let currentArea = 'taipa';

triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    customSelect.classList.toggle('open');
});
options.forEach(opt => {
    opt.addEventListener('click', () => {
        const value = opt.dataset.value;
        currentArea = value;
        triggerBtn.childNodes[0].nodeValue = opt.innerText + " ";
        fetchWeather(currentArea);
        customSelect.classList.remove('open');
    });
});
document.addEventListener('click', () => customSelect.classList.remove('open'));

async function load_user(){
    const response = await fetch('https://api.szsummer.com/api/users/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (response.ok) {
        const user = await response.json();
        localStorage.setItem('userProfile', JSON.stringify(user));
        return user.username || user.nickname || 'User';
    }
    return null;
}

fetchWeather('taipa');
window.addEventListener('DOMContentLoaded', async () => {
    initMap();
    setupSearch();
    setupInfiniteScroll();
    await loadMoreStories();

    const userAvatar = document.getElementById('header-avatar');
    let userName = await load_user();
    if (userName) {
        let char = userName.charAt(0).toUpperCase();
        // userAvatar setup...
    }
    const style = document.createElement('style');
    style.textContent = `@keyframes pulse{0%{transform:scale(1);opacity:1;}100%{transform:scale(2);opacity:0;}} .custom-div-icon{background:transparent;border:none;}`;
    document.head.appendChild(style);
    console.log("✅ Campus Story Map Started");
});