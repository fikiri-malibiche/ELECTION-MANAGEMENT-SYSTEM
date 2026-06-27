<?php
// /PHP/api/vote.php

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
// METHOD CHECK
// =============================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
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

if ($_SESSION['user_role'] !== 'voter') {
    echo json_encode([
        'success' => false,
        'error' => 'Huna ruhusa ya kupiga kura'
    ]);
    exit();
}

// =============================================
// GET DATA
// =============================================

$voter_id = $_SESSION['user_id'];
$candidate_id = $_POST['candidate_id'] ?? 0;
$csrf = $_POST['csrf_token'] ?? '';
$station_id = $_SESSION['polling_station_id'] ?? null;
$ip = $_SERVER['REMOTE_ADDR'] ?? null;
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

// =============================================
// CSRF CHECK
// =============================================

if (empty($csrf) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $csrf)) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid CSRF token'
    ]);
    exit();
}


// =============================================
// VALIDATION
// =============================================

if (empty($candidate_id) || !is_numeric($candidate_id)) {
    echo json_encode([
        'success' => false,
        'error' => 'Tafadhali chagua mgombea'
    ]);
    exit();
}

// =============================================
// SAVE VOTE
// =============================================

try {
    // Check if already voted
    $stmt = $pdo->prepare("SELECT id FROM votes WHERE voter_id = ?");
    $stmt->execute([$voter_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Umeshapiga kura tayari!'
        ]);
        exit();
    }
    
    // Check if candidate exists
    $stmt = $pdo->prepare("SELECT id FROM candidates WHERE id = ?");
    $stmt->execute([$candidate_id]);
    
    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Mgombea hapatikani'
        ]);
        exit();
    }
    
// Save vote (DB should enforce UNIQUE(voter_id))
    $sql = "INSERT INTO votes (voter_id, candidate_id, polling_station_id, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute([$voter_id, $candidate_id, $station_id, $ip, $user_agent]);
    } catch (PDOException $e) {
        // If UNIQUE constraint exists, treat as already voted
        $msg = strtolower($e->getMessage());
        if (str_contains($msg, 'duplicate') || str_contains($msg, 'unique')) {
            echo json_encode([
                'success' => false,
                'error' => 'Umeshapiga kura tayari!'
            ]);
            exit();
        }
        throw $e;
    }

    echo json_encode([
        'success' => true,
        'message' => '✅ Kura yako imerekodiwa kikamilifu! Asante kwa kushiriki.'
    ]);
    
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