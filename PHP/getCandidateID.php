<?php
require "DBConnection.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $candidateName = trim($_POST['candidate_name'] ?? '');

    if ($candidateName === '') {
        die('No candidate selected.');
    }

    // Replace `candidates` and `candidate_name` with your actual table/column names.
    $sql = "SELECT candidateID FROM candidate WHERE candidate_name = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$candidateName]);
    $candidate = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($candidate) {
        $candidateId = $candidate['candidateID'];
        echo "Selected candidate ID: " . htmlspecialchars($candidateId);
    } else {
        echo "Candidate not found for: " . htmlspecialchars($candidateName);
    }
}
?>