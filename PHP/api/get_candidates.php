<?php
// /PHP/api/get_candidates.php

// =============================================
// ZIMA ERRORS ZOTE (Ili kuepuka HTML output)
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

// =============================================
// GET CANDIDATES
// =============================================

try {
    $stmt = $pdo->query("
        SELECT 
            id,
            full_name,
            party,
            party_logo,
            position,
            bio,
            photo_url
        FROM candidates
        ORDER BY full_name ASC
    ");
    
    $candidates = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'candidates' => $candidates
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