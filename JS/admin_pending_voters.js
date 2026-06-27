document.addEventListener('DOMContentLoaded', function () {
    const pendingVotersContainer = document.getElementById('pendingVotersContainer');

    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value).replace(/[&<>"'`=\/]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '`': '&#96;',
                '=': '&#61;',
                '/': '&#x2F;'
            }[char];
        });
    }

    function renderPendingUsers(users) {
        if (!pendingVotersContainer) return;
        if (!users || users.length === 0) {
            pendingVotersContainer.innerHTML = '<p>Hakuna wapiga kura wapya wanaosubiri uthibitisho.</p>';
            return;
        }

        const html = users.map(user => {
            return `
                <div class="pending-user-card">
                    <div>
                        <h4>${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}</h4>
                        <p>${escapeHtml(user.email)} • ${escapeHtml(user.phone)}</p>
                        <p class="pending-meta">${user.sex ? 'Jinsia: ' + escapeHtml(user.sex) : ''}</p>
                        <p class="pending-meta">Role: ${escapeHtml(user.role)}</p>
                    </div>
                    <div class="pending-actions">
                        <button class="btn-approve" data-id="${user.id}">Approve</button>
                        <button class="btn-reject" data-id="${user.id}">Reject</button>
                    </div>
                </div>
            `;
        }).join('');

        pendingVotersContainer.innerHTML = html;

        pendingVotersContainer.querySelectorAll('.btn-approve').forEach(button => {
            button.addEventListener('click', function () {
                const userId = this.dataset.id;
                const role = 'voter';
                verifyUser(userId, 'approve', role);
            });
        });

        pendingVotersContainer.querySelectorAll('.btn-reject').forEach(button => {
            button.addEventListener('click', function () {
                if (confirm('Hakikisha unataka kukataa akaunti hii?')) {
                    verifyUser(this.dataset.id, 'reject');
                }
            });
        });
    }

    async function fetchPendingUsers() {
        if (!pendingVotersContainer) return;
        pendingVotersContainer.innerHTML = '<p>Loading pending voter accounts...</p>';

        try {
            const response = await fetch('../PHP/api/get_pending_users.php');
            const data = await response.json();
            if (!data.success) {
                pendingVotersContainer.innerHTML = `<p class="error">${data.error || 'Unable to load pending voters.'}</p>`;
                return;
            }
            renderPendingUsers(data.pending_users);
        } catch (error) {
            console.error('Error loading pending voters:', error);
            pendingVotersContainer.innerHTML = '<p class="error">Kuna hitilafu wakati wa kupakia wapiga kura waliosubiri.</p>';
        }
    }

    async function verifyUser(userId, action) {
        try {
            const response = await fetch('../PHP/api/verify_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId, action, csrf_token: window.CSRF_TOKEN || '' })
            });

            const data = await response.json();
            if (!data.success) {
                alert(data.error || 'Unable to update user status.');
                return;
            }
            await fetchPendingUsers();
        } catch (error) {
            console.error('Verify user failed:', error);
            alert('Kuna hitilafu wakati wa kubadili status ya mtumiaji. Jaribu tena.');
        }
    }

    fetchPendingUsers();
});