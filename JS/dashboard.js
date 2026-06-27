// =============================================
// DASHBOARD.JS - File Moja Kwa Dashboards Zote
// =============================================

document.addEventListener('DOMContentLoaded', function() {

    console.log('📊 Loading dashboard...');

    // =============================================
    // FUNCTION YA KUPALIA DATA
    // =============================================

    const winnerContainer = document.getElementById('winnerContainer');

    function renderElectionWinner(winner) {
        if (!winnerContainer) return;
        if (!winner || !winner.full_name) {
            winnerContainer.innerHTML = '<p>Hakuna kura zimepigwa bado. Ripoti itatengenezwa mara baada ya kura kuanza.</p>';
            return;
        }

        winnerContainer.innerHTML = `
            <div class="winner-info">
                <div>
                    <h4>${winner.full_name}</h4>
                    <p class="muted">${winner.party || 'Unknown party'}</p>
                </div>
                <div class="winner-stats">
                    <strong>${winner.votes_count || 0}</strong>
                    <span>votes</span>
                </div>
                <div class="winner-percent">${winner.percentage}%</div>
            </div>
        `;
    }

    const generateReportBtn = document.getElementById('generateReportBtn');
    const reportMessage = document.getElementById('reportMessage');

    function setReportMessage(message, type = 'success') {
        if (!reportMessage) return;
        reportMessage.textContent = message;
        reportMessage.className = 'report-message ' + (type === 'error' ? 'error' : 'success');
        reportMessage.style.display = message ? 'block' : 'none';
    }

    function loadData() {
        console.log('🔄 Fetching data...');

        fetch('../PHP/get_stats.php')
            .then(response => response.json())
            .then(result => {
                console.log('📊 Data received:', result);

                if (!result.success) {
                    console.error('❌ Error:', result.error);
                    return;
                }

                const data = result.data;
                const role = result.role;

                // =============================================
                // UPDATE VOTER COUNT
                // =============================================

                const voterEl = document.getElementById('total-voters');
                if (voterEl) voterEl.textContent = data.total_voters || 0;

                // =============================================
                // UPDATE CANDIDATE COUNT
                // =============================================

                const candidateEl = document.getElementById('total-candidates');
                if (candidateEl) candidateEl.textContent = data.total_candidates || 0;

                // =============================================
                // UPDATE VOTE COUNT
                // =============================================

                const voteEl = document.getElementById('total-votes');
                if (voteEl) voteEl.textContent = data.total_votes || 0;

                // =============================================
                // UPDATE PENDING COUNT (Kwa Admin)
                // =============================================

                const pendingEl = document.getElementById('pending-voters');
                if (pendingEl) pendingEl.textContent = data.pending_voters || 0;

                const winnerContainer = document.getElementById('winnerContainer');
                if (winnerContainer) {
                    renderElectionWinner(data.winner);
                }

                // =============================================
                // UPDATE STATION DATA (Kwa Manager)
                // =============================================

                if (role === 'manager') {
                    const stationVotersEl = document.getElementById('station-voters');
                    if (stationVotersEl) stationVotersEl.textContent = data.station_voters || 0;

                    const stationVotesEl = document.getElementById('station-votes');
                    if (stationVotesEl) stationVotesEl.textContent = data.station_votes || 0;
                }

                // =============================================
                // UPDATE CANDIDATE RESULTS (Kwa Admin)
                // =============================================

                if (role === 'admin' && data.candidates) {
                    const container = document.getElementById('results-container');
                    if (container) {
                        let html = '';
                        data.candidates.forEach((c, index) => {
                            html += `
                                <div class="result-item">
                                    <span class="rank">${index + 1}</span>
                                    <span class="name">${c.full_name}</span>
                                    <span class="party">${c.party || '-'}</span>
                                    <span class="votes">${c.votes_count}</span>
                                    <span class="pct">${c.percentage}%</span>
                                    <div class="bar"><div class="fill" style="width:${c.percentage}%"></div></div>
                                </div>
                            `;
                        });
                        container.innerHTML = html;
                    }
                }

                console.log('✅ Data loaded!');

            })
            .catch(error => {
                console.error('❌ Error:', error);
            });
    }

    function renderReportResults(results) {
        const container = document.getElementById('results-container');
        if (!container) return;

        if (!results || results.length === 0) {
            container.innerHTML = '<p>Hakuna kura zimepigwa bado.</p>';
            return;
        }

        let html = '';
        results.forEach((c, index) => {
            html += `
                <div class="result-item">
                    <span class="rank">${index + 1}</span>
                    <span class="name">${c.full_name}</span>
                    <span class="party">${c.party || '-'}</span>
                    <span class="votes">${c.votes_count}</span>
                    <span class="pct">${c.percentage}%</span>
                    <div class="bar"><div class="fill" style="width:${c.percentage}%"></div></div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    async function generateReport() {
        setReportMessage('Generating report...', '');

        try {
            const response = await fetch('../PHP/get_results.php');
            const contentType = response.headers.get('content-type') || '';

            if (!response.ok) {
                const text = await response.text();
                console.error('❌ Report request failed:', response.status, text);
                setReportMessage('Kuna tatizo kutengeneza ripoti. Jaribu tena.', 'error');
                return;
            }

            if (!contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ get_results.php returned non-JSON response:', text);
                setReportMessage('Kuna tatizo kutengeneza ripoti. Server response invalid.', 'error');
                return;
            }

            const data = await response.json();
            if (!data.success) {
                setReportMessage(data.error || 'Unable to generate report.', 'error');
                return;
            }

            renderReportResults(data.results);
            setReportMessage('Report generated successfully. You can now view the results below.', 'success');
        } catch (error) {
            console.error('❌ Report generation failed:', error);
            setReportMessage('Kuna tatizo kutengeneza ripoti. Jaribu tena.', 'error');
        }
    }

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }

    // =============================================
    // LOAD DATA MARA YA KWANZA
    // =============================================

    loadData();

    // =============================================
    // RELOAD KILA SEKUNDE 30 (Kwa Updates)
    // =============================================

    setInterval(loadData, 30000);

});