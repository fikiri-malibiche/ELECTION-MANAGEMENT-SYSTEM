document.addEventListener('DOMContentLoaded', function () {
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

    fetchVoteDetails();
});