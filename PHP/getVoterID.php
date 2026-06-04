<?php
require "DBConnection.php";
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST required']);
    exit;
}

$username = trim($_POST['username'] ?? '');
if ($username === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username is required']);
    exit;
}

$sql = "SELECT userID FROM user WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

echo json_encode(['success' => true, 'userID' => $user['userID'], 'username' => $username]);
?>
