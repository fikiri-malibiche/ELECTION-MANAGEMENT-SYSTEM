<?php
// /PHP/api/verify_user.php

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

$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['user_id'] ?? 0;
$action = $input['action'] ?? '';
$assignRole = trim($input['role'] ?? 'voter');
$csrf = $input['csrf_token'] ?? '';

// =============================================
// CSRF CHECK
// =============================================
if (empty($csrf) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $csrf)) {
    echo json_encode(['success' => false, 'error' => 'Invalid CSRF token']);
    exit();
}


if (empty($userId) || !is_numeric($userId)) {
    echo json_encode(['success' => false, 'error' => 'User ID not valid']);
    exit();
}

if (!in_array($action, ['approve', 'reject'], true)) {
    echo json_encode(['success' => false, 'error' => 'Action must be approve or reject']);
    exit();
}

$allowedRoles = ['voter', 'manager'];
if ($action === 'approve' && !in_array($assignRole, $allowedRoles, true)) {
    echo json_encode(['success' => false, 'error' => 'Invalid role selected']);
    exit();
}

$status = $action === 'approve' ? 'active' : 'rejected';

try {
    $stmt = $pdo->prepare("SELECT id, status FROM users WHERE id = ?");
    $stmt->execute([$userId]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit();
    }

    if ($action === 'approve') {
        // Keep the approved status for voters so the card reflects correct counts
        $status = 'approved';
        $stmt = $pdo->prepare("UPDATE users SET status = ?, role = ? WHERE id = ?");
        $stmt->execute([$status, $assignRole, $userId]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
        $stmt->execute([$status, $userId]);
    }
    // Return updated counts so frontend can display DB-accurate values immediately
    $totalVoters = 0;
    $pendingVoters = 0;
    try {
        $s1 = $pdo->query("SELECT COUNT(*) as cnt FROM users WHERE role = 'voter' AND status = 'approved'");
        $totalVoters = (int)$s1->fetchColumn();
    } catch (Exception $e) {
        $totalVoters = 0;
    }
    try {
        $s2 = $pdo->query("SELECT COUNT(*) as cnt FROM users WHERE role = 'voter' AND status IN ('pending', '')");
        $pendingVoters = (int)$s2->fetchColumn();
    } catch (Exception $e) {
        $pendingVoters = 0;
    }

    echo json_encode([
        'success' => true,
        'message' => 'User status updated successfully',
        'status' => $status,
        'total_voters' => $totalVoters,
        'pending_voters' => $pendingVoters
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
}
?>