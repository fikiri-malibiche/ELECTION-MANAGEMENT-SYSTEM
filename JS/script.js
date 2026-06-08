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
        submit.value = "Creating...";
        result.style.background = "green";
        result.style.color="white";
        setTimeout(function(){
            result.textContent = "";
            submit.value = "Submit";
            result.textContent = "";
            firstName.textContent = "";
            lastName.textContent = "";
            email.textContent = "";
            password.textContent = "";

        },3000);
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
        }).then(res =>{
            if(res.status === 200){
                 result.textContent = "Account created successfully";
            }else if(res.status === 403){
                result.textContent = "please fill all fields";
            }else{
                result.textContent = "Server Error";
            }
        })
        .catch(err => {
            result.textContent ='Network error: ' + err.message;
        });
        form.submit();
    }
});
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

