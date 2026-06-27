<?php
// /PHP/get_candidate_count.php
// Hii inarudisha idadi ya wagombea

session_start();
require_once 'connection.php';

header('Content-Type: application/json');

// Angalia kama user amelogin
if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
    echo json_encode(['count' => 0, 'error' => 'Not logged in']);
    exit();
}

try {
    // Jumla ya wagombea
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM candidates");
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