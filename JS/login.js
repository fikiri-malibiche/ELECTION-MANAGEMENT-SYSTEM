const loginForm = document.getElementById("login_form");
const submitBtn = document.getElementById("submitBtn");

function showMessage(text, isSuccess){
    const messageLabel = document.getElementById("message");
    messageLabel.textContent = text;
    messageLabel.style.backgroundColor = isSuccess ? "#4CAF50" : "#f44336";
    messageLabel.style.color = "white";
    messageLabel.classList.add("show");
    // auto-hide after 2s
    if(messageLabel._hideTimeout) clearTimeout(messageLabel._hideTimeout);
    messageLabel._hideTimeout = setTimeout(() => {
        messageLabel.classList.remove("show");
    }, 2000);
}

function clearMessages(){
    const userError = document.getElementById("user_error");
    const passError = document.getElementById("pass_error");
    const messageLabel = document.getElementById("message");
    userError.textContent = "";
    passError.textContent = "";
    messageLabel.textContent = "";
    messageLabel.classList.remove("show");
}

function handleLogin(){
    clearMessages();
    const user = document.getElementById("userid").value;
    const pass = document.getElementById("passwordid").value;
    const userError = document.getElementById("user_error");
    const passError = document.getElementById("pass_error");

    // Client-side validation
    let hasError = false;
    if(user === ""){
        userError.textContent = "Username is required";
        userError.style.color = "red";
        hasError = true;
    }
    if(pass === ""){
        passError.textContent = "Password is required";
        passError.style.color = "red";
        hasError = true;
    }
    if(hasError) return;

    // Send login request via Fetch API as JSON
    const loginData = { username: user, password: pass };
    fetch("/PHP/login_form.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if(data && data.success){
            showMessage("Login successful! Redirecting...", true);
            // keep message visible until redirect
            const msgEl = document.getElementById('message');
            if(msgEl && msgEl._hideTimeout) clearTimeout(msgEl._hideTimeout);

            // delay before starting fade so message stays visible (2s)
            const delayBeforeFade = 1500; // ms
            const fadeDuration = 400; // should match CSS transition (400ms)
            const container = document.getElementById('container');
            setTimeout(() => { if(container){ container.classList.add('fade-out'); } }, delayBeforeFade);
            // redirect after fade completes
            setTimeout(() => { window.location.href = data.redirect; }, delayBeforeFade + fadeDuration);
        }else{
            const msg = (data && data.message) ? data.message : "Invalid response from server";
            showMessage(msg, false);
        }
    })
    .catch(error => {
        showMessage("Error: " + (error.message || "Network error"), false);
    });
}

// Attach handlers
if(submitBtn){
    submitBtn.addEventListener('click', handleLogin);
}
if(loginForm){
    // prevent accidental native submit if Enter is pressed inside inputs
    loginForm.addEventListener('submit', function(e){ e.preventDefault(); handleLogin(); });
}

// debug output to ensure script loaded
console.log('login.js loaded');