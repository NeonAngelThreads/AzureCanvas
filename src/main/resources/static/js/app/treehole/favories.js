document.addEventListener("DOMContentLoaded", () => {
    Store.init();

    // Tab 切换
    document.querySelectorAll(".fav-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".fav-tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".fav-section").forEach(s => s.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
        });
    });

    // 根据 URL hash 激活对应 tab
    const hash = location.hash.replace("#", "");
    if (hash) {
        const target = document.querySelector(`.fav-tab[data-tab="${hash}"]`);
        if (target) target.click();
    }

    function formatTime(ts) {
        const diff = Date.now() - ts;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
        if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
        const d = new Date(ts);
        return `${d.getMonth()+1}/${d.getDate()}`;
    }

    function renderPostCard(post, actions) {
        const imgHtml = post.images && post.images.length
            ? `<div class="post-images">${post.images.map(u => `<img src="${u}" alt="">`).join("")}</div>`
            : "";
        const commentCount = post.comments ? post.comments.length : 0;
        return `
      <div class="post-card" style="cursor:default">
        <div class="post-header">
          <div class="avatar">${Render.escapeHtml(post.avatarLetter || "A")}</div>
          <div class="post-meta">
            <span class="post-author">${Render.escapeHtml(post.author)}</span>
            <span class="post-time">${formatTime(post.timestamp)}</span>
          </div>
        </div>
        <div class="post-body">${Render.escapeHtml(post.content)}</div>
        ${imgHtml}
        <div class="post-actions">
          <span class="action-btn"><i class="fas fa-heart"></i> ${post.likes || 0}</span>
          <span class="action-btn"><i class="far fa-comment"></i> ${commentCount}</span>
          ${actions}
        </div>
      </div>`;
    }

    // ===== My Collections =====
    (function() {
        const posts = Store.getCollectedPosts();
        document.getElementById("favCount").textContent = `Total ${posts.length} posts`;
        const listEl = document.getElementById("favList");
        if (posts.length === 0) {
            listEl.innerHTML = `<div class="fav-empty"><i class="far fa-bookmark"></i>No posts collected yet</div>`;
            return;
        }
        listEl.innerHTML = posts.map(post => renderPostCard(post,
            `<button class="action-btn collected" data-id="${post.id}"><i class="fas fa-bookmark"></i> Remove</button>`
        )).join("");
        listEl.querySelectorAll("[data-id]").forEach(btn => {
            btn.addEventListener("click", () => {
                Store.toggleCollect(btn.dataset.id);
                btn.closest(".post-card").style.opacity = "0.4";
                btn.innerHTML = "Removed";
                btn.disabled = true;
            });
        });
    })();

    // ===== My Likes =====
    (function() {
        const posts = Store.posts.filter(p => p.liked);
        document.getElementById("likesCount").textContent = `Total ${posts.length} posts`;
        const listEl = document.getElementById("likesList");
        if (posts.length === 0) {
            listEl.innerHTML = `<div class="fav-empty"><i class="far fa-heart"></i>No posts liked yet</div>`;
            return;
        }
        listEl.innerHTML = posts.map(post => renderPostCard(post,
            `<button class="action-btn liked" data-like-id="${post.id}"><i class="fas fa-heart"></i> Unlike</button>`
        )).join("");
        listEl.querySelectorAll("[data-like-id]").forEach(btn => {
            btn.addEventListener("click", () => {
                Store.toggleLike(btn.dataset.likeId);
                btn.closest(".post-card").style.opacity = "0.4";
                btn.innerHTML = "Removed";
                btn.disabled = true;
            });
        });
    })();

    // ===== My Following =====
    (async function() {
        const listEl = document.getElementById("followingList");
        const users = await Store.fetchFollowingFromApi();
        document.getElementById("followingCount").textContent = `Total ${users.length} users`;
        if (users.length === 0) {
            listEl.innerHTML = `<div class="fav-empty"><i class="fas fa-user-friends"></i>Not following anyone yet</div>`;
            return;
        }
        listEl.innerHTML = users.map(u => `
      <div class="following-card">
        <div class="following-card-avatar" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fad0c4 100%); color: #fff;">${Render.escapeHtml(u.username ? u.username.substring(0, 1) : (u.avatarLetter || "U"))}</div>
        <div class="following-card-info">
          <div class="following-card-name">${Render.escapeHtml(u.username || u.nickname || "User")}</div>
          <div class="following-card-meta">ID: ${u.userId || u.id}</div>
        </div>
        <button class="unfollow-btn" data-uid="${u.userId || u.id}">Unfollow</button>
      </div>`).join("");
        listEl.querySelectorAll(".unfollow-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                await Store.unfollowUser(btn.dataset.uid);
                const card = btn.closest(".following-card");
                card.style.opacity = "0.4";
                btn.textContent = "Removed";
                btn.disabled = true;
            });
        });
    })();

    // ===== Comment Replies =====
    (function() {
        const notifications = Store.notifications.filter(n => n.type === "reply");
        const unread = notifications.filter(n => !n.read).length;
        const countEl = document.getElementById("commentsCount");
        countEl.textContent = `Total ${notifications.length} notifications${unread > 0 ? `, ${unread} unread` : ""}`;
        const badge = document.getElementById("commentBadge");
        if (unread > 0) {
            badge.style.display = "inline-block";
            badge.textContent = unread > 99 ? "…" : unread;
        }
        const listEl = document.getElementById("commentsList");
        if (notifications.length === 0) {
            listEl.innerHTML = `<div class="fav-empty"><i class="far fa-comment-dots"></i>No comment replies yet</div>`;
        } else {
            listEl.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.read ? "" : "unread"}">
          <div class="notif-header">
            <div class="notif-icon"><i class="fas fa-comment-dots"></i></div>
            <span class="notif-type-tag">Comment Reply</span>
            ${!n.read ? '<span class="notif-dot"></span>' : ""}
            <span class="notif-meta">${formatTime(n.timestamp)}</span>
          </div>
          <div class="notif-content">${Render.escapeHtml(n.content)}</div>
          ${n.postId ? `<button class="notif-link" data-post-id="${n.postId}">View Post →</button>` : ""}
        </div>`).join("");
        }
        document.getElementById("markCommentsRead").addEventListener("click", () => {
            Store.markAllRead("reply");
            badge.style.display = "none";
            listEl.querySelectorAll(".notif-item").forEach(el => {
                el.classList.remove("unread");
                el.querySelector(".notif-dot")?.remove();
            });
            countEl.textContent = `Total ${notifications.length} notifications`;
        });
    })();

    // ===== Message Replies =====
    (function() {
        const threads = Object.values(Store.messages);
        const msgBadge = document.getElementById("msgBadge");
        document.getElementById("messagesCount").textContent = `Total ${threads.length} conversations`;
        const listEl = document.getElementById("messagesList");
        if (threads.length === 0) {
            listEl.innerHTML = `<div class="fav-empty"><i class="far fa-envelope"></i>No message history yet</div>`;
            msgBadge.style.display = "none";
            return;
        }
        // 统计有新消息的会话（最后一条不是自己发的）
        const myId = Store.currentUser.id;
        const unreadThreads = threads.filter(t => {
            const msgs = t.messages;
            return msgs.length > 0 && msgs[msgs.length - 1].from !== myId;
        });
        if (unreadThreads.length > 0) {
            msgBadge.style.display = "inline-block";
            msgBadge.textContent = unreadThreads.length > 99 ? "…" : unreadThreads.length;
        }
        listEl.innerHTML = threads.map(t => {
            const msgs = t.messages;
            const last = msgs.length > 0 ? msgs[msgs.length - 1] : null;
            const hasNew = last && last.from !== myId;
            return `
        <div class="msg-thread-item" data-uid="${t.withUser.id}" data-name="${Render.escapeHtml(t.withUser.nickname)}" data-avatar="${Render.escapeHtml(t.withUser.avatarLetter || "U")}">
          <div class="msg-thread-avatar">
            ${Render.escapeHtml(t.withUser.avatarLetter || "U")}
            ${hasNew ? '<span class="msg-thread-unread-dot"></span>' : ""}
          </div>
          <div class="msg-thread-info">
            <div class="msg-thread-name">${Render.escapeHtml(t.withUser.nickname)}</div>
            <div class="msg-thread-preview">${last ? Render.escapeHtml(last.text.slice(0, 30)) : "No messages yet"}</div>
          </div>
          <div class="msg-thread-time">${last ? formatTime(last.timestamp) : ""}</div>
        </div>`;
        }).join("");
        listEl.querySelectorAll(".msg-thread-item").forEach(item => {
            item.addEventListener("click", () => {
                sessionStorage.setItem("th_open_chat", JSON.stringify({
                    uid: item.dataset.uid,
                    name: item.dataset.name,
                    avatar: item.dataset.avatar
                }));
                window.location.href = "index.html";
            });
        });
    })();
});