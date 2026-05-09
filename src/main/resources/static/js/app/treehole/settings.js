document.addEventListener("DOMContentLoaded", () => {
    Store.init();
    const u = Store.currentUser;

    // Fetch latest user info from API (including avatar)
    (async function fetchAndApplyUserInfo() {
        try {
            const res = await fetch("/api/users/me", { credentials: "include" });
            if (res.ok) {
                const apiUser = await res.json();

                // Process avatar URL: supports avatar field (UUID format)
                let avatarUrl = null;
                if (apiUser.avatar || apiUser.avatarUrl) {
                    const rawAvatar = apiUser.avatar || apiUser.avatarUrl;
                    // If already a complete URL, use directly
                    if (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('/')) {
                        avatarUrl = rawAvatar;
                    } else {
                        // Assume UUID format, convert to /resources/{uuid}
                        avatarUrl = '/resources/' + rawAvatar;
                    }
                }

                // Update user info in Store
                Store.updateUser({
                    id: apiUser.userId || apiUser.id,
                    nickname: apiUser.username || apiUser.nickname || u.nickname,
                    avatarUrl: avatarUrl,
                    avatarLetter: apiUser.username ? apiUser.username.substring(0, 1) : u.avatarLetter,
                    uuid: apiUser.userId || apiUser.id
                });

                // If avatar URL exists, update preview avatar display
                if (avatarUrl) {
                    const previewAvatarEl = document.getElementById("previewAvatar");
                    previewAvatarEl.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.parentElement.textContent='${Store.currentUser.avatarLetter || 'U'}';this.parentElement.style.background='${u.avatarColor || '#555'}'">`;
                    previewAvatarEl.style.background = "transparent";
                }
            }
        } catch (e) {
            console.warn("Failed to fetch user info:", e);
        }

        // Initialize form and preview
        initFormAndPreview();
    })();

    function initFormAndPreview() {

        // Fill form
        document.getElementById("inputNickname").value = u.nickname || "";
        document.getElementById("inputGender").value = u.gender || "";
        document.getElementById("inputAge").value = u.age || "";
        document.getElementById("inputBio").value = u.bio || "";
        document.getElementById("inputLocation").value = u.location || "";
        document.getElementById("inputAvatarLetter").value = u.avatarLetter || "";
        document.getElementById("inputUserId").value = u.id || "me";

        // Stats
        const myPosts = Store.posts.filter(p => p.authorId === u.id);
        document.getElementById("statPosts").textContent = myPosts.length;
        document.getElementById("statFollowing").textContent = Store.getFollowedUsers().length;
        document.getElementById("statLikes").textContent = myPosts.reduce((s, p) => s + (p.likes || 0), 0);

        // Color picker
        const COLORS = ["#333","#555","#777","#2d6a4f","#1d3557","#6d2b3d","#7b4f12","#444"];
        const colorPicker = document.getElementById("avatarColorPicker");
        colorPicker.innerHTML = COLORS.map(c => `
    <span class="color-dot ${u.avatarColor === c ? "selected" : ""}" data-color="${c}" style="background:${c}"></span>
  `).join("");
        colorPicker.querySelectorAll(".color-dot").forEach(dot => {
            dot.addEventListener("click", () => {
                colorPicker.querySelectorAll(".color-dot").forEach(d => d.classList.remove("selected"));
                dot.classList.add("selected");
                updatePreview();
            });
        });

        // Live preview
        function updatePreview() {
            const letter = document.getElementById("inputAvatarLetter").value.trim().slice(0,1)
                || document.getElementById("inputNickname").value.trim().slice(0,1) || "U";
            const color = colorPicker.querySelector(".color-dot.selected")?.dataset.color || u.avatarColor || "#555";
            const name = document.getElementById("inputNickname").value.trim() || "My Treehole";
            const bio = document.getElementById("inputBio").value.trim() || "This person is mysterious and left nothing";
            const gender = document.getElementById("inputGender").value;
            const age = document.getElementById("inputAge").value;
            const location = document.getElementById("inputLocation").value.trim();

            document.getElementById("previewAvatar").textContent = letter;
            document.getElementById("previewAvatar").style.background = color;
            document.getElementById("previewName").textContent = name;
            document.getElementById("previewBio").textContent = bio;

            const metaItems = [];
            if (gender) metaItems.push(`<div class="profile-meta-item"><i class="fas fa-${gender==="male"?"mars":gender==="female"?"venus":"genderless"}"></i> ${gender==="male"?"Male":gender==="female"?"Female":"Other"}</div>`);
            if (age) metaItems.push(`<div class="profile-meta-item"><i class="fas fa-birthday-cake"></i> ${age} years old</div>`);
            if (location) metaItems.push(`<div class="profile-meta-item"><i class="fas fa-map-marker-alt"></i> ${location}</div>`);
            document.getElementById("profileMetaList").innerHTML = metaItems.join("");
        }

        ["inputNickname","inputBio","inputAge","inputLocation","inputAvatarLetter"].forEach(id => {
            document.getElementById(id).addEventListener("input", updatePreview);
        });
        document.getElementById("inputGender").addEventListener("change", updatePreview);
        updatePreview();

    } // end initFormAndPreview

    // Tab switching
    document.querySelectorAll(".settings-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".settings-tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".settings-section").forEach(s => s.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
        });
    });

    // Appearance: theme switching
    document.querySelectorAll(".theme-option").forEach(opt => {
        opt.addEventListener("click", () => {
            document.querySelectorAll(".theme-option").forEach(o => o.classList.remove("active"));
            opt.classList.add("active");
            localStorage.setItem("th_theme", opt.dataset.theme);
        });
    });
    const savedTheme = localStorage.getItem("th_theme") || "light";
    document.querySelector(`.theme-option[data-theme="${savedTheme}"]`)?.classList.add("active");
    document.querySelector(`.theme-option:not([data-theme="${savedTheme}"])`)?.classList.remove("active");

    // Appearance: font size
    const fontRange = document.getElementById("fontSizeRange");
    const fontVal = document.getElementById("fontSizeVal");
    const savedFont = localStorage.getItem("th_font_size") || "17";
    fontRange.value = savedFont;
    fontVal.textContent = savedFont + "px";
    fontRange.addEventListener("input", () => {
        fontVal.textContent = fontRange.value + "px";
        localStorage.setItem("th_font_size", fontRange.value);
    });

    // Account: clear data
    document.getElementById("clearDataBtn").addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all local data? This action cannot be undone!")) {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        }
    });

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("th_user");
            sessionStorage.clear();
            window.location.href = "index.html";
        }
    });

    // Save
    document.getElementById("saveSettingsBtn").addEventListener("click", () => {
        const nickname = document.getElementById("inputNickname").value.trim();
        if (!nickname) { window.notify.show.show("Nickname cannot be empty", 'error'); return; }
        const avatarLetter = document.getElementById("inputAvatarLetter").value.trim().slice(0,1) || nickname.slice(0,1);
        const avatarColor = colorPicker.querySelector(".color-dot.selected")?.dataset.color || u.avatarColor || "#555";
        Store.updateUser({
            nickname, avatarLetter, avatarColor,
            gender: document.getElementById("inputGender").value,
            age: document.getElementById("inputAge").value,
            bio: document.getElementById("inputBio").value.trim(),
            location: document.getElementById("inputLocation").value.trim(),
        });
        // Save notification/privacy/general toggles
        const prefs = {
            notifyComment: document.getElementById("notifyComment").checked,
            notifyMsg: document.getElementById("notifyMsg").checked,
            notifyCollect: document.getElementById("notifyCollect").checked,
            dndStart: document.getElementById("dndStart").value,
            dndEnd: document.getElementById("dndEnd").value,
            privacyFollowing: document.getElementById("privacyFollowing").checked,
            privacyMsg: document.getElementById("privacyMsg").checked,
            privacyComment: document.getElementById("privacyComment").checked,
            hideJunk: document.getElementById("hideJunk").checked,
            autoImg: document.getElementById("autoImg").checked,
            saveHistory: document.getElementById("saveHistory").checked,
            lang: document.getElementById("inputLang").value,
        };
        localStorage.setItem("th_prefs", JSON.stringify(prefs));
        const toast = document.getElementById("saveToast");
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
    });

    // Load saved preferences
    try {
        const prefs = JSON.parse(localStorage.getItem("th_prefs") || "{}");
        if (prefs.notifyComment !== undefined) document.getElementById("notifyComment").checked = prefs.notifyComment;
        if (prefs.notifyMsg !== undefined) document.getElementById("notifyMsg").checked = prefs.notifyMsg;
        if (prefs.notifyCollect !== undefined) document.getElementById("notifyCollect").checked = prefs.notifyCollect;
        if (prefs.dndStart) document.getElementById("dndStart").value = prefs.dndStart;
        if (prefs.dndEnd) document.getElementById("dndEnd").value = prefs.dndEnd;
        if (prefs.privacyFollowing !== undefined) document.getElementById("privacyFollowing").checked = prefs.privacyFollowing;
        if (prefs.privacyMsg !== undefined) document.getElementById("privacyMsg").checked = prefs.privacyMsg;
        if (prefs.privacyComment !== undefined) document.getElementById("privacyComment").checked = prefs.privacyComment;
        if (prefs.hideJunk !== undefined) document.getElementById("hideJunk").checked = prefs.hideJunk;
        if (prefs.autoImg !== undefined) document.getElementById("autoImg").checked = prefs.autoImg;
        if (prefs.saveHistory !== undefined) document.getElementById("saveHistory").checked = prefs.saveHistory;
        if (prefs.lang) document.getElementById("inputLang").value = prefs.lang;
    } catch(e) {}
});