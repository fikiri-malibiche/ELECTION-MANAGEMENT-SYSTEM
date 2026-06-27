document.addEventListener('DOMContentLoaded', function () {
    const votersContainer = document.getElementById('votersContainer');

    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value).replace(/[&<>\"'`=\/]/g, function (char) {
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

    function renderVoters(voters) {
        if (!voters || voters.length === 0) {
            votersContainer.innerHTML = '<p>Hakuna wapiga kura katika mfumo.</p>';
            return;
        }

        const rows = voters.map(voter => {
            const statusClass = voter.status === 'approved' ? 'status-approved' : voter.status === 'pending' ? 'status-pending' : 'status-muted';
            const pollingStation = voter.polling_station_id || '-';
            return `
                <tr>
                    <td>${escapeHtml(voter.id)}</td>
                    <td>${escapeHtml(voter.first_name)} ${escapeHtml(voter.last_name)}</td>
                    <td>${escapeHtml(voter.email)}</td>
                    <td>${escapeHtml(voter.phone)}</td>
                    <td>${escapeHtml(voter.sex)}</td>
                    <td>${escapeHtml(voter.role)}</td>
                    <td class="${statusClass}">${escapeHtml(voter.status)}</td>
                    <td>${escapeHtml(pollingStation)}</td>
                    <td>${escapeHtml(voter.created_at)}</td>
                </tr>
            `;
        }).join('');

        votersContainer.innerHTML = `
            <div class="table-responsive">
                <table class="voter-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Jina</th>
                            <th>Email</th>
                            <th>Simu</th>
                            <th>Jinsia</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Kituo</th>
                            <th>Imesajiliwa</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    async function loadVoters() {
        votersContainer.innerHTML = '<p>Loading voters...</p>';
        try {
            const response = await fetch('../PHP/api/get_voters.php');
            if (!response.ok) {
                throw new Error('Network error');
            }
            const data = await response.json();
            if (!data.success) {
                votersContainer.innerHTML = `<p class="error">${data.error || 'Unable to load voters.'}</p>`;
                return;
            }
            renderVoters(data.voters);
        } catch (error) {
            console.error('Error loading voters:', error);
            votersContainer.innerHTML = '<p class="error">Kuna hitilafu wakati wa kupakia wapiga kura.</p>';
        }
    }

    loadVoters();
});
