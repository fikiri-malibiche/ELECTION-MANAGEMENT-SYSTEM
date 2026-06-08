const samia = document.getElementById("image1");
const lisu = document.getElementById("image2");
const message = document.getElementById("notification1");
const message2 = document.getElementById("notification2");
const candidateInput = document.getElementById("candidate_name");
const userInput = document.getElementById("userID");
const form = document.getElementById("form");
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");
const popupClose = document.getElementById("popupClose");
const hiddenInput = document.getElementById("candidate_name");

function showPopup(text) {
    popupMessage.textContent = text;
    popup.classList.remove("popup-hidden");
    popup.classList.add("popup-visible");
}

popupClose.addEventListener("click", function() {
    popup.classList.add("popup-hidden");
    popup.classList.remove("popup-visible");
});

samia.addEventListener("click", function() {
    message.textContent = "Selected";
    message2.textContent = "";
    hiddenInput.value = "samia s. hassan";
});

lisu.addEventListener("click", function() {
    message2.textContent = "Selected";
    message.textContent = "";
    hiddenInput.value = "tundu a. lissu";
});

function validateInput(){
    if(hiddenInput.value === ""){
        return false;
    }
    return true;
}
form.addEventListener("submit", function(event) {
    event.preventDefault();
    // Send via fetch to Voting.php
    if(!validateInput()){
        showPopup("please select candidate!!!!");
    }else{
        const candidate_name = {
            candidate_name: hiddenInput.value
        };
        fetch('/PHP/Voting.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(candidate_name)
        }).then(res =>{
            if(res.status === 200){
                showPopup("Voter for "+hiddenInput.value+" is recorded");
            }else if(res.status === 403){
                showPopup("You have already vote");
            }else if(res.status === 404){
                showPopup("Candidate is not found");
            }else if(res.status === 500){
                showPopup("Database connectin failed");
            }else{
                showPopup("Server Error");
            }
        })
        .catch(err => {
            showPopup('Network error: ' + err.message);
        });
    }
});
