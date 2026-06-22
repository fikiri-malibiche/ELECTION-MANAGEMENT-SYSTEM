// =============================================
// ADMINLOGIN.JS - Admin Login Controller
// =============================================

document.addEventListener('DOMContentLoaded', function() {

    console.log('🔐 Admin Login page loaded!');

    // =============================================
    // GET ELEMENTS
    // =============================================

    const loginForm = document.getElementById('adminLoginForm');
    const submitBtn = document.getElementById('submitBtn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email_error');
    const passError = document.getElementById('pass_error');
    const generalError = document.getElementById('general_error');

    // =============================================
    // CHECK IF FORM EXISTS
    // =============================================

    if (!loginForm) {
        console.error('❌ Admin login form not found!');
        return;
    }

    console.log('✅ Admin login form found!');

    // =============================================
    // SHOW MESSAGE FUNCTION
    // =============================================

    function showMessage(message, type = 'error') {
        console.log('📢 Message:', message, 'Type:', type);

        const msgDiv = document.getElementById('resultMessage');
        const contentDiv = document.getElementById('messageContent');

        if (msgDiv && contentDiv) {
            msgDiv.className = '';
            msgDiv.classList.add(type);
            contentDiv.innerHTML = message;
            msgDiv.style.display = 'block';

            clearTimeout(msgDiv._timeout);
            msgDiv._timeout = setTimeout(() => {
                msgDiv.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }

    // =============================================
    // SHOW FIELD ERROR
    // =============================================

    function showFieldError(elementId, message) {
        const errorLabel = document.getElementById(elementId);
        if (errorLabel) {
            errorLabel.textContent = message;
            errorLabel.style.color = '#dc3545';
        }
    }

    function clearFieldErrors() {
        document.querySelectorAll('.error-label').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('.input_icon_box.error').forEach(el => {
            el.classList.remove('error');
        });
        if (generalError) {
            generalError.textContent = '';
            generalError.className = 'error-label';
        }
    }

    function setErrorStyle(input) {
        const box = input.closest('.input_icon_box');
        if (box) {
            box.classList.add('error');
        }
    }

    // =============================================
    // VALIDATE FORM
    // =============================================

    function validateForm() {
        let isValid = true;
        clearFieldErrors();

        // Email validation
        const email = emailInput.value.trim();
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (email === '') {
            showFieldError('email_error', 'Tafadhali ingiza barua pepe ya admin');
            setErrorStyle(emailInput);
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showFieldError('email_error', 'Barua pepe si sahihi');
            setErrorStyle(emailInput);
            isValid = false;
        }

        // Password validation
        const password = passwordInput.value.trim();
        if (password === '') {
            showFieldError('pass_error', 'Tafadhali ingiza password ya admin');
            setErrorStyle(passwordInput);
            isValid = false;
        }

        return isValid;
    }

    // =============================================
    // RESET BUTTON
    // =============================================

    function resetButton() {
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.button-text').textContent = '🔑 Login as Admin';
        submitBtn.disabled = false;
    }

    // =============================================
    // FORM SUBMISSION - FETCH API
    // =============================================

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        console.log('🔄 Admin login form submitted!');

        if (!validateForm()) {
            console.log('❌ Validation failed');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        console.log('📧 Email:', email);
        console.log('🔒 Password:', password ? '******' : 'Empty');

        submitBtn.classList.add('loading');
        submitBtn.querySelector('.button-text').textContent = 'Authenticating...';
        submitBtn.disabled = true;

        // =============================================
        // SEND REQUEST
        // =============================================

        fetch('../PHP/adminLogin.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                email: email,
                password: password
            })
        })
        .then(response => {
            console.log('📥 Response received!');
            console.log('📊 Status:', response.status);

            // Angalia kama response ni JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                return response.text().then(text => {
                    console.error('❌ Expected JSON but got HTML');
                    console.error('📄 Response:', text.substring(0, 200));
                    throw new Error('Server returned HTML instead of JSON');
                });
            }
        })
        .then(data => {
            console.log('📊 Response data:', data);

            // =============================================
            // HANDLE ERRORS
            // =============================================

            if (!data.success) {
                console.error('❌ Login failed:', data.error);
                showMessage(data.error, 'error');
                resetButton();
                return;
            }

            // =============================================
            // SUCCESS
            // =============================================

            console.log('✅ Login successful!');
            console.log('👤 User:', data.user);

            if (data.redirect) {
                console.log('🔄 Redirecting to:', data.redirect);
                window.location.href = data.redirect;
            } else {
                window.location.href = '../HTML/admin_dashboard.html';
            }

        })
        .catch(error => {
            console.error('❌ Fetch error:', error);
            console.error('❌ Error message:', error.message);
            
            showMessage('🚫 Kuna hitilafu. Tafadhali jaribu tena.', 'error');
            resetButton();
        });
    });

    // =============================================
    // CLEAR ERRORS ON INPUT
    // =============================================

    emailInput.addEventListener('input', function() {
        this.closest('.input_icon_box')?.classList.remove('error');
        document.getElementById('email_error').textContent = '';
        if (generalError) {
            generalError.textContent = '';
            generalError.className = 'error-label';
        }
    });

    passwordInput.addEventListener('input', function() {
        this.closest('.input_icon_box')?.classList.remove('error');
        document.getElementById('pass_error').textContent = '';
        if (generalError) {
            generalError.textContent = '';
            generalError.className = 'error-label';
        }
    });

    // =============================================
    // PASSWORD TOGGLE
    // =============================================

    const passwordContainer = passwordInput?.closest('.input_icon_box');
    if (passwordContainer && passwordInput) {
        const toggle = document.createElement('span');
        toggle.className = 'password-toggle';
        toggle.textContent = '👁️';
        toggle.title = 'Show/Hide password';
        toggle.style.cssText = `
            cursor: pointer;
            padding: 0 10px;
            font-size: 18px;
            user-select: none;
            opacity: 0.5;
            transition: opacity 0.3s;
        `;
        toggle.onmouseover = () => toggle.style.opacity = '1';
        toggle.onmouseout = () => toggle.style.opacity = '0.5';

        toggle.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggle.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                toggle.textContent = '👁️';
            }
        });

        passwordContainer.appendChild(toggle);
        console.log('✅ Password toggle added');
    }

    console.log('✅ adminLogin.js loaded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});