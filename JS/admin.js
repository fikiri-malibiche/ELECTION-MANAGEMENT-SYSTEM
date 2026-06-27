document.addEventListener('DOMContentLoaded', function () {
    const stats = {
        voters: document.getElementById('total-voters'),
        candidates: document.getElementById('total-candidates'),
        pending: document.getElementById('pending-voters'),
        votes: document.getElementById('total-votes')
    };

    const showAddFormBtn = document.getElementById('showAddFormBtn');
    const addCandidateForm = document.getElementById('addCandidateForm');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const candidateForm = document.getElementById('candidateForm');
    const candidatesContainer = document.getElementById('candidatesContainer');
    const pendingUsersContainer = document.getElementById('pendingUsersContainer');
    const formMessage = document.getElementById('formMessage');

    function setFormMessage(message, type = 'error') {
        if (!formMessage) return;
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + (type === 'success' ? 'success' : 'error');
        if (message) {
            formMessage.style.display = 'block';
        } else {
            formMessage.style.display = 'none';
        }
    }

    // Toast popup for interactive feedback (top-right)
    function showToast(message, type = 'success') {
        let toast = document.getElementById('adminToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'adminToast';
            toast.className = 'toast-popup';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        // Green background for success, red-ish for error
        if (type === 'success') {
            toast.style.color = '#155724';
            toast.style.background = '#d4edda';
            toast.style.borderColor = '#c3e6cb';
        } else {
            toast.style.color = '#721c24';
            toast.style.background = 'rgba(197, 48, 48, 0.12)';
            toast.style.borderColor = 'rgba(197, 48, 48, 0.35)';
        }

        toast.style.display = 'block';
        toast.classList.remove('hide');
        toast.classList.add('show');

        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            // Hide after animation
            clearTimeout(toast._hideTimeout);
            toast._hideTimeout = setTimeout(() => {
                toast.style.display = 'none';
            }, 420);
        }, 3000);
    }

    function toggleAddForm(show) {
        if (!addCandidateForm) return;
        addCandidateForm.style.display = show ? 'block' : 'none';
        if (show) {
            setFormMessage('', '');
        }
    }

    async function fetchStats() {
        try {
            const response = await fetch('../PHP/get_stats.php');
            const contentType = response.headers.get('content-type') || '';
            let data;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('get_stats.php returned non-JSON response:', text.substring(0, 1000));
                throw new Error('get_stats returned non-JSON');
            }
            if (data.success) {
                stats.voters.textContent = data.data.total_voters || 0;
                stats.candidates.textContent = data.data.total_candidates || 0;
                stats.pending.textContent = data.data.pending_voters || 0;
                stats.votes.textContent = data.data.total_votes || 0;
            } else {
                console.warn('get_stats returned no success:', data);
                // Clear stats visually when not logged in or on error
                if (stats.voters) stats.voters.textContent = 0;
                if (stats.candidates) stats.candidates.textContent = 0;
                if (stats.pending) stats.pending.textContent = 0;
                if (stats.votes) stats.votes.textContent = 0;
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    const voteDetailsContainer = document.getElementById('voteDetailsContainer');

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

    async function fetchPendingUsers() {
        if (!pendingUsersContainer) return;
        pendingUsersContainer.innerHTML = '<p>Loading pending user accounts...</p>';

        try {
            const response = await fetch('../PHP/api/get_pending_users.php');
            const data = await response.json();
            if (!data.success) {
                pendingUsersContainer.innerHTML = `<p class="error">${data.error || 'Unable to load pending users.'}</p>`;
                return;
            }
            renderPendingUsers(data.pending_users);
        } catch (error) {
            console.error('Error loading pending users:', error);
            pendingUsersContainer.innerHTML = '<p class="error">Kuna hitilafu wakati wa kupakia akaunti zinazosubiri.</p>';
        }
    }

    function renderVoteDetails(votes) {
        if (!voteDetailsContainer) return;
        if (!votes || votes.length === 0) {
            voteDetailsContainer.innerHTML = '<p>Hakuna kura zimepigwa bado.</p>';
            return;
        }

        const rows = votes.map(vote => {
            return `
                <tr>
                    <td>${escapeHtml(vote.id)}</td>
                    <td>${escapeHtml(vote.voter_name)}</td>
                    <td>${escapeHtml(vote.voter_email)}</td>
                    <td>${escapeHtml(vote.voter_phone || '-')}</td>
                    <td>${escapeHtml(vote.candidate_name)}</td>
                    <td>${escapeHtml(vote.candidate_party)}</td>
                    <td>${escapeHtml(vote.polling_station_id || '-')}</td>
                    <td>${escapeHtml(vote.ip_address || '-')}</td>
                </tr>
            `;
        }).join('');

        voteDetailsContainer.innerHTML = `
            <div class="table-responsive">
                <table class="voter-table vote-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Voter</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Candidate</th>
                            <th>Party</th>
                            <th>Station</th>
                            <th>IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    async function fetchVoteDetails() {
        if (!voteDetailsContainer) return;
        voteDetailsContainer.innerHTML = '<p>Loading vote details...</p>';

        try {
            const response = await fetch('../PHP/api/get_vote_details.php');
            const data = await response.json();
            if (!data.success) {
                voteDetailsContainer.innerHTML = `<p class="error">${data.error || 'Unable to load vote details.'}</p>`;
                return;
            }
            renderVoteDetails(data.votes);
        } catch (error) {
            console.error('Error loading vote details:', error);
            voteDetailsContainer.innerHTML = '<p class="error">Kuna hitilafu wakati wa kupakia maelezo ya kura.</p>';
        }
    }

    async function verifyUser(userId, action, role = 'voter') {
        try {
            const response = await fetch('../PHP/api/verify_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId, action: action, role: role })
            });
            const data = await response.json();
// console.log('verifyUser response:', data);
            if (!data.success) {
                setFormMessage(data.error || 'Unable to update user status.', 'error');
                return;
            }

            // If server returned authoritative counts, use them
            try {
                if (typeof data.total_voters !== 'undefined' && stats.voters) {
                    stats.voters.textContent = data.total_voters;
                } else {
                    // fallback optimistic update
                    if (action === 'approve' && stats.voters) {
                        const currentVoters = parseInt(stats.voters.textContent) || 0;
                        stats.voters.textContent = currentVoters + 1;
                    }
                }

                if (typeof data.pending_voters !== 'undefined' && stats.pending) {
                    stats.pending.textContent = data.pending_voters;
                } else {
                    if (stats.pending) {
                        const pendingCount = parseInt(stats.pending.textContent) || 0;
                        stats.pending.textContent = Math.max(0, pendingCount - (action === 'approve' || action === 'reject' ? 1 : 0));
                    }
                }
            } catch (err) {
                console.warn('Applying server stats failed, falling back to optimistic update:', err);
            }

            // Refresh server-side state to ensure full consistency
            fetchPendingUsers();
            fetchStats();
        } catch (error) {
            console.error('Verify user failed:', error);
            setFormMessage('Kuna hitilafu wakati wa kubadilisha status ya mtumiaji. Jaribu tena.', 'error');
        }
    }

    function renderPendingUsers(users) {
        if (!pendingUsersContainer) return;
        if (!users || users.length === 0) {
            pendingUsersContainer.innerHTML = '<p>Hakuna wapiga kura wapya wanaosubiri uthibitisho.</p>';
            return;
        }

        const html = users.map(user => {
            return `
                <div class="pending-user-card">
                    <div>
                        <h4>${user.first_name} ${user.last_name}</h4>
                        <p>${user.email} • ${user.phone}</p>
                        <p class="pending-meta">${user.sex ? 'Jinsia: ' + user.sex : ''}</p>
                        <div class="pending-role">
                            <label>Role</label>
                            <select class="pending-role-select">
                                <option value="voter" ${user.role === 'voter' ? 'selected' : ''}>Voter</option>
                                <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                            </select>
                        </div>
                    </div>
                    <div class="pending-actions">
                        <button class="btn-approve" data-id="${user.id}">Approve</button>
                        <button class="btn-reject" data-id="${user.id}">Reject</button>
                    </div>
                </div>
            `;
        }).join('');

        pendingUsersContainer.innerHTML = html;
        pendingUsersContainer.querySelectorAll('.btn-approve').forEach(button => {
            button.addEventListener('click', function () {
                const card = this.closest('.pending-user-card');
                const roleSelect = card.querySelector('.pending-role-select');
                const selectedRole = roleSelect ? roleSelect.value : 'voter';
                verifyUser(this.dataset.id, 'approve', selectedRole);
            });
        });
        pendingUsersContainer.querySelectorAll('.btn-reject').forEach(button => {
            button.addEventListener('click', function () {
                if (confirm('Hakikisha unataka kukataa akaunti hii?')) {
                    verifyUser(this.dataset.id, 'reject');
                }
            });
        });
    }

    async function fetchCandidates() {
        try {
            candidatesContainer.innerHTML = '<p>Loading candidates...</p>';
            const response = await fetch('../PHP/api/get_candidates.php');
            const data = await response.json();
            if (!data.success) {
                candidatesContainer.innerHTML = `<p class="error">${data.error || 'Unable to load candidates.'}</p>`;
                return;
            }
            renderCandidates(data.candidates);
        } catch (error) {
            console.error('Error loading candidates:', error);
            candidatesContainer.innerHTML = '<p class="error">Kuna hitilafu wakati wa kupakia wagombea.</p>';
        }
    }

    function renderCandidates(candidates) {
        const candidateCount = candidates ? candidates.length : 0;
        stats.candidates.textContent = candidateCount;

        if (!candidates || candidates.length === 0) {
            candidatesContainer.innerHTML = '<p>Hakuna wagombea kwa sasa. Tafadhali ongeza mgombea mpya.</p>';
            return;
        }

        const html = candidates.map(candidate => {
            return `
                <div class="candidate-card">
                    <div class="candidate-photo-block">
                        ${candidate.photo_url ? `<img src="${candidate.photo_url}" alt="${candidate.full_name}" class="candidate-photo">` : '<div class="candidate-photo placeholder">No photo</div>'}
                        <div class="candidate-name-block">
                            <h4>${candidate.full_name}</h4>
                            <p class="candidate-meta">${candidate.position} · ${candidate.party}</p>
                        </div>
                    </div>
                    <div class="candidate-info-block">
                        <div class="candidate-logo-block">
                            ${candidate.party_logo ? `<img src="${candidate.party_logo}" alt="${candidate.party} logo" class="candidate-logo">` : ''}
                        </div>
                        <p class="candidate-bio">${candidate.bio || 'No description provided.'}</p>
                        <div class="candidate-actions">
                            <button class="btn-delete" data-id="${candidate.id}">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        candidatesContainer.innerHTML = html;
        candidatesContainer.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function () {
                const candidateId = this.dataset.id;
                if (confirm('Are you sure you want to delete this candidate?')) {
                    deleteCandidate(candidateId);
                }
            });
        });
    }

    async function deleteCandidate(id) {
        try {
            const response = await fetch('../PHP/api/delete_candidate.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: id, csrf_token: window.CSRF_TOKEN })
            });
            const data = await response.json();
            if (!data.success) {
                setFormMessage(data.error || 'Unable to delete candidate.', 'error');
                return;
            }
            fetchCandidates();
            fetchStats();
        } catch (error) {
            console.error('Delete candidate failed:', error);
            setFormMessage('Kuna hitilafu wakati wa kufuta mgombea. Jaribu tena.', 'error');
        }
    }

    if (candidateForm) {
        candidateForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const fullName = document.getElementById('full_name').value.trim();
            const party = document.getElementById('party').value.trim();
            const position = document.getElementById('position').value.trim();
            const bio = document.getElementById('bio').value.trim();
            const partyLogoFile = document.getElementById('party_logo_file').files[0];
            const photoFile = document.getElementById('photo_file').files[0];

            if (!fullName || !party || !position) {
                setFormMessage('Full name, party and position are required.', 'error');
                return;
            }

            if (!partyLogoFile || !photoFile) {
                setFormMessage('Both party logo and candidate photo must be uploaded.', 'error');
                return;
            }

            setFormMessage('Saving candidate...', '');

            try {
                const formData = new FormData();
                formData.append('full_name', fullName);
                formData.append('party', party);
                formData.append('position', position);
                formData.append('bio', bio);
                formData.append('party_logo_file', partyLogoFile);
                formData.append('photo_file', photoFile);

                const response = await fetch('../PHP/api/add_candidate.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (!data.success) {
                    setFormMessage(data.error || 'Unable to save candidate.', 'error');
                    showToast(data.error || 'Unable to save candidate.', 'error');
                    return;
                }

                setFormMessage('Candidate added successfully.', 'success');
                showToast('Candidate added successfully.', 'success');
                candidateForm.reset();
                fetchCandidates();
                fetchStats();
            } catch (error) {
                console.error('Add candidate failed:', error);
                setFormMessage('Kuna hitilafu wakati wa kuhifadhi mgombea. Jaribu tena.', 'error');
            }
        });
    }

    if (showAddFormBtn) {
        showAddFormBtn.addEventListener('click', function () {
            window.location.href = 'admin_add_candidate.html';
        });
    }

    if (cancelAddBtn) {
        cancelAddBtn.addEventListener('click', function () {
            toggleAddForm(false);
        });
    }

    fetchCandidates();
    fetchStats();
    fetchPendingUsers();
    fetchVoteDetails();
});
