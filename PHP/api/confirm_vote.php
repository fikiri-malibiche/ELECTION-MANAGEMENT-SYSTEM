<?php
// /PHP/api/confirm_vote.php

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
    echo json_encode(['success' => false, 'error' => 'Hujalogin']);
    exit();
}

if ($_SESSION['user_role'] !== 'voter') {
    echo json_encode(['success' => false, 'error' => 'Huna ruhusa ya kupiga kura']);
    exit();
}

try {
    require_once '../connection.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

$voter_id = $_SESSION['user_id'];
$candidate_id = $_POST['candidate_id'] ?? 0;
$password = $_POST['password'] ?? '';
$csrf = $_POST['csrf_token'] ?? '';

// =============================================
// CSRF CHECK
// =============================================

if (empty($csrf) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $csrf)) {
    echo json_encode(['success' => false, 'error' => 'Invalid CSRF token']);
    exit();
}


if (empty($candidate_id) || !is_numeric($candidate_id)) {
    echo json_encode(['success' => false, 'error' => 'Tafadhali chagua mgombea']);
    exit();
}

if (empty($password)) {
    echo json_encode(['success' => false, 'error' => 'Tafadhali ingiza password yako']);
    exit();
}

try {
    // Verify password
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ? AND role = 'voter'");
    $stmt->execute([$voter_id]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password'])) {
        echo json_encode(['success' => false, 'error' => 'Password si sahihi']);
        exit();
    }

    // Check if already voted
    $s = $pdo->prepare("SELECT id FROM votes WHERE voter_id = ?");
    $s->execute([$voter_id]);
    if ($s->rowCount() > 0) {
        echo json_encode(['success' => false, 'error' => 'Umeshapiga kura tayari!']);
        exit();
    }

    // Check candidate exists
    $s2 = $pdo->prepare("SELECT id FROM candidates WHERE id = ?");
    $s2->execute([$candidate_id]);
    if ($s2->rowCount() === 0) {
        echo json_encode(['success' => false, 'error' => 'Mgombea hapatikani']);
        exit();
    }

    // Insert vote (DB should enforce UNIQUE(voter_id))
    $station_id = $_SESSION['polling_station_id'] ?? null;
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $sql = "INSERT INTO votes (voter_id, candidate_id, polling_station_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)";
    $ins = $pdo->prepare($sql);
    try {
        $ins->execute([$voter_id, $candidate_id, $station_id, $ip, $ua]);
    } catch (PDOException $e) {
        $msg = strtolower($e->getMessage());
        if (str_contains($msg, 'duplicate') || str_contains($msg, 'unique')) {
            echo json_encode(['success' => false, 'error' => 'Umeshapiga kura tayari!']);
            exit();
        }
        throw $e;
    }

    echo json_encode(['success' => true, 'message' => '✅ Kura yako imerekodiwa kwa usahihi! Asante.']);
    exit();


} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
}
