<?php
require "DBConnection.php";
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST required']);
    exit;
}

$candidateName = trim($_POST['candidate_name'] ?? '');
if ($candidateName === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No candidate selected']);
    exit;
}

$sql = "SELECT candidateID FROM candidate WHERE candidate_name = ?";
$stmt = $conn->prepare($sql);
$stmt->execute([$candidateName]);
$candidate = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$candidate) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Candidate not found']);
    exit;
}

echo json_encode(['success' => true, 'candidateID' => $candidate['candidateID'], 'candidate_name' => $candidateName]);
?>
