document.addEventListener('DOMContentLoaded', () => {
    const tagSearchSelect = document.getElementById('tag-search-select');
    const tagSearchButton = document.getElementById('tag-search-button');

    async function updateTagSearchSelect() {
        try {
            const response = await fetch('tags.php');
            const tags = await response.json();
            tagSearchSelect.innerHTML = '<option value="">タグで絞り込み</option>';
            if (Array.isArray(tags)) {
                tags.forEach(tag => {
                    const option = document.createElement('option');
                    option.value = tag.id;
                    option.textContent = tag.name;
                    tagSearchSelect.appendChild(option);
                });
            }
        } catch (error) {
            tagSearchSelect.innerHTML = '<option value="">タグ取得失敗</option>';
        }
    }
    updateTagSearchSelect();

    tagSearchButton.addEventListener('click', async () => {
        const tagId = tagSearchSelect.value;
        if (!tagId) {
            loadBlogList();
            return;
        }
        try {
            const response = await fetch('posts.php?tag_id=' + encodeURIComponent(tagId));
            const posts = await response.json();
            blogTableBody.innerHTML = '';
            if (!Array.isArray(posts)) {
                blogTableBody.innerHTML = '<tr><td colspan="4" style="color:red;">ブログデータの取得に失敗しました</td></tr>';
                console.error('APIレスポンス:', posts);
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
            blogTableBody.innerHTML = '<tr><td colspan="4" style="color:red;">ブログ一覧の読み込みに失敗しました</td></tr>';
            console.error('ブログ一覧の読み込みに失敗しました:', error);
        }
    });

    const tagTableBody = document.querySelector('#tag-table tbody');
    const addTagForm = document.getElementById('add-tag-form');
    const newTagName = document.getElementById('new-tag-name');
    const editTagModal = document.getElementById('edit-tag-modal');
    const editTagForm = document.getElementById('edit-tag-form');
    const editTagName = document.getElementById('edit-tag-name');
    const cancelEditTag = document.getElementById('cancel-edit-tag');
    const submitEditTag = document.getElementById('submit-edit-tag');
    const editTagError = document.getElementById('edit-tag-error');
    let editingTagId = null;

    async function loadTagList() {
        try {
            const response = await fetch('tags.php');
            const tags = await response.json();
            tagTableBody.innerHTML = '';
            if (!Array.isArray(tags)) {
                tagTableBody.innerHTML = '<tr><td colspan="2" style="color:red;">タグデータの取得に失敗しました</td></tr>';
                console.error('APIレスポンス:', tags);
                return;
            }
            tags.forEach(tag => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${tag.name || ''}</td>
                    <td>
                        <button class="edit-tag-btn" data-id="${tag.id}" data-name="${tag.name}">編集</button>
                        <button class="delete-tag-btn" data-id="${tag.id}">削除</button>
                    </td>
                `;
                tagTableBody.appendChild(tr);
            });
        } catch (error) {
            tagTableBody.innerHTML = '<tr><td colspan="2" style="color:red;">タグ一覧の読み込みに失敗しました</td></tr>';
            console.error('タグ一覧の読み込みに失敗しました:', error);
        }
    }

    loadTagList();

    addTagForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = newTagName.value.trim();
        if (!name) return;
        try {
            const formData = new FormData();
            formData.append('action', 'add');
            formData.append('name', name);
            const response = await fetch('tags.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                newTagName.value = '';
                loadTagList();
            } else {
                alert(result.error || 'タグ追加に失敗しました');
            }
        } catch (error) {
            alert('通信エラーが発生しました');
        }
    });

    tagTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-tag-btn')) {
            editingTagId = e.target.getAttribute('data-id');
            editTagName.value = e.target.getAttribute('data-name');
            editTagError.textContent = '';
            editTagModal.style.display = 'flex';
        }
        if (e.target.classList.contains('delete-tag-btn')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('本当に削除しますか？')) {
                const formData = new FormData();
                formData.append('action', 'delete');
                formData.append('id', id);
                fetch('tags.php', {
                    method: 'POST',
                    body: formData
                }).then(res => res.json()).then(result => {
                    if (result.success) {
                        loadTagList();
                    } else {
                        alert(result.error || 'タグ削除に失敗しました');
                    }
                }).catch(() => {
                    alert('通信エラーが発生しました');
                });
            }
        }
    });

    cancelEditTag.addEventListener('click', () => {
        editTagModal.style.display = 'none';
    });
    editTagForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = editTagName.value.trim();
        if (!editingTagId || !name) {
            editTagError.textContent = 'タグ名は必須です';
            return;
        }
        try {
            const formData = new FormData();
            formData.append('action', 'edit');
            formData.append('id', editingTagId);
            formData.append('name', name);
            const response = await fetch('tags.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                editTagModal.style.display = 'none';
                loadTagList();
            } else {
                editTagError.textContent = result.error || 'タグ編集に失敗しました';
            }
        } catch (error) {
            editTagError.textContent = '通信エラーが発生しました';
        }
    });

    blogTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('本当に削除しますか？')) {
                try {
                    const formData = new FormData();
                    formData.append('id', id);
                    const response = await fetch('delete_post.php', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    if (result.success) {
                        loadBlogList();
                    } else {
                        alert(result.error || '削除に失敗しました');
                    }
                } catch (error) {
                    alert('通信エラーが発生しました');
                }
            }
        }
    });
    // 投稿編集モーダル表示・送信
    const editPostModal = document.getElementById('edit-post-modal');
    const editTitle = document.getElementById('edit-title');
    const editContent = document.getElementById('edit-content');
    const editPostForm = document.getElementById('edit-post-form');
    const cancelEditPost = document.getElementById('cancel-edit-post');
    const submitEditPost = document.getElementById('submit-edit-post');
    const editPostError = document.getElementById('edit-post-error');
    let editingPostId = null;

    blogTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.getAttribute('data-id');
            // 投稿データ取得
            try {
                const response = await fetch('posts.php');
                const posts = await response.json();
                const post = posts.find(p => p.id == id);
                if (post) {
                    editingPostId = id;
                    editTitle.value = post.title || '';
                    editContent.value = post.content || '';
                    editPostError.textContent = '';
                    editPostModal.style.display = 'flex';
                }
            } catch (error) {
                editPostError.textContent = '投稿データの取得に失敗しました';
            }
        }
    });
    cancelEditPost.addEventListener('click', () => {
        editPostModal.style.display = 'none';
    });
    editPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = editTitle.value.trim();
        const content = editContent.value.trim();
        if (!editingPostId || !title || !content) {
            editPostError.textContent = 'タイトル・本文は必須です';
            return;
        }
        try {
            const formData = new FormData();
            formData.append('id', editingPostId);
            formData.append('title', title);
            formData.append('content', content);
            const response = await fetch('edit_post.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                editPostModal.style.display = 'none';
                loadBlogList();
            } else {
                editPostError.textContent = result.error || '編集に失敗しました';
            }
        } catch (error) {
            editPostError.textContent = '通信エラーが発生しました';
        }
    });

    const newPostModal = document.getElementById('new-post-modal');
    const newPostButton = document.getElementById('new-post-button');
    const cancelNewPost = document.getElementById('cancel-new-post');
    const newPostForm = document.getElementById('new-post-form');
    const newTitle = document.getElementById('new-title');
    const newContent = document.getElementById('new-content');
    const newPostError = document.getElementById('new-post-error');

    newPostButton.addEventListener('click', () => {
        newTitle.value = '';
        newContent.value = '';
        newPostError.textContent = '';
        newPostModal.style.display = 'flex';
    });
    cancelNewPost.addEventListener('click', () => {
        newPostModal.style.display = 'none';
    });
    newPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = newTitle.value.trim();
        const content = newContent.value.trim();
        if (!title || !content) {
            newPostError.textContent = 'タイトルと本文は必須です';
            return;
        }
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            const response = await fetch('add_post.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                newPostModal.style.display = 'none';
                loadBlogList();
            } else {
                newPostError.textContent = result.error || '投稿に失敗しました';
            }
        } catch (error) {
            newPostError.textContent = '通信エラーが発生しました';
        }
    });

    const blogTableBody = document.querySelector('#blog-table tbody');
    async function loadBlogList() {
        try {
            const response = await fetch('posts.php');
            const posts = await response.json();
            blogTableBody.innerHTML = '';
            if (!Array.isArray(posts)) {
                blogTableBody.innerHTML = '<tr><td colspan="4" style="color:red;">ブログデータの取得に失敗しました</td></tr>';
                console.error('APIレスポンス:', posts);
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
            blogTableBody.innerHTML = '<tr><td colspan="4" style="color:red;">ブログ一覧の読み込みに失敗しました</td></tr>';
            console.error('ブログ一覧の読み込みに失敗しました:', error);
        }
    }

    loadBlogList();
    const signupUsername = document.getElementById('signup-username');
    const signupPassword = document.getElementById('signup-password');
    const signupButton = document.getElementById('signup-button');
    const signupError = document.getElementById('signup-error');
    signupButton.addEventListener('click', async () => {
        const username = signupUsername.value.trim();
        const password = signupPassword.value;
        signupError.textContent = '';
        if (!username || !password) {
            signupError.textContent = 'ユーザー名とパスワードを入力してください';
            return;
        }
        try {
            const response = await fetch('signup.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            });
            const result = await response.json();
            if (result.success) {
                signupError.style.color = 'green';
                signupError.textContent = '登録が完了しました。サインインしてください。';
                signupUsername.value = '';
                signupPassword.value = '';
            } else {
                signupError.style.color = 'red';
                signupError.textContent = result.error || '登録に失敗しました';
            }
        } catch (error) {
            signupError.style.color = 'red';
            signupError.textContent = '通信エラーが発生しました';
        }
    });
    const postContent = document.getElementById('post-content');
    const submitButton = document.getElementById('submit-button');
    const postsContainer = document.getElementById('posts-container');
    const apiUrl = 'api.php';
    const signinForm = document.querySelector('.signin-form');
    const signinUsername = document.getElementById('signin-username');
    const signinPassword = document.getElementById('signin-password');
    const signinButton = document.getElementById('signin-button');
    const signinError = document.getElementById('signin-error');
    const postForm = document.querySelector('.post-form');

    signinButton.addEventListener('click', async () => {
        const username = signinUsername.value.trim();
        const password = signinPassword.value;
        signinError.textContent = '';
        if (!username || !password) {
            signinError.textContent = 'ユーザー名とパスワードを入力してください';
            return;
        }
        try {
            const response = await fetch('signin.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            });
            const result = await response.json();
            if (result.success) {
                signinForm.style.display = 'none';
                postForm.style.display = '';
            } else {
                signinError.textContent = result.error || 'サインインに失敗しました';
            }
        } catch (error) {
            signinError.textContent = '通信エラーが発生しました';
        }
    });

    const fetchPosts = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response was not ok.');
            const posts = await response.json();
            postsContainer.innerHTML = '';
            if (!Array.isArray(posts)) {
                postsContainer.innerHTML = '<div style="color:red;">投稿データの取得に失敗しました</div>';
                console.error('APIレスポンス:', posts);
                return;
            }
            posts.forEach(post => {
                const postCard = document.createElement('div');
                postCard.className = 'post-card';
                const timestamp = document.createElement('div');
                timestamp.className = 'timestamp';
                timestamp.textContent = post.created_at;
                const content = document.createElement('div');
                content.className = 'content';
                content.textContent = post.content;
                postCard.appendChild(timestamp);
                postCard.appendChild(content);
                postsContainer.appendChild(postCard);
            });
        } catch (error) {
            postsContainer.innerHTML = '<div style="color:red;">投稿の読み込みに失敗しました</div>';
            console.error('投稿の読み込みに失敗しました:', error);
        }
    };

    submitButton.addEventListener('click', async () => {
        const content = postContent.value.trim();
        if (content) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: content })
                });

                if (!response.ok) throw new Error('Network response was not ok.');
                const result = await response.json();

                if (result.status === 'success') {
                    postContent.value = '';
                    fetchPosts();
                } else {
                    alert('投稿に失敗しました: ' + (result.message || ''));
                }
            } catch (error) {
                console.error('投稿に失敗しました:', error);
            }
        }
    });

    fetchPosts();
});