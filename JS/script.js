const form = document.getElementById("form");
const firstName = document.getElementById("first_name_field");
const lastName = document.getElementById("last_name_field");
const maleRadio = document.getElementById("male_radio");
const femaleRadio = document.getElementById("female_radio");
const phoneNumber = document.getElementById("phone_number");
const email = document.getElementById("email");
const password = document.getElementById("password_field");
const confirmPassword = document.getElementById("confirm_field");
const submit = document.getElementById("submitButton");
const result = document.getElementById("resultMessage");
const label = document.getElementsByTagName("h3");
//spans
const firstSpan = document.getElementById("first_name_error");
const lastSpan = document.getElementById("last_name_error");
const sexSpan = document.getElementById("sex_error");
const phoneSpan = document.getElementById("phone_error");
const emailSpan = document.getElementById("email_error");
const passSpan = document.getElementById("pass_error");
const confirmSpan = document.getElementById("confirm_error");
let submitLoadingTimer = null;
let submitLoadingStart = 0;
const MIN_LOADING_TIME = 800;

form.addEventListener("submit",function(event){
    event.preventDefault();

    const isLastNameValid = validateLastName();
    const isFirstNameValid = validateFirstName();
    const isSexValid = validateSex();
    const isPhoneNumberValid = validatePhoneNumber();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if(isLastNameValid && isFirstNameValid && isSexValid && isPhoneNumberValid && isEmailValid && isPasswordValid && isConfirmPasswordValid){
        setSubmitLoading(true);
        let my_sex = "";
        if(maleRadio.checked){
            my_sex = "male";
        }else if(femaleRadio.checked){
            my_sex = "female";
        }
        const data = {
            first_name:firstName.value,
            last_name:lastName.value,
            sex: my_sex,
            phone_number: phoneNumber.value,
            email:email.value,
            password: password.value
        }
        fetch('/PHP/create_account.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(async res =>{
            const payload = await res.json().catch(() => null);
            const message = payload && (payload.message || payload.error)
                ? (payload.message || payload.error)
                : (res.status === 201 ? "Account created successfully" : "Server Error");
            if(res.status === 201){
                showResultMessage(message, "green", 3000);
                form.reset();
            }else{
                showResultMessage(message, "red", 3000);
            }
        })
        .catch(err => {
            showResultMessage('Network error: ' + err.message, 'darkred', 3000);
        })
        .finally(() => {
            setSubmitLoading(false);
        });
    }
});

function showResultMessage(text, background, duration = 3000) {
    result.textContent = text;
    result.style.background = background;
    result.style.color = "white";
    result.classList.remove("fade-out");
    result.classList.add("result-visible");
    clearTimeout(result.fadeTimer);
    clearTimeout(result.clearTimer);
    result.fadeTimer = setTimeout(() => {
        result.classList.add("fade-out");
    }, duration - 400);
    result.clearTimer = setTimeout(() => {
        result.classList.remove("result-visible", "fade-out");
        result.textContent = "";
    }, duration);
}

function setSubmitLoading(isLoading) {
    if (submitLoadingTimer) {
        clearTimeout(submitLoadingTimer);
        submitLoadingTimer = null;
    }

    if (isLoading) {
        submitLoadingStart = Date.now();
        submit.classList.add('loading');
        submit.disabled = true;
        const label = submit.querySelector('.button-text');
        if (label) label.textContent = 'Creating...';
    } else {
        const elapsed = Date.now() - submitLoadingStart;
        const delay = Math.max(0, MIN_LOADING_TIME - elapsed);
        submitLoadingTimer = setTimeout(() => {
            submit.classList.remove('loading');
            submit.disabled = false;
            const label = submit.querySelector('.button-text');
            if (label) label.textContent = 'Submit';
            submitLoadingTimer = null;
        }, delay);
    }
}
    firstName.addEventListener("input", function(){
        firstSpan.textContent = "";
    });
        lastName.addEventListener("input", function(){
        lastSpan.textContent = "";
    });
    maleRadio.addEventListener("change", function(){
        sexSpan.textContent = "";
    });  
    femaleRadio.addEventListener("change", function(){
        sexSpan.textContent = "";
    });
    email.addEventListener("input", function(){
        if(email.value === "" || /^[a-zA-Z0-9._%+-]{3,}@gmail\.com$/.test(email.value)){
            emailSpan.textContent = "";
        }else{
            emailSpan.textContent = "Email should be a valid Gmail address";
            emailSpan.style.color = "red";
        }
    });
    phoneNumber.addEventListener("input", function(){
        phoneSpan.textContent = "";
    });
    password.addEventListener("input",function(){
        if(password.value === "" || /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password.value)){
            passSpan.textContent = "";
        }else{
            passSpan.textContent = "Password needs 8 characters, 1 uppercase letter, 1 number, and 1 special symbol";
            passSpan.style.color = "red";
        }
    });
    confirmPassword.addEventListener("input",function(){
        confirmSpan.textContent = "";
    });
//validate names
    function validateLastName() {
    let namePattern = "^[a-zA-Z]{3,}$";
    const regex = new RegExp(namePattern);
    if(lastName.value === ""){
        lastSpan.textContent = "Last name is required";
        lastSpan.style.color = "red";
        return false;
    } else{
        if(regex.test(lastName.value)){
            return true;
        } else {
            lastSpan.textContent = "Invalid last name";
            lastSpan.style.color = "red";
            return false;
     }
    }
   }

    function validateFirstName() {
    let namePattern = "^[a-zA-Z]{3,}$";
    const regex = new RegExp(namePattern);
    if(firstName.value === ""){
        firstSpan.textContent = "First name is required";
        firstSpan.style.color = "red";
        return false;
    } else{
        if(regex.test(firstName.value)){
        return true;
    } else {
        firstSpan.textContent = "Invalid first name";
        firstSpan.style.color = "red";
        return false;
        }
    }
   }

    function validateSex() {
    if(maleRadio.checked || femaleRadio.checked){
        return true;
    }else {
        sexSpan.textContent = "Please select a gender";
        sexSpan.style.color = "red";
        return false;
    }
   }

    function validatePhoneNumber() {
    let phoneNumberPattern = "^[0](61|62|63|65|67|68|69|71|72|73|74|75|76|78|79)[0-9]{7}$";
    const regex = new RegExp(phoneNumberPattern);
    if(phoneNumber.value === ""){
        phoneSpan.textContent = "Phone number is required";
        phoneSpan.style.color = "red";
        return false;
    } else {
        if(regex.test(phoneNumber.value)){
            return true;
        } else {
            phoneSpan.textContent = "Invalid phone number";
            phoneSpan.style.color = "red";
            return false;
        }
    }
   }

    function validateEmail() {
    let emailPattern = "^[a-zA-Z0-9._%+-]{3,}@gmail\\.com$";
    const regex = new RegExp(emailPattern);
        if(email.value === ""){
        emailSpan.textContent = "Email is required";
        emailSpan.style.color = "red";
        return false;
    }else {
        if(regex.test(email.value)){
            return true;
        } else {
            emailSpan.textContent = "Invalid email address";
            emailSpan.style.color = "red";
            return false;
        }
    }
   }
    function validatePassword() {
    let passPattern = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$";
    const regex = new RegExp(passPattern);
    if(password.value === ""){
        passSpan.textContent = "Password is required";
        passSpan.style.color = "red";
        return false;
    } else{
        if(regex.test(password.value)){
        return true;
    } else {
            passSpan.textContent = "Password needs 8 characters, 1 uppercase letter, 1 number, and 1 special symbol";
        passSpan.style.color = "red";
        return false;
        }
    }
    }

    function validateConfirmPassword() {
    if(confirmPassword.value === ""){
        confirmSpan.textContent = "This field is required";
        confirmSpan.style.color = "red";
        return false;
    } else{
        if(confirmPassword.value === password.value){
        return true;
    } else {
        if(password.value === ""){
            confirmSpan.textContent = "please enter password first";
            confirmSpan.style.color = "red";
            return false;
        }else{
            confirmSpan.textContent = "Confirmed password do not match entered password";
            confirmSpan.style.color = "red";
            return false;
            }
        }
    }
    }