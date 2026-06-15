const loginForm = document.getElementById("admin_login_form");
const submitBtn = document.getElementById("submitBtn");

function showMessage(text, isSuccess) {
  const messageLabel = document.getElementById("message");
  messageLabel.textContent = text;
  messageLabel.style.backgroundColor = isSuccess ? "#4CAF50" : "#f44336";
  messageLabel.style.color = "white";
  messageLabel.classList.add("show");
  if (messageLabel._hideTimeout) clearTimeout(messageLabel._hideTimeout);
  messageLabel._hideTimeout = setTimeout(() => {
    messageLabel.classList.remove("show");
  }, 2000);
}

function clearMessages() {
  const userError = document.getElementById("user_error");
  const passError = document.getElementById("pass_error");
  const messageLabel = document.getElementById("message");
  userError.textContent = "";
  passError.textContent = "";
  messageLabel.textContent = "";
  messageLabel.classList.remove("show");
}

function handleLogin() {
  clearMessages();

  const user = document.getElementById("userid").value;
  const pass = document.getElementById("passwordid").value;
  const userError = document.getElementById("user_error");
  const passError = document.getElementById("pass_error");

  let hasError = false;
  if (user === "") {
    userError.textContent = "Username is required";
    userError.style.color = "red";
    hasError = true;
  }
  if (pass === "") {
    passError.textContent = "Password is required";
    passError.style.color = "red";
    hasError = true;
  }
  if (hasError) return;

  const loginData = { username: user, password: pass };

  fetch("../PHP/admin_login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  })
    .then((response) => response.text())
    .then((text) => {
      try {
        const data = JSON.parse(text);
        if (data && data.success) {
          showMessage(data.message, true);
          const msgEl = document.getElementById("message");
          if (msgEl && msgEl._hideTimeout) clearTimeout(msgEl._hideTimeout);
          const delayBeforeFade = 1500;
          const fadeDuration = 400;
          const container = document.getElementById("container");
          setTimeout(() => {
            if (container) {
              container.classList.add("fade-out");
            }
          }, delayBeforeFade);
          setTimeout(() => {
            window.location.href = data.redirect;
          }, delayBeforeFade + fadeDuration);
        } else {
          const msg = data && data.message ? data.message : "Invalid response from server";
          showMessage(msg, false);
        }
      } catch (parseError) {
        console.error("Login response text:", text);
        showMessage("Invalid response from server", false);
      }
    })
    .catch((error) => {
      showMessage("Error: " + (error.message || "Network error"), false);
    });
}

if (submitBtn) {
  submitBtn.addEventListener("click", handleLogin);
}
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleLogin();
  });
}
