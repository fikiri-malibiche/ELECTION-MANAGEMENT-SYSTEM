<?php
// /PHP/api/get_voters.php

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
    echo json_encode(['success' => false, 'error' => 'Hujalogin']);
    exit();
}

if ($_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Huna ruhusa']);
    exit();
}

try {
    require_once '../connection.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

try {
    $stmt = $pdo->query(
        "SELECT id, first_name, last_name, email, phone, sex, role, status, polling_station_id, created_at FROM users WHERE role = 'voter' ORDER BY last_name ASC, first_name ASC"
    );
    $voters = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'voters' => $voters
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
}
?>
