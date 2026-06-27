// =============================================
// VOTE.JS - Controller (Separation of Concerns)
// =============================================

class VoteController {
    constructor() {
        // State
        this.selectedCandidateId = null;
        this.hasVoted = false;
        this.candidates = [];

        // DOM Elements
        this.candidatesContainer = document.getElementById('candidatesContainer');
        this.submitBtn = document.getElementById('submitBtn');
        this.voteStatus = document.getElementById('voteStatus');

        // Initialize
        this.init();
    }

    init() {
        this.loadCandidates();
        this.checkVoteStatus();
        this.attachEventListeners();

        // Live refresh candidates so admin changes appear without reload
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.loadCandidates();
            }
        });

        // Poll periodically for new candidates
        this._pollTimer = setInterval(() => this.loadCandidates(), 10000);
    }

    attachEventListeners() {
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', () => this.openConfirmation());
        }

        // Modal elements
        this.confirmModal = document.getElementById('voteConfirmModal');
        this.confirmCancelBtn = document.getElementById('confirmCancel');
        this.confirmSubmitBtn = document.getElementById('confirmSubmit');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.confirmCandidateName = document.getElementById('confirmCandidateName');
        this.confirmCandidatePhoto = document.getElementById('confirmCandidatePhoto');
        this.confirmCandidatePosition = document.getElementById('confirmCandidatePosition');
        this.confirmError = document.getElementById('confirmError');

        if (this.confirmCancelBtn) {
            this.confirmCancelBtn.addEventListener('click', () => this.closeConfirmation());
        }
        if (this.confirmSubmitBtn) {
            this.confirmSubmitBtn.addEventListener('click', () => this.confirmVote());
        }
    }

    async loadCandidates() {
        try {
            this.showLoading('Loading candidates...');

            const response = await fetch('../PHP/api/get_candidates.php');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to load candidates');
            }

            this.candidates = data.candidates;
            this.renderCandidates();
        } catch (error) {
            console.error('Error loading candidates:', error);
            if (this.candidatesContainer) {
                this.candidatesContainer.innerHTML = `
                    <p class="error">❌ Error loading candidates. Tafadhali jaribu tena.</p>
                `;
            }
        }
    }

    async checkVoteStatus() {
        try {
            const response = await fetch('../PHP/api/check_vote.php');
            const data = await response.json();

            if (data.has_voted) {
                this.hasVoted = true;
                this.updateUIAfterVote(data.candidate_id);
            } else {
                this.hasVoted = false;
                this.updateUIForVoting();
            }
        } catch (error) {
            console.error('Error checking vote status:', error);
            if (this.voteStatus) this.voteStatus.innerHTML = '❌ Error checking status';
        }
    }

    openConfirmation() {
        if (!this.selectedCandidateId) {
            this.showMessage('Tafadhali chagua mgombea kwanza.', 'error');
            return;
        }

        const candidate = this.candidates.find(c => c.id == this.selectedCandidateId);
        if (!candidate) return;

        if (this.confirmCandidateName) this.confirmCandidateName.textContent = candidate.full_name || '';
        if (this.confirmCandidatePosition) this.confirmCandidatePosition.textContent = candidate.position || '';
        if (this.confirmCandidatePhoto) this.confirmCandidatePhoto.src = candidate.photo_url || '../IMAGES/default_avatar.png';
        if (this.confirmPasswordInput) this.confirmPasswordInput.value = '';
        if (this.confirmError) {
            this.confirmError.style.display = 'none';
            this.confirmError.textContent = '';
        }

        if (this.confirmModal) this.confirmModal.style.display = 'block';
    }

    closeConfirmation() {
        if (this.confirmModal) this.confirmModal.style.display = 'none';
    }

    async confirmVote() {
        const pwd = this.confirmPasswordInput ? this.confirmPasswordInput.value.trim() : '';
        if (!pwd) {
            if (this.confirmError) {
                this.confirmError.style.display = 'block';
                this.confirmError.textContent = 'Tafadhali ingiza password yako.';
            }
            return;
        }

        if (this.confirmSubmitBtn) {
            this.confirmSubmitBtn.classList.add('loading');
            this.confirmSubmitBtn.disabled = true;
        }

        try {
            const token = (typeof window !== 'undefined' && window.CSRF_TOKEN) ? window.CSRF_TOKEN : '';

            const response = await fetch('../PHP/api/confirm_vote.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    candidate_id: this.selectedCandidateId,
                    password: pwd,
                    csrf_token: token
                })
            });

            const data = await response.json();

            if (!data.success) {
                if (this.confirmError) {
                    this.confirmError.style.display = 'block';
                    this.confirmError.textContent = data.error || 'Verification failed.';
                }
                throw new Error(data.error || 'Verification failed');
            }

                this.hasVoted = true;
            this.showMessage(data.message || 'Kura imefanikiwa', 'success');
            this.updateUIAfterVote(this.selectedCandidateId);
            this.closeConfirmation();
        } catch (err) {
            console.error('Confirm vote error:', err);
        } finally {
            if (this.confirmSubmitBtn) {
                this.confirmSubmitBtn.classList.remove('loading');
                this.confirmSubmitBtn.disabled = false;
            }
        }
    }

    renderCandidates() {
        if (!this.candidatesContainer) return;

        if (this.candidates.length === 0) {
            this.candidatesContainer.innerHTML = '<p>⚠️ Hakuna wagombea kwa sasa.</p>';
            return;
        }

        let html = '';
        this.candidates.forEach(candidate => {
            html += `
                <div class="candidate-card" data-id="${candidate.id}" onclick="voteController.selectCandidate(${candidate.id})">
                    <img src="${candidate.photo_url || '../IMAGES/default_avatar.png'}" 
                         alt="${candidate.full_name}" class="photo"
                         onerror="this.src='../IMAGES/default_avatar.png'">
                    <div class="name">${candidate.full_name}</div>
                    <div class="party">${candidate.party || 'Independent'}</div>
                    <div class="position">${candidate.position || 'Candidate'}</div>
                    <div class="bio">${candidate.bio || ''}</div>
                    <div class="vote-check">
                        <span class="check">⬜</span> Bonyeza kuchagua
                    </div>
                </div>
            `;
        });

        this.candidatesContainer.innerHTML = html;
    }

    selectCandidate(candidateId) {
        if (this.hasVoted) {
            this.showMessage('Umeshapiga kura tayari!', 'error');
            return;
        }

        document.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
            const check = card.querySelector('.vote-check .check');
            if (check) check.textContent = '⬜';
        });

        const selectedCard = document.querySelector(`.candidate-card[data-id="${candidateId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            const check = selectedCard.querySelector('.vote-check .check');
            if (check) check.textContent = '✅';
        }

        this.selectedCandidateId = candidateId;
        if (this.submitBtn) {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<span class="btn-text">🗳️ Piga Kura</span><span class="spinner"></span>';
            this.submitBtn.style.background = '';
        }
    }

    updateUIAfterVote(candidateId) {
        if (this.voteStatus) {
            this.voteStatus.className = 'status-info voted';
            this.voteStatus.innerHTML = '✅ Umepiga kura tayari! Asante kwa kushiriki.';
        }

        if (this.submitBtn) {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.innerHTML = '✅ Umeshapiga Kura';
            this.submitBtn.style.background = '#28a745';
            this.submitBtn.disabled = true;
        }

        document.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.add('disabled');
            card.style.cursor = 'not-allowed';
            if (card.dataset.id == candidateId) {
                card.classList.add('selected');
                const check = card.querySelector('.vote-check .check');
                if (check) check.innerHTML = '✅ <span style="color:#28a745;">Umechagua</span>';
            }
        });
    }

    updateUIForVoting() {
        if (this.voteStatus) {
            this.voteStatus.className = 'status-info not-voted';
            this.voteStatus.innerHTML = '⏳ Bado haujapiga kura. Chagua mgombea wako!';
        }
        if (this.submitBtn) this.submitBtn.disabled = true;
    }

    showLoading(message) {
        if (this.candidatesContainer) {
            this.candidatesContainer.innerHTML = `<p>⏳ ${message}</p>`;
        }
    }

    showMessage(message, type = 'success') {
        const msgDiv = document.getElementById('resultMessage');
        const contentDiv = document.getElementById('messageContent');

        if (msgDiv && contentDiv) {
            msgDiv.className = '';
            msgDiv.classList.add(type);
            contentDiv.textContent = message;
            msgDiv.style.display = 'block';

            clearTimeout(msgDiv._timeout);
            msgDiv._timeout = setTimeout(() => {
                msgDiv.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }
}

let voteController;

document.addEventListener('DOMContentLoaded', function () {
    voteController = new VoteController();
});

