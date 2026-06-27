<?php
// /PHP/get_voter_count.php
// Hii inarudisha idadi ya wapiga kura

session_start();
require_once 'connection.php';

header('Content-Type: application/json');

// Angalia kama user amelogin
if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
    echo json_encode(['count' => 0, 'error' => 'Not logged in']);
    exit();
}

try {
    // Jumla ya wapiga kura (count only approved voters)
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'voter' AND status = 'approved'");
    $count = $stmt->fetchColumn();
    
    echo json_encode([
        'success' => true,
        'count' => (int)$count
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'count' => 0,
        'error' => $e->getMessage()
    ]);
}
?>