<?php
// /PHP/api/get_vote_details.php

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
    $sql = "
        SELECT
            v.id,
            CONCAT(u.first_name, ' ', u.last_name) AS voter_name,
            u.email AS voter_email,
            u.phone AS voter_phone,
            c.full_name AS candidate_name,
            c.party AS candidate_party,
            v.polling_station_id,
            v.ip_address,
            v.user_agent
        FROM votes v
        JOIN users u ON v.voter_id = u.id
        JOIN candidates c ON v.candidate_id = c.id
        ORDER BY v.id DESC
    ";

    $stmt = $pdo->query($sql);
    $votes = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'votes' => $votes
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
}
?>