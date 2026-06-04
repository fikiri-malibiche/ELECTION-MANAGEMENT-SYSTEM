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

function showPopup(text) {
    popupMessage.textContent = text;
    popup.classList.remove("popup-hidden");
    popup.classList.add("popup-visible");
}

popupClose.addEventListener("click", function() {
    popup.classList.add("popup-hidden");
    popup.classList.remove("popup-visible");
});

function selectCandidate(card) {
    const id = card.dataset.candidateId;
    const name = card.dataset.candidateName;
    candidateInput.value = name;
    document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
}

samia.addEventListener("click", function() {
    selectCandidate(samia);
    message.textContent = "Selected";
    message2.textContent = "";
});

lisu.addEventListener("click", function() {
    selectCandidate(lisu);
    message2.textContent = "Selected";
    message.textContent = "";
});

form.addEventListener("submit", function(event) {
    event.preventDefault();
    if (!candidateInput.value) {
        showPopup("Please select a candidate before submitting the form.");
        return;
    }

    const selectedCard = document.querySelector('.candidate-card.selected');
    if (!selectedCard) {
        showPopup("Please select a candidate.");
        return;
    }

    const candidateId = selectedCard.dataset.candidateId;
    const candidateName = selectedCard.dataset.candidateName;
    const userID = userInput.value || null;

    // Send via fetch to Voting.php
    fetch('/PHP/Voting.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candidateId, candidate_name: candidateName, userID: userID })
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              showPopup('Vote recorded successfully');
          } else {
              showPopup('Error: ' + data.message);
          }
      }).catch(err => {
          showPopup('Network error: ' + err.message);
      });
});
