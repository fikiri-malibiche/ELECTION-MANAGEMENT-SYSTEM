<?php
require "DBConnection.php";
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'ACCESS DENIED']);
    exit;
}

// Accept JSON or form-encoded POST
$input = json_decode(file_get_contents('php://input'), true);
$candidate_id = null;
$candidate_name = null;
if (is_array($input)) {
    $candidate_id = $input['candidate_id'] ?? null;
    $candidate_name = $input['candidate_name'] ?? null;
} else {
    $candidate_id = $_POST['candidate_id'] ?? null;
    $candidate_name = $_POST['candidate_name'] ?? null;
}

// session 
$userID = $_SESSION['userID'] ?? ($input['userID'] ?? $_POST['userID'] ?? null);

if (!$userID) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

if (!$candidate_id) {
    if (!$candidate_name) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No candidate specified']);
        exit;
    }
    $sql = "SELECT candidateID FROM candidate WHERE candidate_name = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$candidate_name]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Candidate not found']);
        exit;
    }
    $candidate_id = $row['candidateID'];
}

try {
    $sql = "INSERT INTO candidate_has_vote(candidateID,userID) VALUES(?,?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$candidate_id, $userID]);
    echo json_encode(['success' => true, 'message' => 'Vote recorded']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>