const OLLAMA_CONFIG = {
    host: 'http://192.168.1.100:11434',
    model: 'qwen:4b'
};

const AVAILABLE_MODELS = [
    { id: 'qwen:4b', name: 'qwen 4B', desc: 'Light', type: 'ollama' },
    { id: 'deepseek-chat', name: 'DeepSeek Official', desc: 'Intelligent', type: 'deepseek' }
];

const STORAGE_KEY = 'must-treehole-sessions';
const MODEL_STORAGE_KEY = 'must-agent-model';
const SYSTEM_PROMPT = 'You are the Confessions AI Assistant, speaking in a warm and friendly tone. You help users answer campus questions, listen to their troubles, and offer advice. Please respond to users\' questions naturally.';
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const KNOWLEDGE_API_BASE = window.location.origin + '/api/knowledge';

let sessions = [];
let currentSessionId = null;
let isTyping = false;
let abortController = null;
let currentModel = localStorage.getItem(MODEL_STORAGE_KEY) || 'qwen:4b';
let pendingImages = [];

const agentMessages = document.getElementById('agentMessages');
const agentWelcome = document.getElementById('agentWelcome');
const agentInput = document.getElementById('agentInput');
const agentSendBtn = document.getElementById('agentSendBtn');
const chatListEl = document.getElementById('chatList');
const chatTitleEl = document.getElementById('chatTitle');
const imagePreviewBar = document.getElementById('imagePreviewBar');
const modelChipGroup = document.getElementById('modelChipGroup');

function initModelChips() {
    modelChipGroup.innerHTML = '';
    AVAILABLE_MODELS.forEach(m => {
        const chip = document.createElement('div');
        chip.className = `model-chip${m.id === currentModel ? ' active' : ''}`;
        chip.dataset.model = m.id;
        chip.innerHTML = `<span class="chip-dot"></span>${m.name}`;
        chip.title = m.desc;
        chip.addEventListener('click', () => selectModel(m.id));
        modelChipGroup.appendChild(chip);
    });
}

function selectModel(modelId) {
    if (isTyping) return;
    currentModel = modelId;
    OLLAMA_CONFIG.model = modelId;
    localStorage.setItem(MODEL_STORAGE_KEY, modelId);
    modelChipGroup.querySelectorAll('.model-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.model === modelId);
    });
    console.log(`[Agent] Switch Model → ${modelId}`);
}

function loadSessions() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        sessions = raw ? JSON.parse(raw) : [];
        if (!sessions.length) {
            createNewSession();
        } else {
            currentSessionId = sessions[0].id;
            renderChatList();
            renderCurrentSession();
        }
    } catch (e) {
        console.error('Loading Conversation Error:', e);
        sessions = [];
        createNewSession();
    }
}

function saveSessions() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch (e) { console.error('Chat Save Failed:', e); }
}

function createNewSession() {
    const session = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title: 'New chat', messages: [], createdAt: Date.now() };
    sessions.unshift(session);
    currentSessionId = session.id;
    saveSessions();
    renderChatList();
    renderCurrentSession();
}

function getCurrentSession() { return sessions.find(s => s.id === currentSessionId) || null; }

function switchSession(sessionId) { if (!isTyping && sessionId !== currentSessionId) { currentSessionId = sessionId; renderChatList(); renderCurrentSession(); } }

function deleteSession(sessionId, event) {
    event.stopPropagation();
    if (sessions.length <= 1) { window.notify.show.show('At least one session must be retained.'); return; }
    sessions = sessions.filter(s => s.id !== sessionId);
    if (currentSessionId === sessionId) currentSessionId = sessions[0].id;
    saveSessions();
    renderChatList();
    renderCurrentSession();
}

function renderChatList() {
    chatListEl.innerHTML = '';
    sessions.forEach(session => {
        const item = document.createElement('div');
        item.className = `chat-list-item${session.id === currentSessionId ? ' active' : ''}`;
        item.innerHTML = `<i class="fas fa-comment-dots"></i><span class="chat-list-item-text">${escapeHtml(session.title)}</span><span class="chat-list-item-time">${formatTime(session.createdAt)}</span>${sessions.length > 1 ? '<i class="fas fa-times" style="color:var(--text-muted);font-size:0.7rem;cursor:pointer;margin-left:4px;" onclick=""></i>' : ''}`;
        item.addEventListener('click', () => switchSession(session.id));
        const closeBtn = item.querySelector('.fa-times');
        if (closeBtn) closeBtn.addEventListener('click', (e) => deleteSession(session.id, e));
        chatListEl.appendChild(item);
    });
}

function renderCurrentSession() {
    const session = getCurrentSession();
    if (!session) return;
    chatTitleEl.textContent = session.title;
    agentMessages.innerHTML = '';
    if (session.messages.length === 0) {
        agentWelcome.style.display = 'flex';
        agentMessages.appendChild(agentWelcome);
    } else {
        agentWelcome.style.display = 'none';
        session.messages.forEach(msg => appendMessage(msg.role, msg.content, null, false));
    }
    agentSendBtn.disabled = !agentInput.value.trim() && pendingImages.length === 0 || isTyping;
}

function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }

function formatTime(timestamp) {
    const d = new Date(timestamp), diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
    if (d.toDateString() === new Date().toDateString()) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}

function formatContent(text) { return escapeHtml(text).replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); }

/* Image Preview Bar Management */
function renderImagePreview() {
    imagePreviewBar.innerHTML = '';
    if (pendingImages.length > 0) {
        imagePreviewBar.classList.add('has-images');
        pendingImages.forEach((imgData, idx) => {
            const item = document.createElement('div');
            item.className = 'image-preview-item';
            item.innerHTML = `<img src="${imgData.preview}" alt="Preview"><button class="preview-delete" data-idx="${idx}"><i class="fas fa-times"></i></button>`;
            item.querySelector('.preview-delete').addEventListener('click', (e) => { e.stopPropagation(); removePendingImage(idx); });
            imagePreviewBar.appendChild(item);
        });
    } else {
        imagePreviewBar.classList.remove('has-images');
    }
    agentSendBtn.disabled = !agentInput.value.trim() && pendingImages.length === 0 || isTyping;
}

function addPendingImage(file) {
    if (pendingImages.length >= MAX_IMAGES) {
        window.notify.show.show(`You can add a maximum of ${MAX_IMAGES} images.`);
        return;
    }
    if (!file.type.startsWith('image/')) {
        window.notify.show.show('Please select image file');
        return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
        window.notify.show.show('A single image cannot exceed 10MB.');
        return;
    }
    const reader = new FileReader();
    reader.onload = ev => { pendingImages.push({ file, preview: ev.target.result, base64: ev.target.result }); renderImagePreview(); };
    reader.readAsDataURL(file);
}

function removePendingImage(idx) { pendingImages.splice(idx, 1); renderImagePreview(); }
function clearPendingImages() { pendingImages = []; renderImagePreview(); }

/* AI Loading Animation */
function showAILoading() {
    hideAILoading();
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-loading-wrapper';
    wrapper.id = 'aiLoadingIndicator';
    wrapper.innerHTML = `<div class="ai-loading-avatar"><i class="fas fa-robot"></i></div><div class="ai-loading-bubble"><div class="ai-loading-dots"><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div></div></div>`;
    agentMessages.appendChild(wrapper);
    agentMessages.scrollTop = agentMessages.scrollHeight;
}

function hideAILoading() { const el = document.getElementById('aiLoadingIndicator'); if (el) el.remove(); }

/* Knowledge Base Search */
async function searchKnowledgeBase(keyword) {
    try {
        const response = await fetch(`${KNOWLEDGE_API_BASE}/search?keyword=${encodeURIComponent(keyword)}&maxResults=3`);
        if (!response.ok) {
            console.warn('[Agent] Knowledge base search request failed:', response.status);
            return '';
        }
        const data = await response.json();
        if (data.success && data.hasContext && data.context) {
            console.log('[Agent] ✅ Found relevant knowledge base content');
            return data.context;
        }
        return '';
    } catch (error) {
        console.warn('[Agent] Knowledge base search exception:', error);
        return '';
    }
}

/* Ollama Message Sending */
async function sendOllamaMessage(systemPrompt, text, session) {
    const ollamaMessages = [{ role: 'system', content: systemPrompt }];
    session.messages.forEach(m => {
        if (m.role === 'user') ollamaMessages.push({ role: 'user', content: m.content || '[Image]' });
        else ollamaMessages.push({ role: 'assistant', content: m.content });
    });

    const requestBody = {
        model: currentModel,
        messages: ollamaMessages,
        stream: true,
        options: { temperature: 0.7, num_predict: 2048 }
    };

    const hasImagesInHistory = session.messages.some(m => m.images && m.images.length > 0);
    if (hasImagesInHistory) {
        requestBody.images = [];
        session.messages.forEach(m => {
            if (m.images) m.images.forEach(img => {
                requestBody.images.push(img.startsWith('data:') ? img.split(',')[1] : img);
            });
        });
    }

    console.log('[Agent] 🚀 Calling Ollama API via backend...');
    console.log('[Agent] 📤 Request URL:', `${KNOWLEDGE_API_BASE}/ollama/chat`);
    console.log('[Agent] 📝 Message count:', ollamaMessages.length);

    const response = await fetch(`${KNOWLEDGE_API_BASE}/ollama/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify(requestBody)
    });

    console.log('[Agent] 📥 Response status:', response.status);
    console.log('[Agent] 📋 Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[Agent] ❌ Ollama API Error:', errorText);
        throw new Error(`Ollama API ${response.status}: ${errorText}`);
    }

    hideAILoading();
    const tempId = 'msg-' + Date.now();
    appendMessage('assistant', '', tempId);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiReply = '';
    let buffer = '';
    let chunkCount = 0;

    console.log('[Agent] ⏳ Starting stream read...');

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            console.log('[Agent] ✅ Stream read complete');
            break;
        }

        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        console.log(`[Agent] 📦 Chunk #${chunkCount}:`, chunk.length > 100 ? chunk.substring(0, 100) + '...' : chunk);

        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (!trimmedLine) continue;

            console.log(`[Agent] 🔍 Processing line:`, trimmedLine.length > 80 ? trimmedLine.substring(0, 80) + '...' : trimmedLine);

            if (trimmedLine === 'data:[DONE]' || trimmedLine === 'data: [DONE]') {
                console.log('[Agent] 🏁 Received end marker');
                continue;
            }

            if (trimmedLine.startsWith('data:')) {
                const data = trimmedLine.substring(5).trim();
                console.log('[Agent] 📄 Data:', data.length > 80 ? data.substring(0, 80) + '...' : data);

                if (data === '[DONE]') {
                    console.log('[Agent] 🏁 Received [DONE]');
                    continue;
                }

                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData.error) {
                        console.error('[Agent] ❌ API returned error:', jsonData.error);
                        aiReply += `\n\n❌ Error: ${jsonData.error}`;
                        updateMessage(tempId, aiReply);
                        continue;
                    }
                } catch (e) {
                    // 不是 JSON，直接作为文本内容处理
                }

                aiReply += data;
                updateMessage(tempId, aiReply);
                console.log('[Agent] ✍️ Cumulative reply length:', aiReply.length);
            }
        }
    }

    if (buffer.trim()) {
        console.log('[Agent] 📝 Processing remaining buffer:', buffer);
    }

    session.messages.push({ role: 'assistant', content: aiReply });
    saveSessions();
}

/* DeepSeek Message Sending */
async function sendDeepSeekMessage(systemPrompt, text, session) {
    const messages = [{ role: 'system', content: systemPrompt }];
    session.messages.forEach(m => {
        if (m.role === 'user') messages.push({ role: 'user', content: m.content || '[Image]' });
        else messages.push({ role: 'assistant', content: m.content });
    });

    const requestBody = {
        messages: messages,
        stream: true
    };

    console.log('[Agent] 🚀 Calling DeepSeek API...');
    console.log('[Agent] 📤 Request URL:', `${KNOWLEDGE_API_BASE}/deepseek/chat`);
    console.log('[Agent] 📝 Message count:', messages.length);

    try {
        const response = await fetch(`${KNOWLEDGE_API_BASE}/deepseek/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abortController.signal,
            body: JSON.stringify(requestBody)
        });

        console.log('[Agent] 📥 Response status:', response.status);
        console.log('[Agent] 📋 Content-Type:', response.headers.get('content-type'));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Agent] ❌ DeepSeek API Error:', errorText);
            throw new Error(`DeepSeek API ${response.status}: ${errorText}`);
        }

        hideAILoading();
        const tempId = 'msg-' + Date.now();
        appendMessage('assistant', '', tempId);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiReply = '';
        let buffer = '';
        let chunkCount = 0;

        console.log('[Agent] ⏳ Starting stream read...');

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('[Agent] ✅ Stream read complete');
                break;
            }

            chunkCount++;
            const chunk = decoder.decode(value, { stream: true });
            console.log(`[Agent] 📦 Chunk #${chunkCount}:`, chunk.length > 100 ? chunk.substring(0, 100) + '...' : chunk);

            buffer += chunk;

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();

                if (!trimmedLine) continue;

                console.log(`[Agent] 🔍 Processing line:`, trimmedLine.length > 80 ? trimmedLine.substring(0, 80) + '...' : trimmedLine);

                if (trimmedLine === 'data:[DONE]' || trimmedLine === 'data: [DONE]') {
                    console.log('[Agent] 🏁 Received end marker');
                    continue;
                }

                if (trimmedLine.startsWith('data:')) {
                    const jsonStr = trimmedLine.substring(5).trim();
                    console.log('[Agent] 📄 JSON data:', jsonStr.length > 80 ? jsonStr.substring(0, 80) + '...' : jsonStr);

                    try {
                        const data = JSON.parse(jsonStr);

                        if (data.error) {
                            console.error('[Agent] ❌ API returned error:', data.error);
                            aiReply += `\n\n❌ Error: ${data.error}`;
                            updateMessage(tempId, aiReply);
                            continue;
                        }

                        if (data.choices && data.choices[0]?.delta?.content) {
                            const delta = data.choices[0].delta.content;
                            aiReply += delta;
                            updateMessage(tempId, aiReply);
                            console.log('[Agent] ✍️ Cumulative reply length:', aiReply.length);
                        }
                    } catch (parseError) {
                        console.warn('[Agent] ⚠️ JSON parse failed:', parseError.message, '| Raw data:', jsonStr);
                    }
                }
            }
        }

        if (buffer.trim()) {
            console.log('[Agent] 📝 Processing remaining buffer:', buffer);
        }

        session.messages.push({ role: 'assistant', content: aiReply });
        saveSessions();
        console.log('[Agent] ✅ DeepSeek response complete, total length:', aiReply.length, 'characters');
    } catch (err) {
        console.error('[Agent] ❌ DeepSeek request exception:', err);
        hideAILoading();
        if (err.name !== 'AbortError') {
            session.messages.push({ role: 'assistant', content: 'Sorry, connection failed, please try again later.' });
            appendMessage('assistant', 'Sorry, connection failed, please try again later.');
            saveSessions();
        }
    }
}

/* Message Sending and Streaming Reception */
async function sendMessage() {
    const text = agentInput.value.trim();
    if ((!text && pendingImages.length === 0) || isTyping) return;

    const session = getCurrentSession();
    if (!session) return;

    abortController = new AbortController();
    isTyping = true;
    agentSendBtn.disabled = true;

    if (session.messages.length === 0 && text) {
        session.title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
        renderChatList();
        chatTitleEl.textContent = session.title;
    }

    if (pendingImages.length > 0) {
        appendMessageWithImages('user', text, pendingImages.map(p => p.base64));
    } else {
        appendMessage('user', text);
    }

    session.messages.push({ role: 'user', content: text, images: pendingImages.map(p => p.base64) });
    saveSessions();

    agentInput.value = '';
    agentInput.style.height = 'auto';
    clearPendingImages();

    showAILoading();
    agentWelcome.style.display = 'none';

    try {
        let enhancedSystemPrompt = SYSTEM_PROMPT;

        if (text && text.trim()) {
            const knowledgeContext = await searchKnowledgeBase(text);
            if (knowledgeContext) {
                enhancedSystemPrompt += knowledgeContext;
            }
        }

        const currentModelConfig = AVAILABLE_MODELS.find(m => m.id === currentModel);
        const isDeepSeek = currentModelConfig && currentModelConfig.type === 'deepseek';

        if (isDeepSeek) {
            await sendDeepSeekMessage(enhancedSystemPrompt, text, session);
        } else {
            await sendOllamaMessage(enhancedSystemPrompt, text, session);
        }
    } catch (err) {
        hideAILoading();
        if (err.name !== 'AbortError') {
            session.messages.push({ role: 'assistant', content: 'Sorry, connection failed, please try again later.' });
            appendMessage('assistant', 'Sorry, connection failed, please try again later.');
            saveSessions();
        }
    } finally {
        isTyping = false;
        abortController = null;
        agentSendBtn.disabled = !agentInput.value.trim() && pendingImages.length === 0;
    }
}

function appendMessage(role, content, messageId = null, scroll = true) {
    const isUser = role === 'user';
    const group = document.createElement('div');
    group.className = `msg-group ${isUser ? 'user-group' : ''}`;
    const avatarClass = isUser ? 'user-avatar-icon' : 'agent-avatar-icon';
    const avatarContent = isUser ? 'Me' : '<i class="fas fa-robot"></i>';
    const bubbleClass = isUser ? 'msg-bubble-user' : 'msg-bubble-agent';
    const name = isUser ? 'You' : 'Treehole AI';
    group.innerHTML = `<div class="msg-group-avatar ${avatarClass}">${avatarContent}</div><div class="msg-group-body"><div class="msg-group-name">${name}</div><div class="${bubbleClass}" ${messageId ? `id="${messageId}"` : ''}>${formatContent(content)}</div></div>`;
    agentMessages.appendChild(group);
    if (scroll) agentMessages.scrollTop = agentMessages.scrollHeight;
}

function appendMessageWithImages(role, text, imageUrls) {
    const isUser = role === 'user';
    const group = document.createElement('div');
    group.className = `msg-group ${isUser ? 'user-group' : ''}`;
    const avatarClass = isUser ? 'user-avatar-icon' : 'agent-avatar-icon';
    const avatarContent = isUser ? 'Me' : '<i class="fas fa-robot"></i>';
    const bubbleClass = isUser ? 'msg-bubble-user' : 'msg-bubble-agent';
    const name = isUser ? 'You' : 'Treehole AI';
    let bodyHtml = `<div class="msg-group-name">${name}</div><div class="${bubbleClass}">`;
    if (text) bodyHtml += formatContent(text);
    if (imageUrls && imageUrls.length > 0) {
        bodyHtml += `<div class="msg-image-grid">`;
        imageUrls.forEach(url => { bodyHtml += `<img src="${url}" alt="Picture">`; });
        bodyHtml += `</div>`;
    }
    bodyHtml += `</div>`;
    group.innerHTML = `<div class="msg-group-avatar ${avatarClass}">${avatarContent}</div><div class="msg-group-body">${bodyHtml}</div>`;
    agentMessages.appendChild(group);
    agentMessages.scrollTop = agentMessages.scrollHeight;
}

function updateMessage(messageId, content) {
    const el = document.getElementById(messageId);
    if (el) { el.innerHTML = formatContent(content); agentMessages.scrollTop = agentMessages.scrollHeight; }
}

/* Event Binding */
agentInput.addEventListener('input', () => {
    agentSendBtn.disabled = !agentInput.value.trim() && pendingImages.length === 0 || isTyping;
    agentInput.style.height = 'auto';
    agentInput.style.height = Math.min(agentInput.scrollHeight, 160) + 'px';
});

agentInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

agentSendBtn.addEventListener('click', sendMessage);

document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('click', () => { agentInput.value = card.dataset.prompt; agentSendBtn.disabled = false; sendMessage(); });
});

document.getElementById('newChatBtn').addEventListener('click', () => { if (!isTyping) createNewSession(); });

document.getElementById('clearChatBtn').addEventListener('click', () => {
    if (isTyping) return;
    const s = getCurrentSession();
    if (s) { s.messages = []; s.title = 'New Chat'; saveSessions(); renderCurrentSession(); renderChatList(); }
    clearPendingImages();
});

document.getElementById('uploadImageBtn').addEventListener('click', () => document.getElementById('imageInput').click());

document.getElementById('imageInput').addEventListener('change', e => {
    Array.from(e.target.files).forEach(file => addPendingImage(file));
    e.target.value = '';
});

initModelChips();
loadSessions();