const samia = document.getElementById("image1");
const lisu = document.getElementById("image2");
const message = document.getElementById("notification1");
const message2 = document.getElementById("notification2");
const candidateInput = document.getElementById("candidate_name");
const form = document.getElementById("form");
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");
const popupClose = document.getElementById("popupClose");

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
    candidateInput.value = samia.dataset.candidateName;
});
lisu.addEventListener("click", function() {
    message2.textContent = "Selected";
    message.textContent = "";
    candidateInput.value = lisu.dataset.candidateName;
});
form.addEventListener("submit", function(event) {
    event.preventDefault();
    if (message.textContent === "Selected") {
        showPopup("You have selected Samia S. Hassan");
    } else if (message2.textContent === "Selected") {
        showPopup("You have selected Tundu A. Lissu");
    } else {
        showPopup("Please select a candidate before submitting the form.");
        return;
    }
    if (candidateInput.value !== "") {
        form.submit();
    }
});