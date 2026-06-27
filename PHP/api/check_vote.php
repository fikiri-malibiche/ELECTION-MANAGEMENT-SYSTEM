<?php
// /PHP/api/check_vote.php

// =============================================
// ZIMA ERRORS ZOTE
// =============================================

error_reporting(0);
ini_set('display_errors', 0);

// =============================================
// SET HEADER KWA JSON
// =============================================

header('Content-Type: application/json');

// =============================================
// ANZA SESSION
// =============================================

session_start();

// =============================================
// UNGA DATABASE
// =============================================

try {
    require_once '../connection.php';
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

// =============================================
// AUTHENTICATION CHECK
// =============================================

if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
    echo json_encode([
        'success' => false,
        'error' => 'Hujalogin'
    ]);
    exit();
}

$voter_id = $_SESSION['user_id'] ?? 0;

// =============================================
// CHECK VOTE
// =============================================

try {
    $stmt = $pdo->prepare("SELECT id, candidate_id FROM votes WHERE voter_id = ?");
    $stmt->execute([$voter_id]);
    $vote = $stmt->fetch();
    
    if ($vote) {
        echo json_encode([
            'has_voted' => true,
            'candidate_id' => $vote['candidate_id']
        ]);
    } else {
        echo json_encode([
            'has_voted' => false
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}
?>