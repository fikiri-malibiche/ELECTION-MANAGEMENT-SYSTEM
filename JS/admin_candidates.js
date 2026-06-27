document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('candidatesTableContainer');

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

    function renderCandidates(candidates) {
        if (!candidates || candidates.length === 0) {
            container.innerHTML = '<p>Hakuna wagombea katika mfumo.</p>';
            return;
        }

        const rows = candidates.map(candidate => {
            return `
                <tr>
                    <td>${escapeHtml(candidate.id)}</td>
                    <td>${escapeHtml(candidate.full_name)}</td>
                    <td>${escapeHtml(candidate.party)}</td>
                    <td>${escapeHtml(candidate.position)}</td>
                    <td>${escapeHtml(candidate.bio || 'No description')}</td>
                    <td>${candidate.party_logo ? `<img src="${escapeHtml(candidate.party_logo)}" class="table-logo" alt="Logo">` : '-'}</td>
                    <td>${candidate.photo_url ? `<img src="${escapeHtml(candidate.photo_url)}" class="table-photo" alt="Photo">` : '-'}</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <div class="table-responsive">
                <table class="voter-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Party</th>
                            <th>Position</th>
                            <th>Bio</th>
                            <th>Logo</th>
                            <th>Photo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    async function loadCandidates() {
        container.innerHTML = '<p>Loading candidates...</p>';
        try {
            const response = await fetch('../PHP/api/get_candidates.php');
            if (!response.ok) {
                throw new Error('Network error');
            }
            const data = await response.json();
            if (!data.success) {
                container.innerHTML = `<p class="error">${data.error || 'Unable to load candidates.'}</p>`;
                return;
            }
            renderCandidates(data.candidates);
        } catch (error) {
            console.error('Error loading candidates:', error);
            container.innerHTML = '<p class="error">Kuna hitilafu wakati wa kupakia wagombea.</p>';
        }
    }

    loadCandidates();
});
