<?php
// /PHP/api/delete_candidate.php
// API - Kufuta mgombea

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
session_start();

// =============================================
// AUTHENTICATION CHECK
// =============================================

if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
    echo json_encode(['success' => false, 'error' => 'Hujalogin']);
    exit();
}

if ($_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Huna ruhusa']);
    exit();
}

// =============================================
// UNGA DATABASE
// =============================================

try {
    require_once '../connection.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

// =============================================
// GET DATA
// =============================================

$input = json_decode(file_get_contents('php://input'), true);
$candidate_id = $input['id'] ?? 0;
$csrf = $input['csrf_token'] ?? '';

// =============================================
// CSRF CHECK
// =============================================

if (empty($csrf) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $csrf)) {
    echo json_encode(['success' => false, 'error' => 'Invalid CSRF token']);
    exit();
}


if (empty($candidate_id) || !is_numeric($candidate_id)) {
    echo json_encode(['success' => false, 'error' => 'Candidate ID not valid']);
    exit();
}

// =============================================
// DELETE CANDIDATE
// =============================================

try {
    // Check if candidate exists
    $stmt = $pdo->prepare("SELECT id FROM candidates WHERE id = ?");
    $stmt->execute([$candidate_id]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'error' => 'Mgombea hapatikani']);
        exit();
    }

    // Delete candidate
    $stmt = $pdo->prepare("DELETE FROM candidates WHERE id = ?");
    $stmt->execute([$candidate_id]);

    echo json_encode([
        'success' => true,
        'message' => 'Mgombea amefutwa kikamilifu!'
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>