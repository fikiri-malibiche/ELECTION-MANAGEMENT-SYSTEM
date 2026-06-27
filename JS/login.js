// =============================================
// LOGIN.JS - Toleo la Fetch API (Inafuata Redirect)
// =============================================

document.addEventListener('DOMContentLoaded', function() {

    const DEBUG = false;

    function dbgLog() { if (DEBUG) console.log.apply(console, arguments); }
    function dbgErr() { if (DEBUG) console.error.apply(console, arguments); }




    // =============================================
    // GET ELEMENTS
    // =============================================

    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const generalError = document.getElementById('general_error');

    // =============================================
    // CHECK IF FORM EXISTS
    // =============================================

    if (!loginForm) {
        console.error('❌ Login form not found!');
        return;
    }



    // =============================================
    // SHOW MESSAGE FUNCTION
    // =============================================

    function showMessage(message, type = 'error') {


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

        const email = emailInput.value.trim();
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (email === '') {
            showFieldError('email_error', 'Tafadhali ingiza barua pepe');
            setErrorStyle(emailInput);
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showFieldError('email_error', 'Barua pepe si sahihi');
            setErrorStyle(emailInput);
            isValid = false;
        }

        const password = passwordInput.value.trim();
        if (password === '') {
            showFieldError('pass_error', 'Tafadhali ingiza password');
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
        submitBtn.querySelector('.button-text').textContent = '🔓 Login';
        submitBtn.disabled = false;
    }

    // =============================================
    // FORM SUBMISSION - FETCH API
    // =============================================

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        dbgLog('🔄 Login form submitted!');

        if (!validateForm()) {

            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        console.log('📧 Email:', email);
        console.log('🔒 Password:', password ? '******' : 'Empty');

        submitBtn.classList.add('loading');
        submitBtn.querySelector('.button-text').textContent = 'Logging in...';
        submitBtn.disabled = true;

        // =============================================
        // SEND REQUEST WITH FETCH API
        // =============================================

        const url = '../PHP/login.php';
        console.log('🚀 Sending request to:', url);

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                email: email,
                password: password,
                origin: 'user'
            })
        })
        .then(response => {
            console.log('📥 Response received!');
            console.log('📊 Status:', response.status);
            console.log('📊 Content-Type:', response.headers.get('content-type'));

            // =============================================
            // CHECK IF RESPONSE IS JSON
            // =============================================

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                // If not JSON, return text for debugging
                return response.text().then(text => {
                    console.error('❌ Expected JSON but got HTML/text');
                    console.error('📄 Response:', text.substring(0, 500));
                    throw new Error('Server returned non-JSON response');
                });
            }
        })
        .then(data => {
            console.log('📊 Response data:', data);

            // =============================================
            // HANDLE ERRORS
            // =============================================

            if (!data.success) {
                console.error('❌ Login failed:', data.error || data.errors);
                
                // Show general error
                if (data.error) {
                    showMessage(data.error, 'error');
                }
                
                // Show field errors
                if (data.errors) {
                    if (data.errors.email) {
                        showFieldError('email_error', data.errors.email);
                        setErrorStyle(emailInput);
                    }
                    if (data.errors.password) {
                        showFieldError('pass_error', data.errors.password);
                        setErrorStyle(passwordInput);
                    }
                }
                
                resetButton();
                return;
            }

            // =============================================
            // SUCCESS - FOLLOW REDIRECT
            // =============================================

            console.log('✅ Login successful!');
            console.log('👤 User:', data.user);
            console.log('🔄 Redirecting to:', data.redirect);

            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                // Fallback redirect based on role
                const role = data.user?.role || 'voter';
                const redirectMap = {
                    'admin': '../HTML/admin_dashboard.html',
                    'manager': '../HTML/manager_dashboard.html',
                    'voter': '../HTML/voter_dashboard.html'
                };
                window.location.href = redirectMap[role] || redirectMap['voter'];
            }

        })
        .catch(error => {
            console.error('❌ Fetch error:', error);
            console.error('❌ Error message:', error.message);
            
            showMessage('🚫 Kuna hitilafu kwenye mfumo. Tafadhali jaribu tena.', 'error');
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

    // =============================================
    // CHECK URL PARAMETERS
    // =============================================

    function checkURLParams() {
        const params = new URLSearchParams(window.location.search);
        console.log('🔍 URL Parameters:');
        params.forEach((value, key) => {
            console.log(`  ${key}: ${value}`);
        });

        if (params.has('error')) {
            showMessage(decodeURIComponent(params.get('error')), 'error');
        }
        if (params.has('success')) {
            showMessage(decodeURIComponent(params.get('success')), 'success');
        }
    }
    checkURLParams();

    console.log('✅ Login.js loaded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});