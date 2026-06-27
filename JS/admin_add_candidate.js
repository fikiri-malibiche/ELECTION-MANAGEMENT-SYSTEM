document.addEventListener('DOMContentLoaded', function () {
    const candidateForm = document.getElementById('candidateForm');
    const formMessage = document.getElementById('formMessage');

    function setFormMessage(message, type) {
        if (!formMessage) return;
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + (type || '');
    }

    if (!candidateForm) {
        return;
    }

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

            formData.append('csrf_token', window.CSRF_TOKEN || '');

            const response = await fetch('../PHP/api/add_candidate.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!data.success) {
                setFormMessage(data.error || 'Unable to save candidate.', 'error');
                return;
            }

            setFormMessage('Candidate added successfully.', 'success');
            candidateForm.reset();
        } catch (error) {
            console.error('Add candidate failed:', error);
            setFormMessage('Kuna hitilafu wakati wa kuhifadhi mgombea. Jaribu tena.', 'error');
        }
    });
});
