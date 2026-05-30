const loginForm = document.getElementById("login_form");
loginForm.addEventListener("submit",function(event){
    event.preventDefault();
    const user = document.getElementById("userid").value;
    const pass = document.getElementById("passwordid").value;
    const userError = document.getElementById("user_error");
    const passError = document.getElementById("pass_error");
    if(user ==="" && pass === ""){
        userError.textContent = "Username is required";
        userError.style.color = "red";
        passError.textContent = "Password is required";
        passError.style.color = "red";
    }else{
        userError.textContent = "";
        passError.textContent = "";
        loginForm.submit();
    }
});