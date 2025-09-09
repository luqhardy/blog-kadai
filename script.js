document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const blogTableBody = document.querySelector('#blog-table tbody');
    const tagTableBody = document.querySelector('#tag-table tbody');
    const tagSearchSelect = document.getElementById('tag-search-select');
    const tagSearchButton = document.getElementById('tag-search-button');

    // New/Edit Post Modal Elements
    const newPostModal = document.getElementById('new-post-modal');
    const newPostButton = document.getElementById('new-post-button');
    const cancelNewPost = document.getElementById('cancel-new-post');
    const newPostForm = document.getElementById('new-post-form');
    const newTitle = document.getElementById('new-title');
    const newContent = document.getElementById('new-content');
    const newPostError = document.getElementById('new-post-error');

    const editPostModal = document.getElementById('edit-post-modal');
    const editPostForm = document.getElementById('edit-post-form');
    const editTitle = document.getElementById('edit-title');
    const editContent = document.getElementById('edit-content');
    const cancelEditPost = document.getElementById('cancel-edit-post');
    const editPostError = document.getElementById('edit-post-error');

    // Tag Management Modal Elements
    const addTagForm = document.getElementById('add-tag-form');
    const newTagName = document.getElementById('new-tag-name');
    const editTagModal = document.getElementById('edit-tag-modal');
    const editTagForm = document.getElementById('edit-tag-form');
    const editTagName = document.getElementById('edit-tag-name');
    const cancelEditTag = document.getElementById('cancel-edit-tag');
    const editTagError = document.getElementById('edit-tag-error');

    // --- State Variables ---
    let editingPostId = null;
    let editingTagId = null;

    // --- Data Loading Functions ---

    async function loadBlogList(tagId = '') {
        try {
            const url = tagId ? `posts.php?tag_id=${encodeURIComponent(tagId)}` : 'posts.php';
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const posts = await response.json();

            blogTableBody.innerHTML = '';
            if (!Array.isArray(posts)) {
                blogTableBody.innerHTML = '<tr><td colspan="4" style="color:red;">ブログデータの形式が正しくありません。</td></tr>';
                console.error('Invalid API response for posts:', posts);
                return;
            }
            if (posts.length === 0) {
                blogTableBody.innerHTML = '<tr><td colspan="4">投稿はまだありません。</td></tr>';
                return;
            }
            posts.forEach(post => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${post.title || ''}</td>
                    <td>${post.content || ''}</td>
                    <td>${post.created_at || ''}</td>
                    <td>
                        <button class="edit-btn" data-id="${post.id}">編集</button>
                        <button class="delete-btn" data-id="${post.id}">削除</button>
                    </td>
                `;
                blogTableBody.appendChild(tr);
            });
        } catch (error) {
            blogTableBody.innerHTML = '<tr><td colspan="4" style="color:red;">ブログ一覧の読み込みに失敗しました。</td></tr>';
            console.error('ブログ一覧の読み込みに失敗しました:', error);
        }
    }

    async function loadTagList() {
        try {
            const response = await fetch('tags.php');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const tags = await response.json();

            tagTableBody.innerHTML = '';
            tagSearchSelect.innerHTML = '<option value="">タグで絞り込み</option>';

            if (!Array.isArray(tags)) {
                tagTableBody.innerHTML = '<tr><td colspan="2" style="color:red;">タグデータの形式が正しくありません。</td></tr>';
                console.error('Invalid API response for tags:', tags);
                return;
            }

            tags.forEach(tag => {
                // Populate tag management table
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${tag.name || ''}</td>
                    <td>
                        <button class="edit-tag-btn" data-id="${tag.id}" data-name="${tag.name}">編集</button>
                        <button class="delete-tag-btn" data-id="${tag.id}">削除</button>
                    </td>
                `;
                tagTableBody.appendChild(tr);

                // Populate tag search dropdown
                const option = document.createElement('option');
                option.value = tag.id;
                option.textContent = tag.name;
                tagSearchSelect.appendChild(option);
            });
        } catch (error) {
            tagTableBody.innerHTML = '<tr><td colspan="2" style="color:red;">タグ一覧の読み込みに失敗しました。</td></tr>';
            console.error('タグ一覧の読み込みに失敗しました:', error);
        }
    }

    // --- Event Listeners ---

    // New Post Modal
    newPostButton.addEventListener('click', () => {
        newPostForm.reset();
        newPostError.textContent = '';
        newPostModal.style.display = 'flex';
    });

    cancelNewPost.addEventListener('click', () => {
        newPostModal.style.display = 'none';
    });

    newPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        newPostError.textContent = '';
        const formData = new FormData(newPostForm);
        const title = formData.get('title').trim();
        const content = formData.get('content').trim();

        if (!title || !content) {
            newPostError.textContent = 'タイトルと本文は必須です。';
            return;
        }

        try {
            const response = await fetch('add_post.php', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success) {
                newPostModal.style.display = 'none';
                loadBlogList();
            } else {
                newPostError.textContent = result.error || '投稿に失敗しました。';
            }
        } catch (error) {
            newPostError.textContent = '通信エラーが発生しました。';
            console.error('Error submitting new post:', error);
        }
    });

    // Blog Table Buttons (Edit/Delete)
    blogTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            try {
                const response = await fetch(`posts.php?id=${id}`);
                const post = await response.json();
                if (post && post.id) {
                    editingPostId = post.id;
                    editTitle.value = post.title;
                    editContent.value = post.content;
                    editPostError.textContent = '';
                    editPostModal.style.display = 'flex';
                } else {
                    alert('投稿データの取得に失敗しました。');
                }
            } catch (error) {
                alert('投稿データの取得中にエラーが発生しました。');
                console.error('Error fetching post for edit:', error);
            }
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('本当にこの投稿を削除しますか？')) {
                try {
                    const formData = new FormData();
                    formData.append('id', id);
                    const response = await fetch('delete_post.php', { method: 'POST', body: formData });
                    const result = await response.json();
                    if (result.success) {
                        loadBlogList();
                    } else {
                        alert(result.error || '削除に失敗しました。');
                    }
                } catch (error) {
                    alert('通信エラーが発生しました。');
                    console.error('Error deleting post:', error);
                }
            }
        }
    });

    // Edit Post Modal
    cancelEditPost.addEventListener('click', () => {
        editPostModal.style.display = 'none';
    });

    editPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        editPostError.textContent = '';
        const formData = new FormData(editPostForm);
        formData.append('id', editingPostId);
        const title = formData.get('title').trim();
        const content = formData.get('content').trim();

        if (!title || !content) {
            editPostError.textContent = 'タイトルと本文は必須です。';
            return;
        }

        try {
            const response = await fetch('edit_post.php', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success) {
                editPostModal.style.display = 'none';
                loadBlogList();
            } else {
                editPostError.textContent = result.error || '編集に失敗しました。';
            }
        } catch (error) {
            editPostError.textContent = '通信エラーが発生しました。';
            console.error('Error submitting edited post:', error);
        }
    });


    // --- Tag Management Event Listeners ---

    addTagForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = newTagName.value.trim();
        if (!name) return;

        try {
            const formData = new FormData();
            formData.append('action', 'add');
            formData.append('name', name);
            const response = await fetch('tags.php', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success) {
                newTagName.value = '';
                loadTagList(); // Reload tags in table and dropdown
            } else {
                alert(result.error || 'タグの追加に失敗しました。');
            }
        } catch (error) {
            alert('通信エラーが発生しました。');
            console.error('Error adding tag:', error);
        }
    });

    tagTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('edit-tag-btn')) {
            editingTagId = id;
            editTagName.value = target.dataset.name;
            editTagError.textContent = '';
            editTagModal.style.display = 'flex';
        }

        if (target.classList.contains('delete-tag-btn')) {
            if (confirm('本当にこのタグを削除しますか？')) {
                try {
                    const formData = new FormData();
                    formData.append('action', 'delete');
                    formData.append('id', id);
                    const response = await fetch('tags.php', { method: 'POST', body: formData });
                    const result = await response.json();
                    if (result.success) {
                        loadTagList();
                        loadBlogList(); // Refresh blog list in case posts were associated with the tag
                    } else {
                        alert(result.error || 'タグの削除に失敗しました。');
                    }
                } catch (error) {
                    alert('通信エラーが発生しました。');
                    console.error('Error deleting tag:', error);
                }
            }
        }
    });

    cancelEditTag.addEventListener('click', () => {
        editTagModal.style.display = 'none';
    });

    editTagForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        editTagError.textContent = '';
        const name = editTagName.value.trim();
        if (!name) {
            editTagError.textContent = 'タグ名は必須です。';
            return;
        }

        try {
            const formData = new FormData();
            formData.append('action', 'edit');
            formData.append('id', editingTagId);
            formData.append('name', name);
            const response = await fetch('tags.php', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success) {
                editTagModal.style.display = 'none';
                loadTagList();
            } else {
                editTagError.textContent = result.error || 'タグの編集に失敗しました。';
            }
        } catch (error) {
            editTagError.textContent = '通信エラーが発生しました。';
            console.error('Error editing tag:', error);
        }
    });

    // Tag Search
    tagSearchButton.addEventListener('click', () => {
        loadBlogList(tagSearchSelect.value);
    });

    // --- Initial Load ---
    loadBlogList();
    loadTagList();
});