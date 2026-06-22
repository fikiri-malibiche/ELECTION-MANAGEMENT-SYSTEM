// =============================================
// SCRIPT.JS - USER REGISTRATION VALIDATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {

    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitButton');

    // =============================================
    // ONYESHA MESSAGE KUTOKA PHP (KAMA IPO)
    // =============================================

    const urlParams = new URLSearchParams(window.location.search);
    const successMsg = urlParams.get('success');
    const errorMsg = urlParams.get('error');

    if (successMsg) {
        showMessage(decodeURIComponent(successMsg), 'success');
        // Ondoa parameter kutoka URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorMsg) {
        showMessage(decodeURIComponent(errorMsg), 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // =============================================
    // FORM SUBMISSION
    // =============================================

    form.addEventListener('submit', function(e) {
        // Fanya validation kabla ya kutuma
        let isValid = true;

        // Clear old errors
        clearErrors();
        removeErrorStyles();

        // 1. FIRST NAME
        const firstName = document.getElementById('first_name_field');
        if (firstName.value.trim() === '') {
            showFieldError('first_name_error', 'Tafadhali ingiza jina la kwanza');
            setErrorStyle(firstName);
            isValid = false;
        }

        // 2. LAST NAME
        const lastName = document.getElementById('last_name_field');
        if (lastName.value.trim() === '') {
            showFieldError('last_name_error', 'Tafadhali ingiza jina la mwisho');
            setErrorStyle(lastName);
            isValid = false;
        }

        // 3. SEX (Imechaguliwa default, so no need to check)

        // 4. PHONE
        const phone = document.getElementById('phone_number');
        const phoneRegex = /^[0-9]{10,15}$/;
        if (phone.value.trim() === '') {
            showFieldError('phone_error', 'Tafadhali ingiza namba ya simu');
            setErrorStyle(phone);
            isValid = false;
        } else if (!phoneRegex.test(phone.value.trim())) {
            showFieldError('phone_error', 'Namba ya simu si sahihi (namba 10-15)');
            setErrorStyle(phone);
            isValid = false;
        }

        // 5. EMAIL
        const email = document.getElementById('email');
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (email.value.trim() === '') {
            showFieldError('email_error', 'Tafadhali ingiza barua pepe');
            setErrorStyle(email);
            isValid = false;
        } else if (!emailRegex.test(email.value.trim())) {
            showFieldError('email_error', 'Barua pepe si sahihi (mfano: example@gmail.com)');
            setErrorStyle(email);
            isValid = false;
        }

        // 6. PASSWORD
        const password = document.getElementById('password_field');
        if (password.value.trim() === '') {
            showFieldError('pass_error', 'Tafadhali ingiza password');
            setErrorStyle(password);
            isValid = false;
        } else if (password.value.trim().length < 6) {
            showFieldError('pass_error', 'Password lazima iwe angalau herufi 6');
            setErrorStyle(password);
            isValid = false;
        }

        // 7. CONFIRM PASSWORD
        const confirm = document.getElementById('confirm_field');
        if (confirm.value.trim() === '') {
            showFieldError('confirm_error', 'Tafadhali re-enter password');
            setErrorStyle(confirm);
            isValid = false;
        } else if (password.value.trim() !== confirm.value.trim()) {
            showFieldError('confirm_error', 'Password hazifanani');
            setErrorStyle(confirm);
            isValid = false;
        }

        // Kama form si valid, zuia submission
        if (!isValid) {
            e.preventDefault();
            // Scroll to top ili kuona errors
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Kama valid, onyesha spinner
        submitBtn.classList.add('loading');
        submitBtn.querySelector('.button-text').textContent = 'Processing...';
    });

    // =============================================
    // REMOVE ERRORS ON INPUT
    // =============================================

    // Clear error when user types
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            // Remove error style
            this.closest('.input_icon_box')?.classList.remove('error');
            // Clear error message
            const errorId = this.id.replace('_field', '').replace('_number', '');
            const errorMap = {
                'first_name': 'first_name_error',
                'last_name': 'last_name_error',
                'phone_number': 'phone_error',
                'email': 'email_error',
                'password': 'pass_error',
                'confirm': 'confirm_error'
            };
            const errorLabel = document.getElementById(errorMap[this.id] || this.id + '_error');
            if (errorLabel) {
                errorLabel.textContent = '';
            }
        });

        input.addEventListener('blur', function() {
            this.closest('.input_icon_box')?.classList.remove('error');
        });
    });

    // =============================================
    // HELPER FUNCTIONS
    // =============================================

    function showFieldError(elementId, message) {
        const errorLabel = document.getElementById(elementId);
        if (errorLabel) {
            errorLabel.textContent = message;
            errorLabel.style.color = '#dc3545';
        }
    }

    function setErrorStyle(input) {
        const box = input.closest('.input_icon_box');
        if (box) {
            box.classList.add('error');
        }
    }

    function removeErrorStyles() {
        document.querySelectorAll('.input_icon_box.error').forEach(el => {
            el.classList.remove('error');
        });
    }

    function clearErrors() {
        document.querySelectorAll('.error-label').forEach(label => {
            label.textContent = '';
        });
    }

    // =============================================
    // SHOW MESSAGE FUNCTION
    // =============================================

    function showMessage(message, type) {
        const resultDiv = document.getElementById('resultMessage');
        const contentDiv = document.getElementById('messageContent');

        if (!resultDiv || !contentDiv) return;

        // Remove previous classes
        resultDiv.className = '';
        resultDiv.classList.add(type);

        // Set message
        contentDiv.innerHTML = message;

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = function() {
            resultDiv.style.display = 'none';
        };
        resultDiv.appendChild(closeBtn);

        // Show
        resultDiv.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(function() {
            resultDiv.style.display = 'none';
        }, 5000);
    }
});