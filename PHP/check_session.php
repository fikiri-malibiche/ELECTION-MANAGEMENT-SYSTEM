<?php
// /PHP/check_session.php
session_start();

// =============================================
// ANGAZIA KAMA USER AMELOGIN
// =============================================

if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
    // Kama hajalogin, elekezwa kwenye login
    header('Location: ../HTML/loginForm.html');
    exit();
}

// =============================================
// PATA DATA ZA USER
// =============================================

$user_id = $_SESSION['user_id'] ?? null;
$user_name = $_SESSION['user_name'] ?? 'User';
$user_email = $_SESSION['user_email'] ?? '';
$user_role = $_SESSION['user_role'] ?? 'voter';

// Role labels
$role_labels = [
    'voter' => '🗳️ Mpiga Kura',
    'manager' => '📋 Msimamizi',
    'admin' => '🔐 Admin'
];
$role_display = $role_labels[$user_role] ?? $user_role;

// =============================================
// FUNCTIONS ZA KUANGALIA ROLE
// =============================================

function isAdmin() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
}

function isManager() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'manager';
}

function isVoter() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'voter';
}

function getUserRole() {
    return $_SESSION['user_role'] ?? 'voter';
}

function getUserName() {
    return $_SESSION['user_name'] ?? 'User';
}
?>