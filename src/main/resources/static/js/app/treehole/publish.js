/**
 * publish.js — 发布模块
 * 管理发布弹窗：图片上传、表情插入、分类选择、提交
 * 通过 window.Publish 暴露
 * 依赖：store.js（Store）
 */
window.Publish = (function () {
  let selectedImages = [];

  // ===== DOM 引用（DOMContentLoaded 后初始化）=====
  let modal, textarea, categorySelect, imageInput, imagePreview, emojiPicker, emojiToggleBtn;

  function init() {
    modal = document.getElementById("publishModal");
    textarea = document.getElementById("postTextInput");
    categorySelect = document.getElementById("postCategorySelect");
    imageInput = document.getElementById("imageUploadInput");
    imagePreview = document.getElementById("imagePreviewContainer");
    emojiPicker = document.getElementById("emojiPicker");
    emojiToggleBtn = document.getElementById("emojiToggleBtn");

    // 图片上传
    imageInput.addEventListener("change", e => {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => {
          selectedImages.push(ev.target.result);
          const img = document.createElement("img");
          img.src = ev.target.result;
          img.className = "preview-img";
          imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
      imageInput.value = "";
    });

    // 表情切换
    emojiToggleBtn.addEventListener("click", () => {
      emojiPicker.classList.toggle("open");
    });

    // 表情插入到光标位置
    emojiPicker.querySelectorAll("span").forEach(span => {
      span.addEventListener("click", () => {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        textarea.value = val.slice(0, start) + span.textContent + val.slice(end);
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + span.textContent.length;
        emojiPicker.classList.remove("open");
      });
    });

    // 点击遮罩关闭
    modal.addEventListener("click", e => {
      if (e.target === modal) close();
    });

    // 关闭/取消按钮
    document.getElementById("closeModalBtn").addEventListener("click", close);
    document.getElementById("cancelPublishBtn").addEventListener("click", close);

    // 发布提交
    document.getElementById("submitPostBtn").addEventListener("click", submit);

    // 发布按钮 & home 输入栏
    document.getElementById("newPostBtn").addEventListener("click", open);
    document.getElementById("homeInputBar").addEventListener("click", open);
  }

  /** 打开发布弹窗 */
  function open() {
    modal.classList.add("open");
    textarea.focus();
  }

  /** 关闭并重置 */
  function close() {
    modal.classList.remove("open");
    emojiPicker.classList.remove("open");
    textarea.value = "";
    imagePreview.innerHTML = "";
    selectedImages = [];
  }

  /** 提交发布 */
  function submit() {
    const content = textarea.value.trim();
    if (!content) {
      window.notify.show.show("内容不能为空", 'error');
      return;
    }
    Store.addPost(content, categorySelect.value, [...selectedImages]);
    close();
    // 通知 main.js 刷新 feed
    document.dispatchEvent(new CustomEvent("th:postAdded"));
  }

  return { init, open, close };
})();

Store.init();

let selectedImages = [];
let selectedImageFiles = [];
let selectedCategory = "all";

const textarea = document.getElementById("postTextInput");
const charCount = document.getElementById("charCount");
const imageInput = document.getElementById("imageUploadInput");
const imagePreview = document.getElementById("imagePreviewContainer");
const emojiPicker = document.getElementById("emojiPicker");
const emojiToggleBtn = document.getElementById("emojiToggleBtn");

// Character count
textarea.addEventListener("input", () => {
  const len = textarea.value.length;
  charCount.textContent = len;
  if (len > 2000) textarea.value = textarea.value.slice(0, 2000);
});

// Category tag toggle
document.querySelectorAll(".cat-tag").forEach(tag => {
  tag.addEventListener("click", () => {
    document.querySelectorAll(".cat-tag").forEach(t => t.classList.remove("active"));
    tag.classList.add("active");
    selectedCategory = tag.dataset.cat;
  });
});

// Image upload
imageInput.addEventListener("change", e => {
  Array.from(e.target.files).forEach(file => {
    if (selectedImages.length >= 9) return;
    selectedImageFiles.push(file);
    const reader = new FileReader();
    reader.onload = ev => {
      selectedImages.push(ev.target.result);
      renderPreviews();
    };
    reader.readAsDataURL(file);
  });
  imageInput.value = "";
});

function renderPreviews() {
  imagePreview.innerHTML = selectedImages.map((src, i) => `
      <div class="preview-img-wrap">
        <img class="preview-img" src="${src}" alt="">
        <button class="preview-remove" onclick="removeImage(${i})">×</button>
      </div>
    `).join("");
}

window.removeImage = function(i) {
  selectedImages.splice(i, 1);
  selectedImageFiles.splice(i, 1);
  renderPreviews();
};

// Emoji toggle
emojiToggleBtn.addEventListener("click", () => {
  emojiPicker.classList.toggle("open");
});

emojiPicker.querySelectorAll("span").forEach(span => {
  span.addEventListener("click", () => {
    const start = textarea.selectionStart;
    const val = textarea.value;
    textarea.value = val.slice(0, start) + span.textContent + val.slice(textarea.selectionEnd);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + span.textContent.length;
    emojiPicker.classList.remove("open");
    charCount.textContent = textarea.value.length;
  });
});

// Insert text utility
window.insertText = function(before, after) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  const selected = val.slice(start, end) || "Text";
  textarea.value = val.slice(0, start) + before + selected + after + val.slice(end);
  textarea.focus();
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + selected.length;
  charCount.textContent = textarea.value.length;
};

// Insert topic tag
window.insertTopic = function(topic) {
  const pos = textarea.selectionStart;
  const val = textarea.value;
  textarea.value = val.slice(0, pos) + topic + " " + val.slice(pos);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = pos + topic.length + 1;
  charCount.textContent = textarea.value.length;
};

// Helper: delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Submit
document.getElementById("submitPostBtn").addEventListener("click", async () => {
  const title = document.getElementById("postTitle").value.trim();
  const content = textarea.value.trim();

  if (!content) {
    window.notify.show.show("Content cannot be empty", 'error');
    return;
  }

  const submitBtn = document.getElementById("submitPostBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';

  try {
    let imageUuids = [];
    if (selectedImageFiles.length > 0) {
      const formData = new FormData();
      selectedImageFiles.forEach(f => formData.append("files", f));
      const uploadRes = await fetch("/api/v1/images/upload", {
        method: "POST",
        body: formData,
        headers: {
          'X-XSRF-TOKEN': window.getCsrfToken()
        }
      });
      if (!uploadRes.ok) throw new Error("Image upload failed");
      imageUuids = await uploadRes.json();
    }

    // 1. 创建帖子
    const postRes = await fetch("/api/treeholes/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'X-XSRF-TOKEN': window.getCsrfToken()
      },
      credentials: "include",
      body: JSON.stringify({
        content,
        title: title || null,
        category: selectedCategory
      })
    });

    if (!postRes.ok) throw new Error("Post publishing failed");
    const savedPost = await postRes.json();

    // 2. 如果有图片，关联图片
    if (imageUuids.length > 0 && savedPost.id) {
      // 参考 trade.js 的延迟机制，确保后端索引同步
      await sleep(1000);

      const bindRes = await fetch(`/api/treeholes/posts/${savedPost.id}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'X-XSRF-TOKEN': window.getCsrfToken()
        },
        credentials: "include",
        body: JSON.stringify({ images: imageUuids })
      });

      if (!bindRes.ok) {
        console.warn("Image binding failed, but post was published");
      } else {
        // Binding successful, manually supplement image list for homepage display
        savedPost.imagesList = imageUuids.map(uuid => `/resources/${uuid}`);
      }
    }

    const toast = document.getElementById("toast");
    toast.classList.add("show");

    // Save to sessionStorage for homepage refresh display (optional)
    sessionStorage.setItem("th_new_post", JSON.stringify(savedPost));

    setTimeout(() => { window.location.href = "index.html"; }, 1200);

  } catch (err) {
    window.notify.show.show(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Post';
  }
});
